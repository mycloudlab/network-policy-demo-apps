
FROM andreptb/maven:3.2.5-jdk6
WORKDIR /app
ADD . /app
RUN mvn package -Dhttp.proxyHost=172.19.30.219 -Dhttp.proxyPort=1212 -Dhttps.proxyHost=172.19.30.219 -Dhttps.proxyPort=1212

FROM davidcaste/alpine-tomcat:tomcat7
WORKDIR /root/
COPY --from=0 /app/target/struts-networkpolicy-demo-0.0.1-SNAPSHOT.war  /opt/tomcat/webapps/struts-netpol-demo.war 
RUN chmod 777 /opt/tomcat/webapps -R 
CMD /opt/tomcat/bin/catalina.sh run
