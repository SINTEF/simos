#!/bin/bash

echo "Building SIMOS..."

$BUILD_ID -DCMAKE_BUILD_TYPE=$BUILD_TYPE

if [ -z "$BUILD_ID" ]
then
    echo "No build id specified, using 1.0"
    BUILD_ID="1.0"
fi

if [ -z "$BUILD_TYPE" ]
then
    echo "No build type specified, using debug"
    BUILD_TYPE="debug"
fi

mkdir -p build
cd build || exit $?

zip -r simos-$BUILD_ID-BUILD_TYPE-win64.zip ../ || exit $?

exit $?

