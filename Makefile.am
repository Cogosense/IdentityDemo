BUILT_SOURCES = .stamp.build

.stamp.build : tapp-cs.spec
	rpmbuild -ba tapp-cs.spec && touch $@

MOSTLYCLEANFILES = \
	    $(srcdir)/npm-debug.log

CLEANFILES = \
	    $(srcdir)/.stamp.build

DISTCLEANFILES = \
	    $(srcdir)/Makefile.in

distclean-local:
	$(RM) -rf $(srcdir)/public
	$(RM) -rf $(srcdir)/node_modules
	$(RM) -rf $(srcdir)/client/lib
