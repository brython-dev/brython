#!/bin/bash
if [ ! -f $PWD/travis_phantomjs/phantomjs-2.1.1-linux-x86_64/bin/phantomjs ]; then
    mkdir -p $PWD/travis_phantomjs
    wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 -O $PWD/travis_phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2
    tar -xvf $PWD/travis_phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2 -C $PWD/travis_phantomjs
fi;
