import platform
import subprocess

from barrel import clean, SOURCE_ROOT

if platform.system() == "Windows":
    subprocess.run("rd /s /q dist", shell=True)
else:
    subprocess.run("rm -rf dist")

clean(SOURCE_ROOT)
