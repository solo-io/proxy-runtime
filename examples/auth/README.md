# Auth filter example

You can run the example like so:
```
npm run asbuild
docker run -ti --rm -p 8080:8080 -p 8001:8001 --entrypoint=envoy -v $PWD/envoycfg.yaml:$PWD/envoycfg.yaml:ro -v $PWD/build:$PWD/build:ro -w $PWD docker.io/istio/proxyv2:1.7.0 -c $PWD/envoycfg.yaml
```

# Test

This will return 200:

```
curl localhost:8080/get
```

This will return 403:
```
curl localhost:8080/
```
