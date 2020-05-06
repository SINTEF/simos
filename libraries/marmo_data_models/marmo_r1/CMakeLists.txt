######################################
# SIMOS generated file, DO NOT EDIT  #
######################################
MACRO (prepend_list _list _postfix)
    unset (_tmp)
    foreach (src ${${_list}})
        list (APPEND _tmp "${_postfix}${src}")
    endforeach( src ${${_list}} )
    set (${_list} ${_tmp})
ENDMACRO (prepend_list _list _postfix)

include(${CMAKE_CURRENT_SOURCE_DIR}/src_gen/cmake/libsources.cmake)
include(${CMAKE_CURRENT_SOURCE_DIR}/src_gen/cmake/libdependencies.cmake)
prepend_list(LIB_SOURCES_Fortran_SIMOS "src_gen/")

if(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/src)
    include(${CMAKE_CURRENT_SOURCE_DIR}/src/cmake/sources.cmake)
    include(${CMAKE_CURRENT_SOURCE_DIR}/src/cmake/dependencies.cmake)
    prepend_list(LIB_SOURCES_Fortran "src/")
endif(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/src)

set(LIB_SOURCES_Fortran
    ${LIB_SOURCES_Fortran}
    ${LIB_SOURCES_Fortran_SIMOS})
set(LIB_DEPENDENCIES
    ${LIB_DEPENDENCIES}
    ${LIB_DEPENDENCIES_SIMOS})

add_library(marmo ${LIB_SOURCES_Fortran})
target_link_libraries(marmo ${LIB_DEPENDENCIES})

# Store Fortran mod files in separate folder
file (MAKE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/include/)
set_property (TARGET marmo
    PROPERTY Fortran_MODULE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/include/)
target_include_directories (marmo PUBLIC ${CMAKE_CURRENT_BINARY_DIR}/include/)

if(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/tests)
    add_subdirectory(tests)
endif(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/tests)