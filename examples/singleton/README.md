# Auth filter example

You can run the example like so:
```
npm run asbuild
podman run -ti --rm -p 8080:8080 -p 8001:8001 --entrypoint=envoy -v $PWD/envoycfg.yaml:$PWD/envoycfg.yaml:ro -v $PWD/build:$PWD/build:ro -w $PWD docker.io/envoyproxy/envoy-dev:76bcbd7d31615196d6d7295a741a5329689fdb9e -c $PWD/envoycfg.yaml
```

(you can also use envoyproxy/envoy-debug-dev for envoy with debug symbol)

# Test

This will return 200:

```
curl localhost:8080/get
```

This will return 403:
```
curl localhost:8080/
```
