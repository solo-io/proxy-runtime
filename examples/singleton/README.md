# Auth filter example

You can run the example like so:

```
npm run asbuild
podman run -ti --rm -p 8080:8080 -p 8001:8001 --entrypoint=envoy -v $PWD/envoycfg.yaml:$PWD/envoycfg.yaml:ro -v $PWD/build:$PWD/build:ro -w $PWD docker.io/envoyproxy/envoy-dev:f6679d51cc7b2f0b5e05c883a035ad87d011f454 -c $PWD/envoycfg.yaml
```

(you can also use envoyproxy/envoy-debug-dev for envoy with debug symbols)

# Test

This will return 200:

```
curl localhost:8080/get
```

This will return 403:
```
curl localhost:8080/
```
