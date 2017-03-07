# Location of model directory
readonly MODEL_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

################################################
# START USER CONFIGURATION PART                #
################################################

# Location of Simos
readonly SIMOS_DIR="$MODEL_DIR/.."

# Name of package to be generated
readonly PACKAGE_NAME="marmo"

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

# If node is not available, try to add simos runner dir to PATH
# TODO: A better way would be to try to find path to node
if ! type node 2>/dev/null; then
    export PATH="$PATH:$SIMOS_DIR/runner/"
fi

readonly SHS_COMMAND="node $SIMOS_JS $PATHCONFIG_JS"