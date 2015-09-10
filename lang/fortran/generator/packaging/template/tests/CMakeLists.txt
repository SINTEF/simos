# Include directory containing auxiliary cmake scripts
list (APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

include (testsources)
include (defaultTestSetup) #from cmake-global/


add_pfunit_test (test_${LIB} "${TEST_SOURCES}" "${EXTRA_SOURCES}" "${EXTRA_SOURCES_C}")
if (TARGET test_${LIB})
    target_include_directories (test_${LIB}
        PRIVATE ${PRIVATE_INCLUDE_DIRS}
        )
    target_link_libraries (test_${LIB}
        ${LIB}
        )
endif (TARGET test_${LIB})

