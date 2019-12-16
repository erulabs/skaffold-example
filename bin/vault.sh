#!/usr/bin/env bash
set -e
# vault.sh - by Seandon Mooy
# Used to encrypt / decrypt secret files with AES-256-CBC

# Extension of plaintext files (ADD *.$PLAIN_EXT to .gitignore, or you've destroyed the purpose of this tool!)
PLAIN_EXT='plain'
# Extension of encrypted files
VAULTED_EXT='secret'
# Directory for finding secrets - use `.` to enable repo-wide
SECRET_DIR=${SECRET_DIR:-"inf/k8s/overlays"}
# Encryption scheme used by openssl
ENCRYPTION_ALGO="aes-256-cbc"

# No need to change the follow
TARGET=${2:-local}
SECRET_FILE="${SECRET_DIR}/${TARGET}/secrets/.${VAULTED_EXT}"
USAGE="Usage:\n  ./bin/vault.sh <encryptAll|decryptAll> <ENV>\n  ./bin/vault.sh <encrypt|decrypt> <ENV> file_or_dir\nExamples:\n  ./bin/vault.sh decryptAll local\n  ./bin/vault.sh encrypt local some-plaintext-file.plain"

function encrypt {
  SECRET_NAME="$(echo -n ${1} | sed "s/${PLAIN_EXT}$/${VAULTED_EXT}/")"
  echo "${1} -> ${SECRET_NAME}"
  openssl enc -md sha256 -${ENCRYPTION_ALGO} -a -salt -in ${1} -pass file:${SECRET_FILE} -out ${SECRET_NAME}
}
function decrypt {
  PLAIN_NAME=$(echo -n ${1} | sed "s/${VAULTED_EXT}$/${PLAIN_EXT}/")
  echo "${1} -> ${PLAIN_NAME}"
  openssl enc -d -md sha256 -${ENCRYPTION_ALGO} -a -in ${1} -pass file:${SECRET_FILE} -out ${PLAIN_NAME}
}
function encryptAll {
  for PLAIN in $(find ${SECRET_DIR}/${1} -name "*.${PLAIN_EXT}"); do
    encrypt $PLAIN
  done
}
function decryptAll {
  for SECRET in $(find ${SECRET_DIR}/${1} \( -name "*.${VAULTED_EXT}" ! -name ".${VAULTED_EXT}" \)); do
    decrypt $SECRET
  done
}

if [[ ! -f ${SECRET_FILE} ]]; then
  echo -e "You're missing a secret file for ${TARGET} at '${SECRET_FILE}'. Exiting!"
  echo -e ${USAGE}
  exit 1
elif [[ "${1}" == "encryptAll" ]]; then
  encryptAll "${TARGET}"
elif [[ "${1}" == "decryptAll" ]]; then
  decryptAll "${TARGET}"
elif [[ "${1}" == "encrypt" && ! -z "${3}" ]]; then
  encrypt "${3}"
elif [[ "${1}" == "decrypt" && ! -z "${3}" ]]; then
  decrypt "${3}"
else
  echo -e ${USAGE}
  exit 1
fi
