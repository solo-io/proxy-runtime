# Auth filter example

You can run the example like so:
```
npm run asbuild
docker run -ti --rm -p 8080:8080 --entrypoint=envoy -v $PWD/envoycfg.yaml:$PWD/envoycfg.yaml:ro -v $PWD/build:$PWD/build:ro -w $PWD istio/proxyv2:1.6.0-alpha.1 -c $PWD/envoycfg.yaml
```

# Test

This will return 200:

```
curl localhost:8080/ok
```

This will return 403:
```
curl localhost:8080/
```
