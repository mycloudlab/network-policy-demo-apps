
FROM andreptb/maven:3.2.5-jdk6
WORKDIR /app
ADD . /app
RUN mvn package 

FROM davidcaste/alpine-tomcat:tomcat7
WORKDIR /root/
COPY --from=0 /app/target/struts-networkpolicy-demo-0.0.1-SNAPSHOT.war  /opt/tomcat/webapps/ROOT.war 
RUN chmod 777 /opt/tomcat -R 
CMD /opt/tomcat/bin/catalina.sh run
