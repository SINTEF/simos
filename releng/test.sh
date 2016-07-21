#!/bin/bash

cd build/ || exit $?

rm -rf Testing/

"/c/Program Files (x86)/CMake/bin/ctest" -j 3 -T Test --output-on-failure --output-log ctest.log
stat=$?

exit $stat
