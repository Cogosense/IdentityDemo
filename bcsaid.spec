%define debug_package %{nil}
%define _builddir %(pwd)
%define _sourcedir %(pwd)
%define bcsauser bcsa
%define bcsadir /home/%{bcsauser}

#
# automatically generate requires and provides from package.json
#
#%{?nodejs_find_provides_and_requires}

#
# filter out any false provides created due to dependencies with native components
#
#%{?nodejs_default_filter}

#
# TODO - set bcsa_config_env to the name of your production environment
#        This is the value of NODE_ENV on the target machine and is
#        the basename of the JSON config file that will be loaded.
#
%define bcsa_config_env demo

#
# name, version and release of module
#
%define _buildname %(jq -r '.name' package.json)
%define _buildversion %(jq -r '.version' package.json)
%define _buildnum 1

Summary: A nodejs app with a systemd daemon
Name:    %{_buildname}
Group:   Applications/Tools
Version: %{_buildversion}
Release: %{_buildnum}
License: KAT5Networks
URL:     https://github.com/myuser/myapp
Source0: .
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
Requires: nodejs-0.10.40
BuildRequires: nodejs-packaging
BuildRequires: systemd
BuildRequires: /usr/bin/npm
BuildRequires: jq
AutoReq: no
AutoProv: no

%description
A nodejs app that installs as a systemd service

%prep

%build

npm install
bower install
grunt production
rm -rf node_modules
npm --production install
npm dedupe

%install

#
# copy in the module source
#
%{__install} -d  $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} -R bin $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} -R certs $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} -R config $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} -R node_modules $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} package.json $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} -R public $RPM_BUILD_ROOT%{bcsadir}/%{name}
%{__cp} -R server $RPM_BUILD_ROOT%{bcsadir}/%{name}

#
# link the daemon binaries into sbindir
#
%{__install} -d  $RPM_BUILD_ROOT%{_sbindir}
%{__ln_s} %{bcsadir}/%{name}/bin/www $RPM_BUILD_ROOT%{_sbindir}/%{name}

#
# Create a systemd unit file
#
%{__install} -d  $RPM_BUILD_ROOT%{_unitdir}
cat << __EOF > $RPM_BUILD_ROOT%{_unitdir}/%{name}.service
[Unit]
Description=Tapp central server
Documentation=man:%{name}(8)

[Service]
Type=simple
User=bcsa
Group=bcsa
Environment="NODE_ENV=%{bcsa_config_env}"
WorkingDirectory=%{bcsadir}/%{name}
ExecStart=%{_sbindir}/%{name}
ExecStop=/bin/kill -s QUIT $MAINPID

[Install]
WantedBy=multi-user.target
__EOF

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root)
%doc README.md README-smtp.md
%attr(-,%{bcsauser},%{bcsauser}) %{bcsadir}/%{name}
%{_sbindir}/%{name}
%{_unitdir}/%{name}.service

%changelog
* Tue Nov 17 2015 Steve Williams
- Initial spec file for bcsaid
