


```
kubectl create secret docker-registry registry-secret \
  --docker-server=https://gcr.io \
  --docker-username=_json_key \
  --docker-email=seandon.mooy@gmail.com \
  --docker-password="$(cat inf/secrets/k8s-gcr-auth-ro.json.plain)"
```
