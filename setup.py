#!/usr/bin/env python

from setuptools import setup, find_packages

setup(name='flightmap',
      version='0.1.0alpha',
      description='Interactive global flight mapping web application',
      author='Chris Erickson',
      author_email='erickson.christopher.k@gmail.com',
      packages=find_packages(),
      include_package_data=True,
      requires=['Flask']
     )
