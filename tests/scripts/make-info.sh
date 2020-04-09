#!/bin/bash

while getopts p:l:o: option
do
case "${option}"
in
p) INFO_PATH=${OPTARG:-.};;
l) LOG=${OPTARG:-$(date)};;
o) OUTPUT=${OPTARG:-.}
esac
done

ls $INFO_PATH/*.json | sort | xargs -I $$$ sh -c "echo $$$ ; inspec_tools summary -j $$$ -o $$$.info; test -f $$$.info ; echo .info created for $$$ ; continue" | tee $LOG.log
