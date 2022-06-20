# Light Photo Analizer

The Light Photo Analyzer was created with inspiration by the project of  Dr. Jacobs (http://www.jaloxa.eu). It was conceptualized by the IluminArq - Grupo de Pesquisa em Iluminação Aplicada à Arquitetura (Unicamp) in patternship with [LIV](https://www.liv.ic.unicamp.br/) - Visual Informatics Laboratory 

The HDR generation uses [hdrgen](http://www.anyhere.com/) from Greg Ward and tools from [radiance](https://radiance-online.org/)

A live version is hosted in heroku: https://light-photo-analyzer.herokuapp.com/

An older PHP version is running in https://www.liv.ic.unicamp.br/HDR/.

This is still a work in progress and efforts will be made to make the instalation more friendly.

## Install instructions 

This are the instructions for development instalation in linux environment.

- Get this code (via git clone or download)

- Install it

```shell
        $ python -m venv venv
        $ source venv/bin/activate
        $ pip install .
```

- Download hdrgen from (http://www.anyhere.com/)
- Copy the contents of the bin folder to `venv/bin/`
- Download randiance from (https://github.com/LBNL-ETA/Radiance/releases)
- Copy 'pvalue' and 'ra_xyze' from `radiance-[version]/usr/local/radiance/bin/` to `venv/bin/`

To facilitate the deployment these files are placed in this repo [bin folder](bin/), but the copyright is to their respective owners

## Run server

```shell
    $ gunicorn -w 4 light_photo_analyzer:app
```
