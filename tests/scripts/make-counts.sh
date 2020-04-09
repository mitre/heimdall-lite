#!/bin/bash

while getopts p:l: option
do
case "${option}"
in
p) INFO_PATH=${OPTARG:-.};;
l) LOG=${OPTARG:-$(date)};;
esac
done

ls $INFO_PATH/*.info | xargs -I {} sh -c "cat {} | jq .status > {}.counts" | tee $LOG.log
