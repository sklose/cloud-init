var http = require("http");
var fs = require('fs');

function writeAwsConfigFile(rootPath, json) {

	if (!fs.existsSync(rootPath + '/.aws')) {
	    fs.mkdirSync(rootPath + '/.aws');
	}

	var fd = fs.openSync(rootPath + '/.aws/config', 'w+');
	fs.writeSync(fd, '[default]\n');
	fs.writeSync(fd, 'region=eu-central-1\n');
	fs.writeSync(fd, 'aws_access_key_id=');
	fs.writeSync(fd, json.AccessKeyId + '\n');
	fs.writeSync(fd, 'aws_secret_access_key=');
	fs.writeSync(fd, json.SecretAccessKey + '\n');
	fs.writeSync(fd, 'aws_session_token=');
	fs.writeSync(fd, json.Token + '\n');
	fs.closeSync(fd);

}

function getIamRole(callback) {
	http.get('http://169.254.169.254/latest/meta-data/iam/info', function (res) {
		var data = '';
		res.on('data', function (chunk) {
		    data += chunk.toString();
		});
		res.on("end", function () {
		    var json = JSON.parse(data);
			callback(json.InstanceProfileArn.substr(json.InstanceProfileArn.lastIndexOf('/') + 1));
		});
	});
}

function getCredentials(iamRole, callback) {
	http.get('http://169.254.169.254/latest/meta-data/iam/security-credentials/' + iamRole, function(res) {
		var data = '';
		res.on('data', function (chunk) {
		    data += chunk.toString();
		});
		res.on("end", function () {
		    var json = JSON.parse(data);
			callback(json);
		});
	});
}

getIamRole(function(role) { 
	getCredentials(role, function(json) { 
		writeAwsConfigFile(process.argv[2], json);
	})
});