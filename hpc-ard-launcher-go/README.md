# hpe-hpc-launcher Go Client

The code found in this subtree is generated automatically using OpenAPI tools from the
HPE-HPC-launcher (Capsules) REST API specification.
It can be built with the following commands, executed in the HPE GitHub hpc-ard-capsules-core project:

```
# Checkout and build launcher go client API 
git clone git@github.hpe.com:hpe/hpc-ard-capsules-core.git
cd hpc-ard-capsules-core
mvn clean install -DskipTests
mvn -pl com.cray.analytics.capsules:capsules-dispatch-client clean generate-sources -P go-client

# Copy the generated files into the determined-ee tree
# Update DET_EE_ROOT for your environment
DET_EE_ROOT=~/git/determined-ee

cp -r capsules-rest/capsules-dispatch-client/target/generated-sources/go/* $DET_EE_ROOT/hpc-ard-launcher-go/launcher

# Commit the changes to determined-eeZZ
```


