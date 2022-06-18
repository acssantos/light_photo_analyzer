# Light Photo Analizer

The Light Photo Analyzer was created with inspiration by the project of  Dr. Jacobs [jaloxa](www.jaloxa.eu). It was conceptualized by the IluminArq - Grupo de Pesquisa em Iluminação Aplicada à Arquitetura (Unicamp) in patternship with [LIV](https://www.liv.ic.unicamp.br/) - Visual Informatics Laboratory 

The HDR generation uses [hdrgen](http://www.anyhere.com/) from Greg Ward and tools from [radiance](https://radiance-online.org/)

An older PHP version is running in [https://www.liv.ic.unicamp.br/HDR/](https://www.liv.ic.unicamp.br/HDR/).

This is still a work in progress and efforts will be made to make the instalation more friendly.

## Install instructions 

This are the instructions for development instalation in linux environment.

- Get this code (via git clone or download)

- Install it

```shell
        $ python -m venv lpa_venv
        $ source lpa_venv/bin/activate
        $ pip install .  
```

- Download hdrgen from (http://www.anyhere.com/)
- Copy the contents of the bin folder to `venv/bin/`
- Download randiance from (https://github.com/LBNL-ETA/Radiance/releases)
- Copy 'pvalue' and 'ra_xyze' from `radiance-[version]/usr/local/radiance/bin/` to `venv/bin/`

## Run server

```shell
    $ export FLASK_APP=hello
    $ flask run
```
