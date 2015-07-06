# Include directory containing auxiliary cmake scripts
list (APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)


# From global cmake script folder
include (compileflags)
include (testingUtilities)

include (testsources)

#Store Fortran mod files and generated interfaces in separate folder
set (CMAKE_Fortran_MODULE_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/include/)
execute_process(COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/include/)


configure_artifact ("pFUnit" "0.1.1" "x64" "${CMAKE_Fortran_COMPILER_ID}")
find_package ("pFUnit"
    REQUIRED
    PATHS ${pFUnit_DIR}
    )

add_pfunit_test (test_${LIB} "${TEST_SOURCES}" "${EXTRA_SOURCES}" "${EXTRA_SOURCES_C}")
if (TARGET test_${LIB})
    target_include_directories (test_${LIB}
        PRIVATE ${PRIVATE_INCLUDE_DIRS}
        )
    target_link_libraries (test_${LIB}
        ${LIB}
        )
endif (TARGET test_${LIB})