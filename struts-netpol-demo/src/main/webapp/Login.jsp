<%@ page contentType="text/html; charset=UTF-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Login page</title>
<link rel="stylesheet" href="style.css" />
</head>
<body>

	<div class="login-page">
		<s:actionerror />
		<div class="form">

			<s:form  namespace="/" action="login" method="post" >
				<s:textfield name="username" key="label.username" size="20" />
				<s:password name="password" key="label.password" size="20" />
				<s:submit method="authenticate" key="label.login" align="center" />
			</s:form>

		</div>
	</div>