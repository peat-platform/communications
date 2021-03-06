# communcications

The Cloudlet Platforms cloudlet_api component manages users Cloudlet Platform. It supports create, delete, and read of Cloudlets.

## Getting Started
Install the module with: `npm install git+https://git@opensourceprojects.eu/git/p/openi/c60b/ad4e/communications.git`

You will need to install the following through macports or aptitude.

```bash
sudo port install JsCoverage
sudo port install phantomjs
```

or

```bash
sudo apt-get install JsCoverage
sudo apt-get install phantomjs
```

To build the project enter the following commands. Note: npm install is only required the first time the module is built or if a new dependency is added. There are a number of grunt tasks that can be executed including: test, cover, default and jenkins. The jenkins task is executed on the build server, if it doesn't pass then the build will fail.

```bash
git clone git@opensourceprojects.eu/git/p/openi/c60b/ad4e/communications.git
cd cloudlet_api
npm install

```

To start the component enter:

```javascript
node lib/local-runner.js
```

## Documentation

TODO


## Contributors

* Donal McCarthy (dmccarthy@tssg.org)


## Release History
**0.1.0** *(11/3/14 dmccarthy@tssg.org)* First version of the cloudlet API module.


## License
Copyright (c) 2014
Licensed under the MIT license.

