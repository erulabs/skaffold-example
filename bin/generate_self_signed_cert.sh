#!/usr/bin/env bash
set -e

TARGET="${TARGET:-dev}"
SECRETSDIR="inf/k8s/overlays/${TARGET}/secrets"
PROJECT="tacticsonline"
PROJECT_DOMAIN="tacticsonline.com"

# This script is typically run by `./bin/dev.sh`, not manually
mkdir -p ${SECRETSDIR}

if [[ ! -x "$(command -v mkcert)" ]]; then
  openssl genrsa \
    -des3 -passout pass:xxxx -out ${SECRETSDIR}/selfsigned.pass.key 2048

  openssl rsa \
    -passin pass:xxxx -in ${SECRETSDIR}/selfsigned.pass.key -out ${SECRETSDIR}/selfsigned.key.pem

  openssl req \
    -new -key ${SECRETSDIR}/selfsigned.key.pem -out ${SECRETSDIR}/selfsigned.csr.pem \
    -subj "//C=US/ST=California/L=SanFrancisco/O=${PROJECT}/OU=foobar/CN=${PROJECT_DOMAIN}"

  openssl x509 \
    -req -sha256 -days 5000 -in ${SECRETSDIR}/selfsigned.csr.pem -signkey ${SECRETSDIR}/selfsigned.key.pem -out ${SECRETSDIR}/selfsigned.crt.pem

  rm ${SECRETSDIR}/selfsigned.pass.key
else
  mkcert -install
  mkcert -cert-file ${SECRETSDIR}/selfsigned.crt.pem -key-file ${SECRETSDIR}/selfsigned.key.pem localhost
fi
