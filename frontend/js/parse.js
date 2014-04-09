Parse.initialize("XGtB553yyhgOfzCHDyLzorYLXfxOPvDGtsml0lQU", "D6WFBuS0zJX4MbynTtog7EUO5qClhtnn5cZwVXeJ");

function createUser() {
	var username = $("#username").val();
	var password = $("#password").val();
	Parse.User.signUp(username, password, {ACL: new Parse.ACL()}, {
		success: function(user) {
			alert("Created user: " + username);
			window.location.replace('/');
		},
		error: function(user, error) {
			self.$(".signup-form .error").html(error.message).show();
			this.$(".signup-form button").removeAttr("disabled");
		}
	});
};