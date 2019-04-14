#! /usr/bin/env python

import argparse
import os
import urllib
import xml.etree.ElementTree as ET
import tarfile
import tempfile
import json
import re
from glob import glob
from shutil import copyfile

gt_catalog_dir = '~/.local/share/gthumb/catalogs'
gt_catalog_dir = os.path.expanduser(gt_catalog_dir)

def get_cat_name(cat_file):
    m = re.search('([^/]+)\.catalog$', cat_file)
    if m is not None:
        return m.group(1)
    else:
        return cat_file

def get_catalogs():
    dict = {}
    catalogs = glob(gt_catalog_dir +  '/*.catalog')
    i = 0
    for cat_file in catalogs:
        i = i + 1
        name = get_cat_name(cat_file)
        dict[i] = { "name": name, "file": cat_file }
    return dict

def read_catalog(cat_name, cat_file):
    pics = [];
    root = ET.parse(cat_file).getroot()
    files_tag = root.find('files')
    pics = []
    count = 0
    for f in files_tag.findall('file'):
        count = count + 1
        pic_path = urllib.unquote(f.get('uri'))[7:]
        if os.path.isfile(pic_path):                    # skip removed pics
            arcname = cat_name + "/" + str(count) + os.path.splitext(pic_path)[1]
            pics.append({ 'file': pic_path, 'arcname': arcname })
    return pics

def create_json(cat_name, pics):
    pix = []
    for pic in pics:
        pix.append(pic['arcname'])
    d = { 'name': cat_name,
          'type': 'slideshow catalog',
          'showDuration': 5000,
          'autoForward': "false",
          'animation': "RANDOM",
          'animDuration': 2000,
          'pics': pix }
    json_str = json.dumps(d, indent=4)
    json_str = json_str.replace('"false"', "false")
    json_str = json_str.replace('"true"', "true")
    f = tempfile.NamedTemporaryFile(delete=False)
    f.write(json_str)
    f.close()
    return f.name

#def create_tar(tar_name, pics, json_file, json_name):
def create_tar(tar_name, pics):
    tar = tarfile.open(tar_name, "w")
    #tar.add(json_file, json_name)
    for pic in pics:
        tar.add(pic['file'], pic['arcname'])
    tar.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export gThumb catalogs. Script asks interactively for required input.")
    args = parser.parse_args()

    catalogs = get_catalogs()
    num_catalogs = len(catalogs)
    if num_catalogs > 0:
        print "Found %d gThumb catalogs:\n" % num_catalogs
        for i in catalogs:
            print "(%d) %s" % (i, catalogs[i]['name'])
        try:
            selected=int(raw_input('\nWhich catalog do you want to export (type number)? '))
            if (selected < 1 or selected > num_catalogs):
                print "\nSorry, no such catalog exists!\n"
            else:
                cat_name = catalogs[selected]['name']
                print "\nThanks, you selected catalog number %d" % selected
                print "Exporting catalog '%s'...\n" % cat_name
                print "The exported catalog will be stored in your home directory!\n"
                pics = read_catalog(cat_name, catalogs[selected]['file'])
                if len(pics) > 0:
                    tar_name = os.path.expanduser('~/' + cat_name + '.tar')
                    #json_name = 'pics.json'
                    #json_file = create_json(cat_name, pics)
                    #create_tar(tar_name, pics, json_file, json_name)
                    create_tar(tar_name, pics)
                    #os.unlink(json_file)
                    print "Exported gThumb catalog to %s\n" % tar_name
                else:
                    print "Sorry, catalog is empty! Nothing to export.\n"
        except ValueError:
            print "\nSorry, that's no number!\n"
    else:
        print "Sorry, no catalogs found.\n"

