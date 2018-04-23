# network-policy-demo-apps

this repository is a demonstration of the functionalities of kubernetes network policies together with egress network policy (open vSwitch).

is composed of 2 applications:

* struts-netpol-demo: struts application to demonstrate the need for network security. This application contains a known security vulnerability [CVE-2013-2251](http://cvedetails.com/cve/cve-2013-2251).

* microservices: we also have an application that is composed of 5 microservices, app-angular-network-policy-demo-ui (user interface), app-node-bff-web, backend for frontend that aggregates the calls, app-random-value that only returns a random value, app-node-twitter-reader, that is tweets from an informed search, app-node-get-time-server that reads the date of the server ntp.br, via date header (http).

for purposes of simplification we use a Dockerfile per project for building projects. Pre-built images already exist on hub.docker.com.

Important: For the correct test of the functionality shown below, a server with openshift 3.9+ installed with option **os_sdn_network_plugin_name ='redhat/openshift-ovs-networkpolicy'** is required.

This recipe does not support **oc cluster up**

## deploy on openshift

```bash
# create microservices project
oc new-project netpol-ms-demo

# deploy random-value app
oc new-app --name=random-value --docker-image=mycloudlab/net-pol-demo-random-value

# deploy time-server app
oc new-app --name=time-server --docker-image=mycloudlab/net-pol-demo-time-server

# deploy time-server app
oc new-app --name=twitter-reader --docker-image=mycloudlab/net-pol-demo-twitter-reader \
-e TWITTER_CONSUMER_KEY=<your twitter consumer key> \
-e TWITTER_CONSUMER_SECRET=<your twitter consumer secret> \
-e TWITTER_ACCESS_TOKEN_KEY=<your twitter access token key> \
-e TWITTER_ACCESS_TOKEN_SECRET=<your twitter token secret> 

# deploy bff-web app
oc new-app --name=bff-web --docker-image=mycloudlab/net-pol-demo-bff-web  \
-e TWEETS_SERVICE_URL=http://twitter-reader:3000 \
-e RANDOM_SERVICE_URL=http://random-value:8000 \
-e DATETIME_SERVICE_URL=http://time-server:3000 

# deploy angular ui
oc new-app --name=ui --docker-image=mycloudlab/net-pol-demo-ui  \
-e BFF_URL=http://bff-web:3000 

# expose ui
oc expose service ui --hostname=netpol-demo.cluster.local


# create new struts project
oc new-project struts-legacy-demo

# deploy vunerable struts app (CVE-2013-2251)
oc new-app --name=netpol-struts-demo --docker-image=mycloudlab/net-pol-demo-struts-app

# expose app
oc expose service netpol-struts-demo --hostname=netpol-struts-demo.cluster.local
```


## network policies

before apply network policies add label to default namespace. (requires admin)

```bash
oc label namespace default name=default
```


```bash
# deny all ingress traffic for all pods
oc create -n net-pol-ms-demo f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  ingress: []
EOF

# allow openshift default namespace to ui port 4200, for router communication 
oc create -n net-pol-ms-demo -f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-router-to-ui
spec:
  podSelector:
    matchLabels:
      app: ui
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: default
    ports:
    - protocol: TCP
      port: 4200
EOF

# allow ui to bff on port 3000
oc create -n net-pol-ms-demo -f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-ui-to-bff-web
spec:
  podSelector:
    matchLabels:
      app: bff-web
  ingress:
  - from:
    - podSelector: 
        matchLabels:
          app: ui
    ports:
    - port: 3000 
      protocol: TCP
EOF

# allow bff-web to random-value on port 8000
oc create -n net-pol-ms-demo -f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-bff-web-to-random-value
spec:
  podSelector:
    matchLabels:
      app: random-value
  ingress:
  - from:
    - podSelector: 
        matchLabels:
          app: bff-web
    ports:
    - port:  8000
      protocol: TCP
EOF

# allow bff to time-server on port 3000
oc create -n net-pol-ms-demo -f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-bff-web-to-time-server
spec:
  podSelector:
    matchLabels:
      app: time-server
  ingress:
  - from:
    - podSelector: 
        matchLabels:
          app: bff-web
    ports:
    - port:  3000
      protocol: TCP
EOF

# allow bff to twitter-reader on port 3000
oc create -n net-pol-ms-demo -f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: allow-bff-web-to-twitter-reader
spec:
  podSelector:
    matchLabels:
      app: twitter-reader
  ingress:
  - from:
    - podSelector: 
        matchLabels:
          app: bff-web
    ports:
    - port:  3000
      protocol: TCP
EOF
```


## egress network policy (open vSwitch)

```bash
# create egress policy
oc create -n net-pol-ms-demo -f - <<EOF
apiVersion: network.openshift.io/v1
kind: EgressNetworkPolicy
metadata:
  name: default
spec:
  egress:
    - to:
        dnsName: ntp.br
      type: Allow
    - to:
        dnsName: api.twitter.com
      type: Allow
    - to:
        dnsName: twitter.com
      type: Allow
    - to:
        cidrSelector: 0.0.0.0/0
      type: Deny
EOF
```