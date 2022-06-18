from flask import (
    Flask,
    flash,
    render_template,
    request,
    url_for,
    session,
    redirect,
    jsonify,
    send_from_directory,
)
from werkzeug.utils import secure_filename

import os
from pathlib import Path
from datetime import datetime
import subprocess

from PIL import Image, ExifTags
from PIL.TiffImagePlugin import IFDRational


UPLOAD_FOLDER = Path(__file__).parent.parent / "images"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 40 * 1024 * 1024  # 40MB
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["EXECUTABLES_PATH"] = "bin/"

os.environ['PATH'] = f"{os.path.abspath(app.config['EXECUTABLES_PATH'])}:{os.environ['PATH']}"

app.secret_key = b"T\t8\xae\xac\xfb8\xd2\xd1\xaeU\x80J^&\x12"

ALLOWED_EXTENSIONS = set(["jpg", "jpeg", "tif", "tiff"])


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return redirect(url_for("run_lpa"))


@app.route("/lpa")
def run_lpa():
    return render_template("upload.html")


@app.route("/upload", methods=["GET", "POST"])
def upload():

    if request.method == "POST":

        img_list = []
        for key, f in request.files.items():
            if key.startswith("img"):
                img_list.append(f)

        if len(img_list) > 0:
            result_upload = upload_photos(img_list)
            if isinstance(result_upload, dict):
                print("ERRRO!")
                # An error occurred
                return jsonify(result_upload)

            session["input_images"] = result_upload[0]
            session["exif_images"] = result_upload[1]

        resp = {}
        resp["status"] = "success"
        return jsonify(resp)

    else:
        return render_template("upload.html")


@app.route("/form", methods=["POST"])
def handle_form():

    try:
        f = request.files["rsp"]
        filename = secure_filename(f.filename)
        rsp_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        f.save(rsp_path)
    except:
        filename = datetime.today().strftime("%Y%m%d%H%M%S")
        rsp_path = os.path.join(app.config["UPLOAD_FOLDER"], filename) + ".rsp"

    print(rsp_path)
    session["rsp_path"] = os.path.join("images", os.path.basename(rsp_path))

    align = request.form.get("align") is not None
    flare = request.form.get("flare") is not None
    ghost = request.form.get("ghost") is not None

    out_name = os.path.join(
        app.config["UPLOAD_FOLDER"], datetime.today().strftime("%Y%m%d%H%M%S")
    )

    res_hdrgen = run_hdrgen(
        session["input_images"],
        rsp_path,
        align,
        flare,
        ghost,
        out_name,
        [".tif", '.jpg']
    )

    if isinstance(res_hdrgen, dict):
        # An error occurred
        return jsonify(res_hdrgen)

    session["hdr_file"] = os.path.join("images", os.path.basename(out_name))
    session["hdrgen_output"] = res_hdrgen

    # session['luminance'] = get_luminance(out_name)
    get_luminance(out_name)

    # res_falsecolor = ra_falsecolor(out_name)
    # if isinstance(res_falsecolor, dict):
    #     # An error occurred
    #     return jsonify(res_falsecolor)

    resp = {}
    resp["status"] = "success"
    return jsonify(resp)


@app.route("/results")
def results():
    return render_template("results.html")


@app.route("/analyze")  # , methods=['GET', 'POST'])
def falsecolor():
    return render_template("falsecolor.html")

    if request.method == "POST":
        #     $display = '';
        # if($_POST["display"] === "cb"){
        # $display = '-cb';
        # }elseif($_POST["display"] === "cl"){
        # $display = '-cl';
        # }

        # $palette = $_POST["palette"];

        # if( isset($_POST["points"])){
        # $epoints = "-e";
        # }else{
        # $epoints = "";
        # }

        # $ndivs = $_POST["ndivs"];
        # $scale = $_POST["scale"];

        # $multiplier = $_POST["mult"];
        # $mapping = '';
        # if($_POST["map"] === "log"){
        # $mapping = "-log " . $_POST["log_value"];
        # }
        pass
    else:
        return render_template("falsecolor.html")


@app.route("/images/<filename>")
def send_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


def run_hdrgen(
    input_imgs,
    rsp,
    align,
    flare,
    ghost,
    output_name,
    output_formats=[".tif", ".exr", ".jpg"],
):
    """Run hdrgen and necessary other tools on the os system"""

    hdrgen = os.path.join("hdrgen")
    cmd_list = [hdrgen, "-m", "400"]
    cmd_list.extend(input_imgs)
    cmd_list.extend(["-r", rsp, "-o", output_name + ".hdr"])

    if not align:
        cmd_list.append("-a")
    if flare:
        cmd_list.append("-f")
    if ghost:
        cmd_list.append("-g")

    print(subprocess.list2cmdline(cmd_list))
    hdrgen_process = subprocess.run(
        cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    if hdrgen_process.returncode != 0:
        resp = {}
        resp["msg"] = (
            "hdrgen returned the following error:<br>"
            + hdrgen_process.stderr.split("*")[-1]
        )
        resp["status"] = "error"
    else:
        hdrcvt = os.path.join("hdrcvt")
        for ext in output_formats:
            cmd_list = [
                hdrcvt,
                "-quality",
                "100",
                output_name + ".hdr",
                output_name + ext,
            ]
            hdrcvt_process = subprocess.run(
                cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
            )
            if hdrcvt_process.returncode != 0:
                resp = {}
                resp["msg"] = "hdrcvt returned error: " + hdrcvt_process.stderr
                resp["status"] = "error"
                return resp

        resp = hdrgen_process.stderr

    # cmd_list = [hdrcvt, "-quality", "100", '-scale', '0.5', output_name + '.hdr', output_name + "s.hdr"]
    # hdrcvt_process = subprocess.run(cmd_list,
    #                     stdout=subprocess.PIPE,
    #                     stderr=subprocess.PIPE,
    #                     text=True
    #                     )

    return resp


def get_luminance(hdr_input):
    """Extract luminance values from hdr image"""

    ra_xyze = 'ra_xyze' # os.path.join(app.config["EXECUTABLES_PATH"], "ra_xyze")
    pvalue = 'pvalue' # os.path.join(app.config["EXECUTABLES_PATH"], "pvalue")

    cmd_list = [ra_xyze, "-o", hdr_input + ".hdr"]
    print(subprocess.list2cmdline(cmd_list))
    ra_process = subprocess.Popen(cmd_list, stdout=subprocess.PIPE)
    cmd_list = [pvalue, "+H", "-h", "-d", "-b", "+o"]

    print(subprocess.list2cmdline(cmd_list))
    # save to file for latter plottling
    txt_file = hdr_input + ".lumi"
    with open(txt_file, "w") as f:
        subprocess.run(cmd_list, stdin=ra_process.stdout, stdout=f)
    ra_process.wait()

    # save a readable version
    cmd_list = [ra_xyze, "-o", hdr_input + ".hdr"]
    print(subprocess.list2cmdline(cmd_list))
    ra_process = subprocess.Popen(cmd_list, stdout=subprocess.PIPE)
    cmd_list = [pvalue, "-b", "+o"]
    print(subprocess.list2cmdline(cmd_list))

    txt_file = hdr_input + "_brightness.txt"
    with open(txt_file, "w") as f:
        subprocess.run(cmd_list, stdin=ra_process.stdout, stdout=f)

    print("Finished luminace generation")

    return True


def ra_falsecolor(
    hdr_input,
    param_list=[
        "-s",
        "a",
        "-log",
        "3",
        "-e",
        "-n",
        "10",
    ],
):
    """run radiance falsecolor conversion"""

    falsecolor = "falsecolor" #os.path.join(app.config["EXECUTABLES_PATH"], "falsecolor")

    cmd_list = [falsecolor] + param_list + ["-i", hdr_input + ".hdr"]

    print(subprocess.list2cmdline(cmd_list))
    with open(hdr_input + "_fc.hdr", "w") as f:
        falsecolor_process = subprocess.run(cmd_list, stdout=f, stderr=subprocess.PIPE)

    if falsecolor_process.returncode != 0:
        resp = {}
        print("falsecolor error")
        resp["status"] = "error"
        resp["msg"] = "False color failed: " + falsecolor_process.stderr
        return resp

    hdrcvt = "hdrcvt" # os.path.join(app.config["EXECUTABLES_PATH"], "hdrcvt")
    cmd_list = [hdrcvt, "-quality", "100", hdr_input + "_fc.hdr", hdr_input + "_fc.jpg"]
    print(subprocess.list2cmdline(cmd_list))
    hdrcvt_process = subprocess.run(
        cmd_list, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    if hdrcvt_process.returncode != 0:
        resp = {}
        resp["msg"] = "hdrcvt returned error: " + hdrcvt_process.stderr
        resp["status"] = "error"

    return True


def upload_photos(imgs):
    """check photos pre-requisits and upload"""

    resp = {}
    input_images = []
    exif_images = []

    if len(imgs) < 2:
        resp["msg"] = "Needs more than one image"
        resp["status"] = "error"
        return resp

    for img in imgs:
        if not allowed_file(img.filename):
            resp["msg"] = (
                "Wrong input image (" + img.filename + "). Use jpg, jpeg or tiff. </br>"
            )
            resp["status"] = "error"
            return resp

        exif_info = check_exif(img)
        if not exif_info:
            resp["msg"] = (
                "Image "
                + img.filename
                + " doesn't have a proprer EXIF header to process. \
            Make sure it is from a camera."
            )
            resp["status"] = "error"
            return resp

        filename = secure_filename(img.filename)
        img_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        img.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        input_images.append(os.path.join("images", os.path.basename(img_path)))
        exif_images.append(exif_info)

    return input_images, exif_images


def check_exif(image):
    """Check if image has EXIF required camera informations

    The necessary info is : Exposure, Apperture and ISO

    Returns
    -------
    bool or dict:
        False, if does not have minumim info
        dict with exif info, else
    """

    required_tags = ["ExposureTime", "FNumber", "ISOSpeedRatings"]

    get_tags = [
        "Make",
        "Model",
        "DateTime",
        "ExposureTime",
        "FNumber",
        "ISOSpeedRatings",
        "ShutterSpeedValue",
        "ApertureValue",
        "FocalLength",
    ]

    info = get_exif_dict(image)

    if info is None:
        return False

    for rtag in required_tags:
        if rtag not in info.keys():
            return False

    summary_info = {}
    for tag in get_tags:
        if tag in info.keys():
            if isinstance(info[tag], IFDRational):
                summary_info[tag] = float(info[tag])
            else:
                summary_info[tag] = info[tag]

    # for k, v in summary_info.items():
    #     print("{}: {} ({})".format(k, v, type(v)))

    # print("*"*100)
    # print(summary_info)
    return summary_info


def get_exif_dict(filepath):

    """
    Get EXIF info and convert to a dictionary
    indexed by the name.
    """

    image = Image.open(filepath)

    exif_data_PIL = image._getexif()

    if exif_data_PIL is None:
        return None

    exif_data = {}

    for k, v in ExifTags.TAGS.items():

        if k in exif_data_PIL:
            exif_data[v] = exif_data_PIL[k]

    filepath.seek(0)

    return exif_data


# def treat_exif_values(exif_dict):
#     """convert values in exif to conventional formats

#     The exif that is extracted with PIL has float values as
#     PIL.TiffImagePlugin.IFDRational, this converts it float.

#     Parameters
#     ----------
#     exif_dict : dict
#         dictionarie where key is the name of the property
#     """

#     for k, v in exif_dict.items():
#         if isinstance(v, IFDRational):
#             exif_dict[k] = float(v)

#     return exif_dict
