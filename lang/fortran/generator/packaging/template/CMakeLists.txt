cmake_minimum_required(VERSION 3.0)

# Warn if attempting in-source build
if (CMAKE_CURRENT_SOURCE_DIR STREQUAL CMAKE_BINARY_DIR)
    message (FATAL_ERROR "In-source builds are not allowed! Please select a build directory outside the source directory!")
endif (CMAKE_CURRENT_SOURCE_DIR STREQUAL CMAKE_BINARY_DIR)

# Include directory containing auxiliary cmake scripts
list (APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

# Include directory containing global auxiliary cmake scripts
list (APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../../cmake-global)
include (target_link_blas_lapack)

include (libversion)
include (libsources)
include (libdependencies)

MACRO (prepend_list _list _postfix)
    unset (_tmp)
    foreach (src ${${_list}})
        list (APPEND _tmp "${_postfix}${src}")
    endforeach( src ${${_list}} )
    set (${_list} ${_tmp})
ENDMACRO (prepend_list _list _postfix)

prepend_list (PUBLIC_SOURCES_FORTRAN "source/")
prepend_list (INTERNAL_SOURCES_FORTRAN "source/internal/")
prepend_list (PUBLIC_SOURCES_C "source/")
prepend_list (INTERNAL_SOURCES_C "source/internal/")
# SIMOS generated files
prepend_list (PUBLIC_SOURCES_FORTRAN_SIMOS "source/")

# Keep a list of private include dirs that can be used for testing
unset (PRIVATE_INCLUDE_DIRS)

#
# Define the main library
#
execute_process(COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/include)
add_library (${LIB} STATIC ${PUBLIC_SOURCES_FORTRAN} ${PUBLIC_SOURCES_FORTRAN_SIMOS})
set_property (TARGET ${LIB}
    PROPERTY Fortran_MODULE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/include/
    )
target_include_directories (${LIB}
    INTERFACE ${CMAKE_CURRENT_BINARY_DIR}/include/
    )
    
# Link to dependent targets
target_link_libraries(${LIB} ${LIB_DEPENDENCIES} ${LIB_DEPENDENCIES_SIMOS})
if (${LINK_BLAS_LAPACK})
    include (target_link_blas_lapack)
    target_link_blas_lapack (${LIB})
endif (${LINK_BLAS_LAPACK})


#
# Define the internal library if any sources
#
if (INTERNAL_SOURCES_FORTRAN)
    execute_process(COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/include/internal)
    add_library (${LIB}_internal STATIC ${INTERNAL_SOURCES_FORTRAN})
    set_property (TARGET ${LIB}_internal
        PROPERTY Fortran_MODULE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/include/internal/
        )

    # Manually include module files for the internal library in the main library.
    # This ensures that internal modules cannot be used from the outside when linking to the main library.
    target_include_directories (${LIB}
        PRIVATE ${CMAKE_CURRENT_BINARY_DIR}/include/internal/
        )
    list( APPEND PRIVATE_INCLUDE_DIRS ${CMAKE_CURRENT_BINARY_DIR}/include/internal/ )

    target_link_libraries (${LIB} ${LIB}_internal)

    # Link to dependent targets
    target_link_libraries(${LIB}_internal ${LIB_DEPENDENCIES})
    if (${LINK_BLAS_LAPACK})
        target_link_blas_lapack (${LIB}_internal)
    endif (${LINK_BLAS_LAPACK})

endif (INTERNAL_SOURCES_FORTRAN)


#
# Define the internal C library if any sources
#
if (INTERNAL_SOURCES_C)
    add_library (${LIB}_internal_c STATIC ${INTERNAL_SOURCES_C})
    target_include_directories (${LIB}_internal_c
        PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/source/internal/include/
    )

    # Manually include module files for the internal library in the main library.
    # This ensures that internal sources cannot be used from the outside when linking to the main library.
    target_include_directories (${LIB}
        PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/source/internal/include/
        )
    list( APPEND PRIVATE_INCLUDE_DIRS ${CMAKE_CURRENT_SOURCE_DIR}/source/internal/include/)

    target_link_libraries (${LIB} ${LIB}_internal_c)
    if (INTERNAL_SOURCES_FORTRAN)
        target_link_libraries (${LIB}_internal ${LIB}_internal_c)
    endif (INTERNAL_SOURCES_FORTRAN)

    # Link to dependent targets
    target_link_libraries(${LIB}_internal_c ${LIB_DEPENDENCIES})
    if (${LINK_BLAS_LAPACK})
        target_link_blas_lapack (${LIB}_internal_c)
    endif (${LINK_BLAS_LAPACK})
endif (INTERNAL_SOURCES_C)


#
# Define the public C library if any sources
#
if (PUBLIC_SOURCES_C)
    add_library (${LIB}_c STATIC ${PUBLIC_SOURCES_C})
    target_include_directories (${LIB}_c
        PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/source/include
        )

    target_link_libraries (${LIB} ${LIB}_c)
    if (INTERNAL_SOURCES_C)
        target_link_libraries (${LIB}_c ${LIB}_internal_c)
    endif (INTERNAL_SOURCES_C)
    if (INTERNAL_SOURCES_FORTRAN)
        target_link_libraries (${LIB}_c ${LIB}_internal)
    endif (INTERNAL_SOURCES_FORTRAN)

    # Link to dependent targets
    target_link_libraries(${LIB}_c ${LIB_DEPENDENCIES})
    if (${LINK_BLAS_LAPACK})
        target_link_blas_lapack (${LIB}_c)
    endif (${LINK_BLAS_LAPACK})
endif (PUBLIC_SOURCES_C)


#
# Testing
#
enable_testing ()
add_subdirectory (tests)