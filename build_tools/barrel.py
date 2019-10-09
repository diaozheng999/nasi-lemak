######################################################################
# barrel.py
# Author: Diao Zheng
# --------------------------------------------------------------------
# Barreling utility for MyM1 React Native typescript implementation.
#
# Place "@barrel ignore" in header comment in index.ts for a directory
# if the directory should not have a generated index.ts
#
# Place "@barrel export all" in a header file if the file exports 
# multiple objects.
#
# Place "@barrel hook" in a header comment if the file should be
# exporting as a React hook, i.e. getting symbol `useFile` from `File.ts`
#
# It's assumed that:-
#   - All .ts files contain an export that is the same as the name 
#     of the file.
#
#   - All .ts files with "@barrel export all" have all exports
#     exported under an object with the same name as the file.
#
#   - Directory values in IGNORED_DIRECTORIES are ignored.
#
#   - ".json" files are ignored.
#
#   - All files to be barreled contain a file extension ".ts" or 
#     ".tsx". The file name should be of form <ExportedObjectName>.ts
#     or <ExportedObjectName>.tsx. tslint is used to enforce file
#     naming.
######################################################################

import os

SOURCE_ROOT = 'src'
IGNORED_DIRECTORIES = [
  "__mocks__", # jest mock implementations
  "__tests__", # jest tests
  "__snapshots__", # jest snapshots
  "Resources"
]


def clean(directory):
  print "Cleaning %s"%directory
  files = os.listdir(directory)

  clean_directory = False

  if "index.ts" in files:
    clean_directory = True
    with open(directory+"/index.ts", "r") as f:
      for line in f:
        if "@barrel ignore" in line:
          clean_directory = False

  if clean_directory:
    os.remove(directory+"/index.ts")
  
  for subdir in files:
    if os.path.isdir(directory+"/"+subdir) and subdir not in IGNORED_DIRECTORIES:
      clean(directory+"/"+subdir)


def barrel(directory, prefix=""):
  print "Barrelling %s"%directory

  files = os.listdir(directory)
  barrel_directory = True
  
  index_ts =  """// tslint:disable:file-name-casing file-header

// GENERATED CODE: DO NOT EDIT

"""
  to_barrel = []

  if "index.ts" in files:
    with open(directory+"/index.ts", "r") as f:
      for line in f:
        if "@barrel ignore" in line:
          barrel_directory = False
  

  static_exports = set()

  for filename in files:
    obj_name = filename

    if (not os.path.isdir(directory+"/"+filename) and not ( 
      filename.endswith(".ts") or
      filename.endswith(".tsx")
    )) or filename in IGNORED_DIRECTORIES:
      print "Skipping %s"%filename
      continue

    if filename != "index.ts":
      if not (filename.endswith(".ts") or filename.endswith(".tsx")):
        if barrel(directory+"/"+filename):
          to_barrel += [(obj_name, "*", "", [obj_name], [])]  
      else:
        obj_name = filename.replace(".tsx", "").replace(".ts", "")

        with open(directory+"/"+filename, "r") as f:
          export_all = False
          export_as_hook = False
          other_exports = set()
          ignore_export = False
          docstring = ""
          for line in f:
            if "@barrel ignore" in line:
              ignore_export = True
            if "@barrel export all" in line:
              export_all = True
            elif "@barrel export" in line:
              exports = line.split("@barrel export ")[-1].split(",")
              for token in exports:
                other_exports.add(token.strip())

            if "@barrel hook" in line:
              export_as_hook = True
            
            if "@barrel static" in line:
              ignore_export = True
              static_exports.add(directory + "/" + filename)

            if "@barrel stylesheet" in line:
              other_exports.add("I%sStyleSheet"%(obj_name,))

            if "@barrel component" in line:
              if " type" in line:
                other_exports.add("%sProps"%(obj_name,))
              elif " noprops" not in line:
                other_exports.add("I%sProps"%(obj_name,))

              if " action" in line:
                other_exports.add("%sAction"%(obj_name,))

              if " dispatch" in line:
                other_exports.add("%sDispatchAction"%(obj_name,))

            if line.startswith(" * @file"):
              docstring = line.replace(" * @file", "").strip()

          imports = sorted(
            [("use" + obj_name) if export_as_hook else obj_name] + list(other_exports),
            key=lambda x: x.lower()
          )

          if ignore_export:
            continue

          if export_all:
            to_barrel += [(obj_name, "*", docstring, [obj_name], other_exports)]
          elif len(imports) == 1:
            to_barrel += [(obj_name, " " + imports[0] + " ", docstring, imports, [])]
          else:
            to_barrel += [(obj_name, "\n" + ("".join([("  " + s + ",\n") for s in imports])), docstring, imports, [])]

  if to_barrel and barrel_directory:
    imports = ""
    export_consts = ""
    exports = "export {\n"
    default_export = ""
    export_list = []

    for (obj, importstr, docstring, line_exports, passthrough) \
    in sorted(to_barrel, key=lambda x: x[0].lower()):

      to_import = ""

      if importstr == "*":
        to_import = "import * as %s from \"./%s\";"%(obj, obj)
      else:
        to_import = "import {%s} from \"./%s\";"%(importstr, obj)

      to_import_lines = to_import.split("\n");

      for line in to_import_lines:
        if (len(line) > 80):
          imports += "// tslint:disable-next-line:max-line-length\n" + line + "\n"
        else:
          imports += line + "\n"
      
      export_list += line_exports
      
      if docstring:
        default_export += "  /** %s */\n"%docstring
      default_export += "  %s,\n"%obj

      for p in passthrough:
        line = "export const %s = %s.%s;\n"%(p, obj, p)
        if (len(line) > 80):
          export_consts += "// tslint:disable-next-line:max-line-length\n" + line
        else:
          export_consts += line

    export_list = sorted(export_list, key=lambda x: x.lower())
    exports += "".join([("  " + s + ",\n") for s in export_list]) + "};\n"

    export_consts = (export_consts + "\n") if export_consts else export_consts;

    with open(directory+"/index.ts", "w") as f:
      f.write(index_ts)
      f.write(imports)
      f.write("\n")
      f.write(export_consts)
      f.write(exports)

      for static_file in static_exports:
        with open(static_file, "r") as sf:
          for line in sf:
            f.write(line)

    return True

  if barrel_directory and not to_barrel:
    return False

  return True



  


if __name__ == "__main__":
  import sys

  if len(sys.argv) >= 2 and sys.argv[1] == "clean":
    clean(SOURCE_ROOT)
  else:
    barrel(SOURCE_ROOT)
