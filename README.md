# network-policy-demo-apps


## building

oc expose service ui --hostname=netpol-demo.cluster.local

oc delete all -l app=random-value
oc delete all -l app=time-server
oc delete all -l app=twitter-reader
oc delete all -l app=bff-web
oc delete all -l app=ui



# concede permissões ao developer 
oc adm policy add-cluster-role-to-user cluster-admin dev

oc adm policy remove-cluster-role-from-user cluster-admin dev



Network policy

oc create -f - <<EOF
apiVersion: network.openshift.io/v1
kind: EgressNetworkPolicy
metadata:
  name: default
  namespace: app-demo
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

oc get egressnetworkpolicy 

oc delete egressnetworkpolicy default


oc create -f - <<EOF
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  ingress: []
EOF

oc label namespace default name=default

oc create -f - <<EOF
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


oc create -f - <<EOF
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


oc create -f - <<EOF
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


oc create -f - <<EOF
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

oc create -f - <<EOF
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



