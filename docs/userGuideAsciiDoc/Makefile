#########################################################################################
#
# Product: U S E R G U I D E
#
# Requires: GNU Make
#
# Programed By: Gro Baarholm
#
# Update history:
# ---------------------------------------
# MM.DD.YYYY
#
##########################################################################################

stylesheet= asciidoc.css
stylesdir = ../../../../../../c/appl/asciidoc-8.6.9/examples/website/

asciidocInt  = main_int
asciidocExt  = main_ext
adocSuff     = .adoc
htmlSuff     = .html

userGuide_Ext      = Userguide_SIMOS_Ext
userGuide_Int      = Userguide_SIMOS_Int

divfiles  = 

help:

	 @echo "!========================================================"
	 @echo "! userguide_<suffix>    Make SIMOS user guide "
	 @echo "! ext        external user guide                         "
	 @echo "! int        internal user guide                         "
	 @echo "! all        external & internal user guide              "
	 @echo "!                                                        "
	 @echo "!                                                        "
	 @echo "!                                                        "
	 @echo "!                                                        "
	 @echo "! EXAMPLE:                                               "
	 @echo "!--------------------------------------------------------"
	 @echo "! make userguide_ext                                     "
	 @echo "! make userguide_int                                     "
	 @echo "! make userguide_all                                     "
	 @echo "!                                                        "
	 @echo "!--------------------------------------------------------"
	 @echo "!                                                        "
	 @echo "! ====================================================== "


userguide_int:
	asciidoctor -b html5 -a icons  -d book -a toc2 -a stylesheet=$(stylesheet) -a stylesdir=$(stylesdir) $(asciidocInt)$(adocSuff) 
	mv $(asciidocInt)$(htmlSuff) $(userGuide_Int)$(htmlSuff)

userguide_ext:
	asciidoctor -b html5 -a icons  -d book -a toc2 -a stylesheet=$(stylesheet) -a stylesdir=$(stylesdir) $(asciidocExt)$(adocSuff) 
	mv $(asciidocExt)$(htmlSuff) $(userGuide_Ext)$(htmlSuff)

userguide_all:
	asciidoctor -b html5 -a icons  -d book -a toc2 -a stylesheet=$(stylesheet) -a stylesdir=$(stylesdir) $(asciidocExt)$(adocSuff) 
	mv $(asciidocExt)$(htmlSuff) $(userGuide_Ext)$(htmlSuff)

	asciidoctor -b html5 -a icons  -d book -a toc2 -a stylesheet=$(stylesheet) -a stylesdir=$(stylesdir) $(asciidocInt)$(adocSuff) 
	mv $(asciidocInt)$(htmlSuff) $(userGuide_Int)$(htmlSuff)
