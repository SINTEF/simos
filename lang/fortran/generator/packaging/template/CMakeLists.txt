cmake_minimum_required(VERSION 3.0)

# Include directory containing auxiliary cmake scripts
list (APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

include (libversion)
include (libsources)
include (libdependencies)

set(LIB_DEPENDENCIES ${LIB_DEPENDENCIES} ${LIB_DEPENDENCIES_SIMOS})
set(PUBLIC_SOURCES_FORTRAN ${PUBLIC_SOURCES_FORTRAN} ${PUBLIC_SOURCES_FORTRAN_SIMOS})

include (defaultLibrary) #Default library definition as defined in cmake-global/
include (customlibsettings)

#
# Testing
#
if (${Testing} MATCHES "ON")
    enable_testing ()
    add_subdirectory (tests)
endif ()
