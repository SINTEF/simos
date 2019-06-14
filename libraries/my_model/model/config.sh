# Location of model directory
readonly MODEL_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

################################################
# START USER CONFIGURATION PART                #
################################################

# Location of Simos
readonly SIMOS_DIR="$MODEL_DIR/../../../../../simo-riflex/src/submodules/simos/"

# Name of package to be generated
readonly PACKAGE_NAME="deepline_model"

# Version of package to be generated
readonly PACKAGE_VERSION="r1"

# Language generator to be used
readonly PACKAGE_GENERATOR="fortgen"

################################################
# END USER CONFIGURATION PART                  #
################################################

# Location of simos.js
readonly SIMOS_JS="$SIMOS_DIR/ui/shell/simos.js"

# Location of path config
readonly PATHCONFIG_JS="$MODEL_DIR/pathConfig.js"

# Simos shell command
readonly SHS_COMMAND="$SIMOS_DIR/runner/node $SIMOS_JS $PATHCONFIG_JS"
