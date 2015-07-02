# Using This Library

To use this library, first add the subdirectory to your main project using `add_subdirectory`, then link your
executable and/or library to this library by using `target_link_libraries (<your target> <this library name>)`.


# Definition of Library Sources

The source code in this library is grouped into two parts:

  - *Public sources*: Source code with functions, subroutines, modules, classes, etc. that are can be used by other
    software components that use this library

  - *Internal sources*: Source code with functions, subroutines, modules, classes, etc. that can only be used by the
                      library itself

Source files in the library should be listed in the cmake/sources.cmake file. In order to be compatible with
Visual Studio C/C++ and Fortran source code are divided into two separate lists.

## Folder Structure
```
Library
 |
 +-- source
 |  |    - Location of public Fortran/C/C++ sources code
 |  |
 |  +-- include
 |  |    - Location of public C/C++ headers and other include files
 |  |
 |  +-- internal
 |  |  | - Location of Fortran/C/C++ internal source code
 |  |  |
 |  |  +-- include
 |  |    - Location of internal C/C++ headers and other include files
 |  |
 +  +-- tests
         - Automated tests for the libraray
```

# Automated Testing

The `tests` folder contains a set of automated tests that verifies the behaviour of the library. By default this folder
is set up to contain a set of Fortran unit tests using the pFUnit framework, but other methods can be added manually.
For further details see the files `tests/cmake/testsources.cmake` and `tests/CMakeLists.txt`.

All tests are added to the CTest test list so that they can be run along with other tests in the main project.