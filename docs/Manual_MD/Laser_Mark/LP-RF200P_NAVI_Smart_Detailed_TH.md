# LP-RF200P_NAVI_Smart_Detailed_TH

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\Laser_Mark\LP-RF200P_NAVI_Smart_Detailed_TH.pdf` |
| **จำนวนหน้า** | 428 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---

## หน้า 1

Laser Marking System
Laser Marker NAVI smart
Operation Manual


LP-GS series
LP-RC series
LP-RH series
LP-RF series
LP-RV series
LP-ZV series


ME-NAVIS2-OP-5


2024.7     industry.panasonic.com/

---

## หน้า 2

Preface


Preface


Thank you for purchasing this product.

Read this manual carefully to make full use of the product and to ensure its safe and proper
operation.

The English version of this document are the original instructions. All other languages are
translations that are based on the original documentation.

This product has been strictly checked and tested prior to packaging. However, make sure
that the product has not been damaged during transportation and operates properly before
using it. If the product was damaged or does not operate as specified in this manual, contact
our service center or sales office.


Liability and copyright for the hardware

Panasonic pursues a policy of continuous improvement of the design and performance
of its products. Therefore we reserve the right to change the manual/product without
notice. In no event will Panasonic be liable for direct, special, incidental, or consequential
damage resulting from any defect in the product or its documentation, even if advised of the
possibility of such damages.

This manual and everything described in it are copyrighted. You may not copy this manual, in
whole or part, without written consent of Panasonic.

Please direct support matters and technical questions to your local Panasonic
representative.


Disclaimer

The applications described in the manual are intended as examples only. The purchase of
our products described in the manual shall not be regarded as granting of a license to use
our products in the described applications. We do not warrant that we have obtained some
intellectual properties, such as patent rights, with respect to such applications, or that the
described application may not infringe any intellectual property rights, such as patent rights,
of a third party.


Trademarks

•   Windows is a registered trademark or trademark of Microsoft Corporation in the United
   States and other countries.

•   QR Code and iQR Code are registered trademarks of DENSO WAVE INCORPORATED
   in Japan and in other countries.

•   Adobe, Adobe Logo, Adobe Acrobat Reader, and Adobe Illustrator are registered
   trademarks of Adobe Inc. in the U.S.A. and/or other countries.

•   The Bluetooth® wordmark and logos are registered trademarks owned by the Bluetooth
   SIG, Inc.


2                                                                                            ME-NAVIS2-OP-5

---

## หน้า 3

Preface


•   EtherNet/IP is a trademark of ODVA, Inc.

•   PROFINET is a registered trademark of PROFIBUS Nutzerorganisation e.V.

•   All other product names and companies provided in this manual are trademarks or
   registered trademarks of their respective companies.


ME-NAVIS2-OP-5                                                                                          3

---

## หน้า 4

Important symbols


Important symbols


One or more of the following symbols may be used in this documentation.


The following symbols are used to indicate the type of hazard.


Indicates a hazardous situation which, if not avoided, will result in death or serious injury.


Indicates a hazardous situation which, if not avoided, could result in death or serious injury.


Indicates a hazardous situation which, if not avoided, could result in minor or moderate
injury.


Indicates a property damage message.


The following symbols are used to indicate the type of instructions to be observed.


Indicates an operating procedure which must not be performed.


Indicates an operating procedure which must be followed to operate the unit safely.


Indicates an operating procedure which must be performed carefully.


4                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 5

General safety precautions


General safety precautions


Please read the “Laser Safety Guide” for each model carefully before using these products.

You have acquired a product with components of laser class 4 (marking laser) and laser
class 2 (guide laser). The laser classifications are defined in the standard IEC 60825-1.

Laser class 4 refers to “laser products for which intrabeam viewing and skin exposure is
hazardous and for which the viewing of diffuse reflections may be hazardous. These lasers
also often represent a fire hazard”. Make sure to take safety measures required to use Class
4 laser products subject to the local laws and regulations of the country or region in which
this laser product is used.


ME-NAVIS2-OP-5                                                                                                5

---

## หน้า 6

Network security


Network security


Implementing measures to protect your network is crucial to keep your network and its traffic
secured.

As you will use this product connected to a network, your attention is called to the following
security risks.

•   Leakage or theft of information through this product

•   Use of this product for illegal operations by persons with malicious intent

•   Interference with or stoppage of this unit by persons with malicious intent

It is your responsibility to take precautions such as those described below to protect yourself
against the above network security risks.

•   Use this product in a secure network by using protection tools such as a firewall.

•   If this product is connected to a network that includes PCs, make sure that the system
   is not infected by computer viruses or other malicious entities (using a regularly updated
   antivirus program, anti-spyware program, etc.).

•   Use this product in an environment that has LAN, VPN (virtual private network) or leased
   line network.

•   Use this product in an environment where only limited people concerned can enter.

•   Use this product and connected devices such as a PC and tablet securing safety.

•   Do not install this product in locations where the product or the cables can be destroyed
   or damaged by persons with malicious intent.

Note that incorrect setting of the connection to the existing LAN might cause malfunction in
the devices on the network. Consult your network administrator before connecting.


6                                                                                                ME-NAVIS2-OP-5

---

## หน้า 7

Available documentation


Available documentation


For LP-GS, LP-RC, LP-RF, LP-RV, the following documents are included on the CD-ROM
Laser Marker Smart Utility.

For LP-RH and LP-ZV, these documents are included in the ZIP file
“laser_marker_smart_utility_v3.zip” which you can download from the Web site.

You need Adobe Acrobat Reader of Adobe Inc. to read the PDF version of the manuals.

“Laser Safety Guide”

•   Intended audience: All users

•   This manual describes the safety measures required before you start to operate the laser
   marking system.

“Setup and Maintenance Guide”

•   Intended audience: System integrators and persons responsible for installing the laser
   marking system.

•   This manual describes the items which are necessary for the installation and
   maintenance of the laser marking system.
   ‒ Specifications and dimensions

‒ Installation and connection methods

‒ Input and output specifications, descriptions of input and output signals, including
  timing charts

‒ Maintenance information

‒ Troubleshooting

“Laser Marker NAVI smart Operation Manual”

•   Intended audience: Machine builders and system integrators

•   This document describes how to operate the laser marking system using the PC
   configuration software Laser Marker NAVI smart.

“Serial Communication Command Guide”

•   Intended audience: Machine builders and system integrators

•   This manual describes the communication commands for the external control of the
   laser marking system via RS-232C, Ethernet, or optional network unit (EtherNet/IP or
   PROFINET).

“Serial Communication Command Guide: LP-400/V compatible mode”

•   Intended audience: Machine builders and system integrators

•   This manual describes compatible communication commands for the external control of
   the LP-400/LP-V series.

“Serial Communication Command Guide: LP-M/S/Z compatible mode” (LP-ZV)


ME-NAVIS2-OP-5                                                                                                 7

---

## หน้า 8

Available documentation


•   Intended audience: Machine builders and system integrators

•   This manual describes compatible communication commands for the external control of
   the LP-M/LP-S/LP-Z series.


Related topics

Download Laser Marker Smart Utility (page 21)


8                                                                                        ME-NAVIS2-OP-5

---

## หน้า 9

Product models


Product models


This document covers the LP-GS, LP-RC, LP-RF, LP-RH, LP-RV, and LP-ZV models listed in
the table.

Multiple models may be described collectively. Therefore, illustrations and screenshots may
slightly vary, depending on the model. Different settings or technical data, however, are
specified in the text.

Model                        Collective name

LP-GS051 (-E)
   LP-GS051
LP-GS051-F (-FE/-FN)
   LP-GS051 (-L)
LP-GS051-L (-LE)
   LP-GS051-L                               LP-GS series
LP-GS051-LF (-LFE/-LFN)

LP-GS052 (-E)
   LP-GS052
LP-GS052-F (-FE/-FN)

LP-RC350S                    LP-RC350S                                LP-RC series

LP-RF200P                    LP-RF200P                                LP-RF series

LP-RH100S
   LP-RH100
LP-RH100T

LP-RH101S
   LP-RH101
LP-RH101T

LP-RH200S
   LP-RH200
LP-RH200T
   LP-RH series
LP-RH300S
   LP-RH300
LP-RH300T

LP-RH301S
   LP-RH301
LP-RH301T

LP-RH305S
   LP-RH305
LP-RH305T

LP-RV200P                    LP-RV200P                                LP-RV series

LP-ZV200P                    LP-ZV200P

LP-ZV205P                    LP-ZV205P

LP-ZV206P                    LP-ZV206P
   LP-ZV series
LP-ZV500P                    LP-ZV500P

LP-ZV505P                    LP-ZV505P

LP-ZV506P                    LP-ZV506P


ME-NAVIS2-OP-5                                                                                                 9

---

## หน้า 10

Table of contents


Table of contents


Preface........................................................................................................................................... 2
Important symbols....................................................................................................................... 4
General safety precautions......................................................................................................... 5
Network security...........................................................................................................................6
Available documentation............................................................................................................. 7
Product models............................................................................................................................ 9
1 Getting started.......................................................................................................................... 20
1.1 Outline of Laser Marker NAVI smart.............................................................................................. 20

1.2 PC requirements............................................................................................................................. 21
1.3 Download Laser Marker Smart Utility.............................................................................................21

1.4 CD-ROM contents (Laser Marker Smart Utility)............................................................................. 22

1.5 Product configuration...................................................................................................................... 23

1.6 Install Laser Marker Smart Utility................................................................................................... 24

1.7 Install the USB driver......................................................................................................................26

1.8 Uninstall Laser Marker Smart Utility...............................................................................................27

1.9 Start Laser Marker NAVI smart...................................................................................................... 27

1.10 Exit Laser Marker NAVI smart......................................................................................................28

1.11 Verify the Laser Marker NAVI smart version................................................................................ 28

2 Laser Marker NAVI smart preferences................................................................................... 29
2.1 Select the user interface language.................................................................................................29

2.2 Specify “General settings”.............................................................................................................. 29

2.3 Change the appearances of user interface elements.................................................................... 30

2.4 Manage fonts that can be used in offline mode.............................................................................31

3 Laser Marker NAVI smart basics............................................................................................ 33
3.1 User interface overview.................................................................................................................. 33

3.2 “Startup” screen.............................................................................................................................. 36

3.3 “Marking settings” screen............................................................................................................... 36

3.4 “Monitor” screen..............................................................................................................................37

3.5 “Maintenance” screen..................................................................................................................... 37

3.6 “Data management” screen............................................................................................................ 37

3.7 “System settings” screen................................................................................................................ 38

3.8 Availability of the screens...............................................................................................................38


10                                                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 11

Table of contents


3.9 User selection................................................................................................................................. 39

4 Online connection between PC and laser marking system................................................. 41
4.1 Online and offline mode................................................................................................................. 41

4.2 Establish a USB connection between PC and laser marking system............................................ 42

4.3 Establish an Ethernet connection between PC and laser marking system.................................... 43

4.4 Establish a Bluetooth connection between PC and laser marking system.....................................45

4.5 Disconnect an online connection....................................................................................................46

5 Operation of the laser marking system................................................................................. 47
5.1 Tool overview.................................................................................................................................. 47

5.2 Turn laser pumping on or off..........................................................................................................47

5.3 Start laser radiation with the “Start marking” button.......................................................................48

5.4 Stop laser radiation with the “Stop laser” button............................................................................49

5.5 Remote mode................................................................................................................................. 50
   5.5.1 Switch remote mode on and off by configuration software..................................................... 50

5.5.2 Automatically switch to remote mode at power-on................................................................. 51

5.5.3 Switch remote mode on and off by external devices.............................................................. 52

5.6 Perform marking in RUN mode...................................................................................................... 53

5.7 Perform test marking...................................................................................................................... 54

5.8 Guide laser......................................................................................................................................56

5.9 Check the work distance................................................................................................................ 58

5.10 Check the marking position using the guide laser....................................................................... 59

5.11 Indicate the marking field center using the pointer (LP-GS052)...................................................60
5.12 Perform marking time measurement............................................................................................ 60

5.13 Check the workpiece displacement.............................................................................................. 61

6 Work with files.......................................................................................................................... 63
6.1 About marking files......................................................................................................................... 63

6.2 Work with marking files in offline mode......................................................................................... 64

6.2.1 Create and save a marking file to your PC (offline mode)...................................................... 64

6.2.2 Open and save an existing marking file to your PC (offline mode)......................................... 65

6.3 Work with marking files in online mode......................................................................................... 66

6.3.1 Create and save a marking file to the laser marking system.................................................. 66

6.3.2 Open an existing marking file from the laser marking system................................................ 67

6.3.3 Open an existing marking file from your PC........................................................................... 68

6.3.4 Save a marking file to the laser marking system.................................................................... 69

6.4 Transfer a marking file from your PC to the laser marking system................................................ 69


ME-NAVIS2-OP-5                                                                                                                                                  11

---

## หน้า 12

Table of contents


6.4.1 Save a marking file on the “Data management” screen......................................................... 70

6.4.2 Save a marking file on the “Marking settings” screen.............................................................70

6.5 Work with font files......................................................................................................................... 71
   6.5.1 About font files.........................................................................................................................71

6.5.2 Add font files............................................................................................................................73

6.6 Manage files in the laser marking system......................................................................................74

6.6.1 Search for files.........................................................................................................................74

6.6.2 Copy, paste and delete files....................................................................................................75

6.6.3 Rename a marking file............................................................................................................ 75

6.6.4 Save data to your PC or another external memory................................................................ 76

6.7 Backup files.....................................................................................................................................77

6.7.1 About backup files................................................................................................................... 77

6.7.2 Backup the data.......................................................................................................................78
6.7.3 Edit a backup file.....................................................................................................................79

6.7.4 Restore a backup file.............................................................................................................. 80

6.7.5 Create a backup file for initial configuration............................................................................81

6.8 Convert files.................................................................................................................................... 82

6.8.1 Convert an LP-400/LP-V backup file.......................................................................................82

6.8.2 Convert an LP-400/LP-V file (.nlm)......................................................................................... 83

6.8.3 Conversion rules for LP-400/LP-V files................................................................................... 84

6.8.4 Convert an LP-M/LP-S/LP-Z backup file................................................................................. 86

6.8.5 Convert an LP-M/LP-S/LP-Z file (.zlm)....................................................................................87
6.8.6 Conversion rules for LP-M/LP-S/LP-Z files............................................................................. 88

7 Edit marking data..................................................................................................................... 90
7.1 Marking image editor...................................................................................................................... 90

7.2 Editing tools overview..................................................................................................................... 91

7.3 Move, modify or align objects........................................................................................................ 93

8 Built-in camera..........................................................................................................................95
8.1 About the built-in camera............................................................................................................... 95

8.2 Switch the camera on or off........................................................................................................... 95

8.3 Specify the camera settings........................................................................................................... 96

8.4 Adjust the camera lighting.............................................................................................................. 98

9 Marking object basics............................................................................................................100
9.1 Object type overview.................................................................................................................... 100

9.2 General object/object group parameters...................................................................................... 101


12                                                                                                                                        ME-NAVIS2-OP-5

---

## หน้า 13

Table of contents


9.3 Object list overview.......................................................................................................................101

10 Character object................................................................................................................... 104
10.1 Create a character object (direct input)......................................................................................104

10.2 Create a character object (reference list)...................................................................................105

10.3 Set a user-defined character...................................................................................................... 106

10.4 Change characters or reference character strings..................................................................... 107

10.5 Change the basic parameters of a character object.................................................................. 107

10.6 Set the arrangement of a character object.................................................................................108

10.7 Align a character object..............................................................................................................109

10.8 Change the position of a character object................................................................................. 110

10.9 Rotate a character object........................................................................................................... 111

10.10 Set the character spacing of a character object along a straight line.......................................112

10.11 Set the character spacing of a character object along an arc.................................................. 114

10.11.1 Set the character spacing by specifying an angle.............................................................115

10.11.2 Set the character spacing by specifying a length..............................................................116

10.12 Specify the line spacing of a character object......................................................................... 118

11 TrueType object.....................................................................................................................120
11.1 Create a TrueType object........................................................................................................... 120

11.2 Change the basic parameters of a TrueType object.................................................................. 121

11.3 Set the arrangement of a TrueType object.................................................................................121

11.4 Align a TrueType object.............................................................................................................. 122

11.5 Change the position of a TrueType object................................................................................. 123
11.6 Rotate a TrueType object........................................................................................................... 124

11.7 Set the character spacing of a TrueType object along a straight line.........................................125

11.8 Set the character spacing of a TrueType object along an arc....................................................127

11.9 Set kerning for TrueType objects................................................................................................128

11.10 Specify the line spacing of a TrueType object..........................................................................129

11.11 Apply fill settings to a TrueType object..................................................................................... 129

12 Graphic object...................................................................................................................... 131
12.1 Add graphic files using the “Graphic” tool.................................................................................. 131

12.2 Add graphic files in the “Data management” screen..................................................................132

12.3 Use graphic objects in a marking file......................................................................................... 133

12.4 Move a graphic object................................................................................................................ 133

12.5 Rotate a graphic object.............................................................................................................. 134

12.6 Edit a VEC file............................................................................................................................ 134


ME-NAVIS2-OP-5                                                                                                                                               13

---

## หน้า 14

Table of contents


12.7 Scale a VEC file......................................................................................................................... 135

12.8 Edit a DXF file in the “Marking settings” screen........................................................................ 136

12.9 Change the preset position of a DXF, HPGL, JPEG, BMP file.................................................. 137
12.10 Change the preset size of a DXF, HPGL, JPEG, BMP file...................................................... 138

12.11 Change the preset marking parameters for JPEG or BMP files............................................... 139

12.12 Change the preset marking parameters for DXF or HPGL files...............................................140

12.13 Tips for improving the marking quality of a graphic................................................................. 142

12.14 Tips for reducing the marking time of a graphic.......................................................................142

12.15 Supported DXF file formats...................................................................................................... 143

13 Shape object......................................................................................................................... 147
13.1 Create a line............................................................................................................................... 147

13.2 Create a circle............................................................................................................................ 148

13.3 Create an arc..............................................................................................................................149

13.4 Add or delete shapes in an existing shape object..................................................................... 151

13.5 Position or rotate a shape object............................................................................................... 151

14 Point radiation object...........................................................................................................153
14.1 Create a point radiation object................................................................................................... 153

14.2 Edit, add or delete a point in an existing point radiation object..................................................154

14.3 Position or rotate a point radiation object.................................................................................. 155

15 Bar code object.................................................................................................................... 156
15.1 Bar code types............................................................................................................................156

15.2 Create a bar code object............................................................................................................159

15.3 Invert a bar code object............................................................................................................. 161

15.4 Set the marking direction for a bar code object......................................................................... 162

15.5 Amend bar code data................................................................................................................. 162

15.6 Specify the position of a bar code object...................................................................................163

15.7 Rotate a bar code object............................................................................................................163

15.8 Set bar code parameters............................................................................................................164

15.9 Set parameters for GS1 DataBar............................................................................................... 165

15.10 Automatically optimize GS1 DataBar parameters.................................................................... 167

15.11 Set parameters for composite codes........................................................................................167

16 2D code object......................................................................................................................169
16.1 2D code types.............................................................................................................................169

16.2 Structure of a QR Code............................................................................................................. 172

16.3 Structure of a Data Matrix code................................................................................................. 173


14                                                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 15

Table of contents


16.4 Data capacity information........................................................................................................... 173

16.4.1 QR Code Model 1 versions and data capacity................................................................... 173

16.4.2 QR Code Model 2 versions and data capacity................................................................... 176
16.4.3 Micro QR Code versions and data capacity........................................................................179

16.4.4 Data Matrix symbol sizes and data capacity.......................................................................179

16.5 Create a 2D code object............................................................................................................ 181

16.6 Set parameters for QR Code, Micro QR Code, iQR Code.........................................................182

16.7 Set parameters for Data Matrix and GS1 DataMatrix................................................................ 184

16.8 Set the marking direction for QR Code and Data Matrix........................................................... 185

16.9 Set the module marking order for QR Code and Data Matrix.................................................... 186

16.10 Specify the position of a 2D code object................................................................................. 186

16.11 Rotate a 2D code object...........................................................................................................187

16.12 Specify filling pattern parameters for QR Code and Data Matrix............................................. 187
16.13 2D code pattern font.................................................................................................................189

16.14 Code element parameters for QR Code and Data Matrix........................................................ 191

16.14.1 Invert a QR Code or Data Matrix code............................................................................. 191

16.14.2 Set parameters for code elements.................................................................................... 191

16.14.3 Set laser correction parameters for code elements.......................................................... 193

16.15 Specify quiet zone filling parameters for QR Code and Data Matrix........................................ 194

16.16 PDF417 code parameters.........................................................................................................196

16.16.1 Set parameters for PDF417.............................................................................................. 196

16.16.2 Invert a PDF417 code....................................................................................................... 197
16.16.3 Set the marking direction for PDF417...............................................................................198

17 Human readable text parameters....................................................................................... 199
17.1 Set parameters for the human readable text............................................................................. 199

17.2 Set laser correction parameters for the human readable text.................................................... 202

18 Application Identifier (AI).....................................................................................................203
18.1 About Application Identifiers....................................................................................................... 203

18.2 AI prefix codes............................................................................................................................204

19 Object group settings.......................................................................................................... 207
19.1 Create, duplicate or delete an object group............................................................................... 207

19.2 Position and rotate an object group........................................................................................... 207

19.3 Set object group parameters...................................................................................................... 209

19.4 Use the step & repeat function.................................................................................................. 211

19.5 Configure counter parameters for a step & repeat object.......................................................... 212


ME-NAVIS2-OP-5                                                                                                                                              15

---

## หน้า 16

Table of contents


19.6 Specify parameters for an element of a step & repeat object.................................................... 214

20 3D marking function.............................................................................................................217
20.1 Introduction to 3D marking......................................................................................................... 217

20.2 3D viewer.................................................................................................................................... 222

20.2.1 User interface overview....................................................................................................... 222

20.2.2 Editing tools overview..........................................................................................................224

20.3 Create marking data for 3D marking..........................................................................................225

20.3.1 Create a 3D model.............................................................................................................. 225

20.3.2 Assign an object group........................................................................................................227

20.4 Change the position....................................................................................................................228

20.4.1 Change the position of an object group.............................................................................. 228

20.4.2 Change the position of a 3D model.................................................................................... 228

20.5 Basic settings for 3D marking.................................................................................................... 229

20.5.1 Mark on an inclined surface................................................................................................ 229

20.5.2 Mark on an uneven surface................................................................................................ 231

20.5.3 Mark on a cylinder - Example 1.......................................................................................... 233

20.5.4 Mark on a cylinder - Example 2.......................................................................................... 235

20.5.5 Mark on a horizontal cone...................................................................................................236

20.5.6 Mark on a vertical cone.......................................................................................................238

20.5.7 Mark on a sphere................................................................................................................ 239

21 Functional character settings............................................................................................. 241
21.1 Use functional characters........................................................................................................... 241
21.2 Functional characters for date and time.....................................................................................242

21.3 Functional characters for counters............................................................................................. 245

21.4 Functional characters for lot numbers........................................................................................ 246

21.5 Functional characters for laser settings......................................................................................247

21.6 Functional characters for external control.................................................................................. 248

22 Function settings..................................................................................................................251
22.1 Functions overview..................................................................................................................... 251

22.2 Configure parameters for the counter function...........................................................................252

22.3 Configure parameters for the expiry date and time function...................................................... 254

22.4 Configure parameters for the lot number function......................................................................257

22.5 Configure parameters for the register function (registered characters)...................................... 259

22.6 Configure parameters for the external offset function................................................................ 261

22.7 Specify reference character strings............................................................................................ 263


16                                                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 17

Table of contents


23 File setting.............................................................................................................................264
23.1 Position, rotate and mirror all objects in a file............................................................................264

23.2 Specify the East Asian character set......................................................................................... 265

23.3 Configure trigger parameters......................................................................................................265

23.4 Configure imagechecker settings............................................................................................... 267

23.5 Specify parameters under “Compatibility with former models”................................................... 269

23.6 Use the autofocus function.........................................................................................................271

24 Laser settings....................................................................................................................... 273
24.1 Set laser parameters.................................................................................................................. 273

24.2 Fine-tune the laser settings........................................................................................................ 274

24.3 Specify smart setting parameters............................................................................................... 279

24.4 Configure smart settings for marking applications..................................................................... 281

24.5 Configure smart settings for processing applications.................................................................282
24.6 Set laser correction parameters for a marking object................................................................ 283

24.7 Specify limits for the marking energy......................................................................................... 284

25 On-the-fly marking................................................................................................................287
25.1 About on-the-fly-marking.............................................................................................................287

25.2 On-the-fly marking settings for all files....................................................................................... 288

25.3 On-the-fly-marking settings for one file...................................................................................... 290

25.4 Trigger mode parameters........................................................................................................... 294

25.5 Line speed control setting “2 sensors input”.............................................................................. 296

25.6 Specify on-the-fly marking settings.............................................................................................296

26 System settings.................................................................................................................... 301
26.1 Display information about the laser marking system..................................................................301

26.2 Set the date and time.................................................................................................................301
26.3 Change calendar settings........................................................................................................... 302

26.4 Specify a name for the laser marking system............................................................................303

26.5 Set the error buzzer....................................................................................................................304

26.6 Specify remote mode settings.................................................................................................... 304

26.7 Use the time hold function......................................................................................................... 306

26.8 Specify settings for the controller display...................................................................................307

26.9 Select compatible mode............................................................................................................. 308

26.10 Configure advanced system settings........................................................................................310

26.11 Set parameters for the touch panel console and monitor.........................................................312

26.12 Specify the laser power correction........................................................................................... 313


ME-NAVIS2-OP-5                                                                                                                                           17

---

## หน้า 18

Table of contents


26.13 Adjust the marking field position.............................................................................................. 314

26.14 Set the laser head direction..................................................................................................... 315

26.15 Specify input and output settings............................................................................................. 316
26.16 Specify Ethernet communication settings.................................................................................317

26.17 Specify RS-232C communication settings................................................................................318

26.18 Enable Bluetooth.......................................................................................................................319

26.19 Specify EtherNet/IP communication settings............................................................................320

26.20 Specify PROFINET communication settings............................................................................ 322

26.21 Specify the command format....................................................................................................323

26.22 Make imagechecker communication settings........................................................................... 325

26.23 Specify settings for code reader functions............................................................................... 326

26.24 Specify settings for an external displacement sensor.............................................................. 327

26.25 Optimize the laser power of specific marking field areas.........................................................330
26.26 Marking field calibration............................................................................................................ 332

26.26.1 Calibrate the marking field.................................................................................................332

26.26.2 Details of distortion correction settings..............................................................................334

26.27 Specify the work distance offset...............................................................................................336

26.28 Set or disable a password........................................................................................................338

26.29 Delete a forgotten password.................................................................................................... 338

26.30 Configure permissions and customize the “Monitor” screen.................................................... 339

26.31 Specify more permissions and “Monitor” screen settings.........................................................340

27 Monitor the marking data.................................................................................................... 342
27.1 Monitor the marking data in remote mode or RUN mode.......................................................... 342

27.2 Select a marking file on the “Monitor” screen............................................................................ 344

28 Maintenance.......................................................................................................................... 345
28.1 Display operating data................................................................................................................ 345

28.2 Specify settings for maintenance tasks...................................................................................... 346

28.3 Show the error log...................................................................................................................... 347

28.4 Perform output simulation...........................................................................................................347

28.5 Check the communication command history..............................................................................348

28.6 Inspect the laser power with a commercial power meter........................................................... 349

28.7 Inspect the laser power with the power check function..............................................................352

28.8 Correct the laser power with the power check function............................................................. 353

28.9 Calibrate the built-in power monitor........................................................................................... 355

28.10 Show the power check history................................................................................................. 357


18                                                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 19

Table of contents


29 Troubleshooting.................................................................................................................... 359
29.1 List of common problems........................................................................................................... 359

29.2 Start-up........................................................................................................................................360

29.3 Laser pumping............................................................................................................................ 361

29.4 Connection with Laser Marker NAVI smart................................................................................ 362

29.5 Lasing process............................................................................................................................364

29.6 Marking quality............................................................................................................................367

29.7 On-the-fly marking (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV).......................................................372

29.8 External control........................................................................................................................... 375

29.9 Linking of image processing devices......................................................................................... 381

29.10 Built-in camera (LP-ZV)............................................................................................................ 383

29.11 Operation by touch panel console or monitor (LP-RH, LP-ZV)................................................ 384

29.12 Reset an alarm message (E001–E599)................................................................................... 387

29.13 Alarm messages (E001–E599).................................................................................................387

29.14 Reset a warning message (E600–799).................................................................................... 400

29.15 Warning messages (E600–E799)............................................................................................. 401

Index............................................................................................................................................ 420


ME-NAVIS2-OP-5                                                                                                                                                    19

---

## หน้า 20

1 Getting started


1        Getting started


1.1      Outline of Laser Marker NAVI smart

The software is required to configure the laser marking system and create the marking
data (online or offline). You can also use the software to control and to monitor the marking
process (online).

With Laser Marker NAVI smart you can set and operate the laser marking system as follows:

•   Create and edit the marking data (online or offline).

•   Operate and control the laser marking system (online).

•   Monitor the marking process of the laser marking system (online).

When a laser marking system is connected to a PC and selected in the software, you
are working in online mode, otherwise you are working offline. Offline, some screens and
functions such as start marking, saving files in laser marker systems or monitoring the I/O
are not available. If the laser marking system is in remote or RUN mode, only the monitor
screen is available.

An interaction of laser marking system and Laser Marker NAVI smart is only possible if one
of the three available online connection methods - USB, Ethernet or Bluetooth - is configured
and established.

For details about the connection methods (USB, Ethernet or Bluetooth), refer to the “Setup
and Maintenance Guide” of your laser marking system.

There are some important prerequisites and conditions regarding the interaction between
laser marking system and Laser Marker NAVI smart.

•   Before you can start the marking process, the laser marking system needs to be pumped
   and ready for the marking process.

•   Before you can mark the content of a file together with the defined settings, you need to
   save the file in the laser marking system.

•   In test marking mode, you start the marking by manually triggering the laser emission
   from Laser Marker NAVI smart.

•   In RUN mode, either a signal from Laser Marker NAVI smart or I/O signals from an
   external device start the laser emission.

•   In remote mode, you automatically control the laser marking system by I/O signals, by
   communication commands or by the integration of imagechecker and code reader.


20                                                                                               ME-NAVIS2-OP-5

---

## หน้า 21

1.2 PC requirements


1.2    PC requirements

To verify your PC's capacities, open the “Windows Settings” and check your resources under
“System”.

•   Operating system: Microsoft Windows 11 Pro (64 bit), Microsoft Windows 10 Pro (32 bit,
   64 bit)
   Operating system versions that are no longer supported by Microsoft are excluded.

•   Free disk space: ³512MB

•   CD-ROM drive (when installing from a CD-ROM): In the product package of the LP-GS,
   LP-RC, LP-RF, LP-RV series, a CD-ROM with the software package Laser Marker Smart
   Utility is included. To install the software on a PC without CD-ROM drive, copy all CD-
   ROM data to the PC before installation. Use an external storage media such as a USB
   flash drive to copy the data.

•   USB 2.0 or 3.0 interface
•   LAN (for Ethernet): 10BASE-T or 100BASE-TX

•   Bluetooth: Version 2.0/2.1/3.0
   Bluetooth wireless technology is available for LP-GS051, LP-GS051-E, LP-GS051-L, LP-
   GS051-LE, LP-GS052 and LP-GS052-E.

•   PC memory: ³2GB

•   CPU: Equivalent to or higher than Intel Core i3

•   Screen resolution: ³1366x768 pixels

•   Display size: ³10.6"

•   Peripherals: Mouse or other pointing device, keyboard or other input device


1.3    Download Laser Marker Smart Utility

Download the software package Laser Marker Smart Utility from the following Web site:
https://industry.panasonic.com/global/en/downloads/?tab=software

In “Download Center” > “Software”, use the “Part Number Search” with your laser marking
system series name, like LP-ZV, to find the relevant software.

The ZIP file contains the Laser Marker NAVI smart software, additional software tools and
user manuals in several languages.

•   PC software tools
   Laser Marker NAVI smart: The software is required to configure the laser marking
   system and create the marking data (online or offline). You can also use the software
   to control and to monitor the marking process (online).
   Logo Data Editing: With this software, you can create and edit graphic data (.vec) for
   the marking process.


ME-NAVIS2-OP-5                                                                                               21

---

## หน้า 22

1 Getting started


Font Maker: This exclusive software creates and edits the font data (.fon) used for the
marking process.

•   PDF manuals
   Language versions not included in the ZIP file can be downloaded from local Panasonic
   Web sites.
   “Laser Safety Guide”
   “Setup and Maintenance Guide”
   “Serial Communication Command Guide”
   “Serial Communication Command Guide: LP-400/V compatible mode”
   “Serial Communication Command Guide: LP-M/S/Z compatible mode”
   “Laser Marker NAVI smart Operation Manual”
   “Logo Data Editing Software Operation Manual”
   “Font Maker Operation Manual”


Note

ExportVEC, a plug-in software for Adobe Illustrator, is not included in the ZIP file.
If you want to convert .ai or .eps files to the graphic file format .vec used in laser
marking systems, download the file “export_vec.zip” from the following Web site: https://
industry.panasonic.com/global/en/downloads/?tab=software

In “Download Center” > “Software”, use the “Part Number Search” with your laser marking
system series name, like LP-ZV, to find the relevant software.


Related topics

Install Laser Marker Smart Utility (page 24)


1.4      CD-ROM contents (Laser Marker Smart Utility)

In the product package of the LP-GS, LP-RC, LP-RF, LP-RV series, a CD-ROM with the
software package Laser Marker Smart Utility is included.

The CD-ROM contains the Laser Marker NAVI smart software, additional software tools,
fonts and sample files, as well as user manuals in several languages.

•   PC software tools
   Laser Marker NAVI smart: The software is required to configure the laser marking
   system and create the marking data (online or offline). You can also use the software
   to control and to monitor the marking process (online).
   Logo Data Editing: With this software, you can create and edit graphic data (.vec) for
   the marking process.
   Font Maker: This exclusive software creates and edits the font data (.fon) used for the
   marking process.

•   Fonts


22                                                                                              ME-NAVIS2-OP-5

---

## หน้า 23

1.5 Product configuration


At the factory, all included font files are already installed in the laser marking system.
These font files are saved to your PC when you install Laser Marker NAVI smart.
   Original 1, Original 2, Original 3, Original 4, Original 5
   Original 1, Original 2, and Original 3 with smaller font size
   ORG3-L1
   DINLIKE1-L1
   JIS level 1, JIS level 2
   GB 2312 level 1, GB 2312 level 2
   User-defined font
   2D code pattern font
   OCR1

•   Sample files
   For all laser marker models, samples of backup files (.lmb), marking files (.lms) and
   graphic files (.vec/.dxf) are included on the CD-ROM.

•   PDF manuals
   Language versions not included on the CD-ROM can be downloaded from local
   Panasonic Web sites.
   “Laser Safety Guide”
   “Setup and Maintenance Guide”
   “Serial Communication Command Guide”
   “Serial Communication Command Guide: LP-400/V compatible mode”
   “Laser Marker NAVI smart Operation Manual”
   “Logo Data Editing Software Operation Manual”
   “ExportVEC Operation Manual”
   “Font Maker Operation Manual”


Note

ExportVEC, a plug-in software for Adobe Illustrator, is not included in the ZIP file.
If you want to convert .ai or .eps files to the graphic file format .vec used in laser
marking systems, download the file “export_vec.zip” from the following Web site: https://
industry.panasonic.com/global/en/downloads/?tab=software

In “Download Center” > “Software”, use the “Part Number Search” with your laser marking
system series name, like LP-ZV, to find the relevant software.


1.5    Product configuration

The product configuration includes a laser head, a controller, a PC and for LP-RV/LP-ZV an
oscillator unit.

The following figure shows an example of a laser marking system configuration.

The illustration of the laser head and controller may differ from your laser marking system.


ME-NAVIS2-OP-5                                                                                                    23

---

## หน้า 24

1 Getting started


(2)

(1)


(4)


(3)


(1)    Laser head
   The laser head emits the laser beam. Inside are the optical components and the galvano scanner.
(2)    Controller
   The controller generates the marking data. It provides the main power supply of the laser marker
   and the interfaces for external devices.
(3)    PC (not included in the product package)
   To configure the laser marker, you must connect a PC and install Laser Marker NAVI smart. The
   software is required to configure the laser marking system and create the marking data (online or
   offline). You can also use the software to control and to monitor the marking process (online).
(4)    USB cable
   The USB cable connects the controller with a personal computer (PC).

For more details regarding the product configuration, refer to the “Setup and Maintenance
Guide” of your laser marking system.


1.6      Install Laser Marker Smart Utility

To use the configuration software Laser Marker NAVI smart and additional software tools,
install the software package Laser Marker Smart Utility on your PC. Normally during the
installation process the Microsoft .NET Framework 4.8 and the USB driver is installed, if not
yet available.

For LP-GS, LP-RC, LP-RF, LP-RV, Laser Marker Smart Utility is provided on the CD-ROM
delivered with the laser marking system. For LP-RH and LP-ZV, Laser Marker Smart Utility is
included in the ZIP file “laser_marker_smart_utility_v3.zip” which you can download from the
Web site.

If all necessary components are in place, the installation of Laser Marker NAVI smart takes
at least 5 minutes.

•     This software can be installed on multiple computers to the extent necessary for effective
   use of the product on the condition that the software is not used simultaneously.

•     The software license agreement is displayed on the screen during installation. You must
   accept this agreement, to use the software.


24                                                                                                       ME-NAVIS2-OP-5

---

## หน้า 25

1.6 Install Laser Marker Smart Utility


•    When you install Laser Marker Smart Utility, all software tools except for ExportVEC are
   automatically installed on your PC. For the installation procedure of ExportVEC, refer to
   the “ExportVEC Operation Manual”.

                 1.      Start your PC.
                 2.      LP-GS, LP-RC, LP-RF, LP-RV: If your PC has a CD-ROM drive, insert the CD-ROM
                         labeled “Laser Marker Smart Utility” into the CD-ROM drive. The installation starts
                         automatically.
                         To install the software on a PC without CD-ROM drive, copy all CD-ROM data to the
                         PC before installation. Use an external storage media such as a USB flash drive to
                         copy the data. Open the following file to start the installation:
                         [CD-ROM]\Setup\Laser Marker Smart Utility\setup.exe
                         LP-RH, LP-ZV: Download “laser_marker_smart_utility_v3.zip” from the Web site and
                         unzip the file to any location on your PC. The folder “laser_marker_smart_utility_v3”
                         opens. Select “Setup” > “Laser Marker Smart Utility”, and double-click on “setup.exe”
                         to start the installation.

                 3.      Select the language of the software and select “OK”.
                         The interface language can later be changed directly in Laser Marker NAVI smart. It is
                         recommended that the OS language corresponds to the interface language. If the OS
                         language is not among the supported languages, install Laser Marker NAVI smart in
                         English.

                 4.      If Microsoft .NET Framework 4.8 is not installed on the PC, it appears in the list of
                         uninstalled, but required components. Select “Microsoft .NET Framework 4.8” and
                         “Install” to start the installation.

                 5.      If the USB driver is not installed on the PC, it appears in the list of the uninstalled, but
                         required components. Select the USB driver and “Install” to start the installation.
                         If this screen does not appear, proceed with step 6.

                         a.   Select the language of the installation wizard and select “OK”.
                              The installation wizard starts.
                         b.   Select “Next”.
                              The software license agreement appears.

                         c.   Read the license agreement and select “I accept the terms in the license
                              agreement”, if you agree. Select “Next”.

                         d.   Select “Install” to start the installation of the USB driver for the laser marking
                              system.
                              The “Windows Security” dialog appears.

                         e.   Select “Install”. After the USB driver is installed select “Finish”.

                 6.      The installation dialog of Laser Marker Smart Utility appears. Select “Next”.
                         If the installation dialog of Laser Marker Smart Utility does not appear, open the
                         following file to start the installation manually:
                         LP-GS, LP-RC, LP-RF, LP-RV: [CD-ROM]\Setup\Laser Marker Smart Utility\setup.exe
                         LP-RH, LP-ZV: laser_marker_smart_utility_v3\Setup\Laser Marker Smart Utility
                         \setup.exe

                 7.      Read the license agreement and select “I accept the terms in the license agreement”,
                         if you agree. Select “Next”.


ME-NAVIS2-OP-5                                                                                                     25

---

## หน้า 26

1 Getting started


                    8.      Input your information and select “Next”.

                    9.      Select the destination folder for the installation and select “Next”. The default
                            installation folder is:
                            •   C:\Program Files\Panasonic Industry Laser\Laser Marker Smart Utility or
                            •   C:\Program Files (x86)\Panasonic Industry Laser\Laser Marker Smart Utility

                    10.     Select “Install” to start the installation of Laser Marker Smart Utility.

                    11.     Select “Finish” to close the window of the installation wizard.
                            The installation of Laser Marker Smart Utility is completed.
                            LP-RH, LP-ZV: Save any documents you want to keep for future use, for example the
                            PDF manuals for your laser marking system. They are contained in the “Document”
                            folder of the downloaded ZIP file. After the software installation, you can delete files
                            you do not need anymore.


Related topics

PC requirements (page 21)

Download Laser Marker Smart Utility (page 21)

Install the USB driver (page 26)

Start Laser Marker NAVI smart (page 27)


1.7      Install the USB driver

The installation of the USB driver is required for each laser marking system that will be
connected with a PC.

Before you connect the PC and the laser marking system, complete the installation of Laser
Marker Smart Utility.

                    1.    Connect the laser marking system and the PC with a USB cable.

                    2.    A popup message appears in the notification area of the Windows task bar.
                          The installation of the USB driver software starts automatically.


Related topics

Install Laser Marker Smart Utility (page 24)


26                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 27

1.8 Uninstall Laser Marker Smart Utility


1.8    Uninstall Laser Marker Smart Utility

Uninstall the software package Laser Marker Smart Utility if it is no longer used to configure
or control a laser marking system.

                 1.    Depending on your Windows operating system version, do any of the following.
                       •   In Windows 10, open the start menu and select “Settings” > “Apps” > “Apps and
                           Features” .

                       •   In Windows 11, right-click on the start button to open the start menu and select “Apps
                           and Features”.

                 2.    Open “Panasonic Industry Laser Marker Smart Utility” in the list of installed programs.

                 3.    Select “Uninstall” to uninstall the Laser Marker Smart Utility.

                 4.    Open “Panasonic Industry Laser LMPD USB Driver 64-bit (x64)” or “Panasonic Industry
                       Laser LMPD USB Driver 32-bit (x32)” in the list of installed programs.
                       If you will re-install Laser Marker Smart Utility later, you can leave the USB driver
                       installed.

                 5.    Select “Uninstall” to uninstall the USB driver.


1.9    Start Laser Marker NAVI smart

The software is required to configure the laser marking system and create the marking
data (online or offline). You can also use the software to control and to monitor the marking
process (online).

Depending on your Windows operating system version, do any of the following.
 ‒ In Windows 10, open the start menu and select “Panasonic Industry Laser” > “Laser
   Marker NAVI smart”.

‒ In Windows 11, open the start menu and select “All apps” > “Panasonic Industry
  Laser” > “Laser Marker NAVI smart”.

Laser Marker NAVI smart starts and displays the “Startup” screen.


Related topics

Exit Laser Marker NAVI smart (page 28)


ME-NAVIS2-OP-5                                                                                                   27

---

## หน้า 28

1 Getting started


1.10     Exit Laser Marker NAVI smart

Close Laser Marker NAVI smart if you no longer need it to create marking data or configure
the laser marking system.

If you changed a marking file, make sure to save your work before closing the software.

You have two options to close Laser Marker NAVI smart.
 ‒ Go to the “Startup” screen and select “Exit” from the menu.

‒ Select “X” in the upper right corner of the screen.


1.11     Verify the Laser Marker NAVI smart version

Knowing the Laser Marker NAVI smart version that is installed on you PC can help you
determine whether the software is up to date.

The version of Laser Marker NAVI smart is displayed in the title bar (for example Laser
Marker NAVI smart Version 3.1.0). For detailed information, you can display the dialog
containing the version number.

                    1.    Go to the “Startup” screen.

                    2.    Select “Product information” from the menu.

                    3.    To open the dialog containing detailed information, select “Version”.


Note

To check the version of the connected laser marking system, go to the “System settings”
screen and select “System information”.


28                                                                                                ME-NAVIS2-OP-5

---

## หน้า 29

2.1 Select the user interface language


2      Laser Marker NAVI smart preferences


2.1    Select the user interface language

In the “Language” menu, you can change the user interface language of Laser Marker NAVI
smart.

Changing the user interface language of Laser Marker NAVI smart, will not change the
language of the other software tools. For Logo Data Editing and Font Maker, the user
interface language remains the language selected during installation of the Laser Marker
Smart Utility.

                 1.   On the “Startup” screen, select “Language”.

                 2.   From the language list, select the desired language. The following languages are
                      available: German, English, Japanese, Korean, Simplified Chinese, Traditional Chinese.
                 3.   Confirm the dialog that appears with “Yes”.
                      Laser Marker NAVI smart restarts to update the language settings.


2.2    Specify “General settings”

In the “General settings” dialog, you can specify your preferred settings or set a default
behavior for selected functions.

                 1.   On the “Startup” screen, select “Preferences”.

                 2.   Select “General settings”.

                 3.   In the dialog, configure any of the following settings:
                      •   “Screen refresh of "Monitor" screen”:
                          Specify the screen refresh settings that update the “Monitor” screen with any recent
                          changes you might have applied. The setting updates the marking image, the
                          “Current settings” and “Reference character strings” tabs. If the marking file contains
                          a large amount of data and the display is loading slowly, set a longer refresh interval.
                          Alternatively, set “Method” > “Button “Refresh screen”” to use the manual refresh
                          option.
                           ‒ “Method”:
                              “Auto”: Updates the “Monitor” screen automatically at regular intervals that you
                              specified.
                              “Button “Refresh screen””: Select this option if you want to refresh the “Monitor”
                              screen manually using the “Refresh screen” button.

                           ‒ “Refresh interval [s]”:
                              If “Auto” is set for “Method”, specify the interval period for refreshing the
                              “Monitor” screen (initial setting: 0.5s).


ME-NAVIS2-OP-5                                                                                                  29

---

## หน้า 30

2 Laser Marker NAVI smart preferences


•   “Online connection” > “Enable "Including Ethernet connections" by default”:
   Enable this check box if you regularly establish an Ethernet connection. With this
   setting, the check box “Including Ethernet connections” in the “Connection” dialog is
   always selected. If you do not use an Ethernet connection, deselect the check box to
   reduce the searching time for the laser marking system. (initial setting: disabled)

•   “Marking image editor” > “Apply offset when pasting objects.”:
   Specify that a copied marking object is offset when pasted in the marking image
   editor. If “Apply offset when pasting objects.” is selected, a replica of the marking
   object is pasted with an offset from the position of the original object. If you deselect
   the check box, the copied marking object is pasted at the same position as the
   original object (initial setting: enabled).

•   “Show dialog” > “Display results after test marking.” (LP-RH, LP-ZV):
   Specify if the dialog with the test marking results is always shown or hidden after test
   marking. (initial setting: enabled)

                 4.   Select “Apply” to save the settings.

                 5.   To close the dialog, select “Close” or “X”.


Related topics

Monitor the marking data in remote mode or RUN mode (page 342)

Establish an Ethernet connection between PC and laser marking system (page 43)

Perform test marking (page 54)

Editing tools overview (page 91)


2.3     Change the appearances of user interface elements

You can customize the colors of objects in the marking image editor and the appearance of
elements such as grid line type or color of rulers.

LP-ZV: These settings are not applied to the 3D marking image editor.

                 1.   On the “Startup” screen, select “Preferences”.

                 2.   Select “Color and appearance”.

                 3.   In the dialog, configure any of the following settings:
                      •   “Grid line”: Specify the appearance of the grid lines in the marking image editor.
                             “Grid line spacing [mm]”
                             “Color of grid lines”
                             “Grid line type”

                      •   “Marking data”: Choose the desired display colors for various objects.
                             “Color of marking objects”
                             “Color of marking objects in camera view” (LP-ZV)
                             “Color of selected objects”


30                                                                                               ME-NAVIS2-OP-5

---

## หน้า 31

2.4 Manage fonts that can be used in offline mode


   “Color of masked objects”
   “Color of step & repeat objects”
   “Color of selection area”: Specify the color of the rectangular selection area that
   appears when you select marking objects by dragging over them.
•   “Background”: Specify the appearance of interface elements in the marking image
   editor.
   “Background color of marking field”
   “Color of center lines”
   “Center line type”
   “Color of rulers”
   “Color of workpiece reference boundary” (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)
   “Type of workpiece reference boundary” (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)

                 4.   Select “Apply” to save your settings.
                      To restore the default settings, select “Reset to default”.

                 5.   To close the dialog, select “Close” or “X”.


Related topics

User interface overview (page 33)

Marking image editor (page 90)


2.4    Manage fonts that can be used in offline mode

The default fonts can be used for editing a marking file in offline mode. If you need to use a
custom font, you must add the font before editing the marking file.

The “Data management” screen is not available when editing a marking file in offline mode.

If you add a custom font for offline editing, you must add this font in the “Data management”
screen when the laser marking system is connected to your PC.

                 1.   Start Laser Marker NAVI smart.

                 2.   On the “Startup” screen, select “Preferences”.

                 3.   Select “Fonts for offline editing”.
                      A dialog opens and shows the font list.

                 4.   Select an empty table row to add the custom font.
                      A font must be assigned to a suitable font number in the table (J1, J2, GB1, GB2, etc.).
                      If necessary, you can also overwrite an existing font file. In this case, select an existing
                      font number that you want to overwrite.

                 5.   Select “Add”.


ME-NAVIS2-OP-5                                                                                                     31

---

## หน้า 32

2 Laser Marker NAVI smart preferences


                 6.   Choose a font file from your local or network drive and select “Open”.
                      Use only font files in the .fon format. Windows TrueType fonts cannot be saved as font
                      files in the laser marking system. Create a TrueType object to use a TrueType font in
                      your marking file.

                      The custom font is added to the list and can be used when editing a marking file in
                      offline mode.

                 7.   To close the dialog, select “Close”.


Related topics

About font files (page 71)

Add font files (page 73)

TrueType object (page 120)


32                                                                                             ME-NAVIS2-OP-5

---

## หน้า 33

3.1 User interface overview


3        Laser Marker NAVI smart basics


3.1      User interface overview

To create and edit marking files or configure the laser marking system, Laser Marker NAVI
smart provides various user interface elements, such as tools in the ribbon, icons, tabs and
screens.

The most important user interface elements are explained using the “Marking settings”
screen as an example.

   8 7
1
2
3


4                                                                                             6


5

(1)   Title bar
(2)   Screen tabs
(3)   Ribbon
(4)   Marking image editor
(5)   Status bar
(6)   Tabs to set the marking data
(7)   Help
(8)   User selection


Title bar (1)

The title bar across the top shows the version number of Laser Marker NAVI smart
and connection status “Online”, “Offline” (editing a marking file in offline mode) or
“Backup” (editing a backup in offline mode).


ME-NAVIS2-OP-5                                                                                                 33

---

## หน้า 34

3 Laser Marker NAVI smart basics


•   “Online”: Information about the connected laser marking system (model number, serial
   number of the laser head, and the laser marker name if it was set) are displayed in the
   title bar.

•   “Offline”: The model name of the laser marking system and the name of the marking file
   (.lzs or .lms) that is being edited are displayed in the title bar.

•   “Backup”: The model number of the backed up laser marking system and the name of the
   backup (.lzb or. lmb) that is being edited are displayed in the title bar.


Screen tabs (2)

The selectable tabs vary depending on the application mode. In online mode (e.g. logged in
as administrator and with remote mode set to off), you will see the following screen tabs:

•   “Startup”

•   “Marking settings”

•   “Monitor”

•   “Maintenance”

•   “Data management”

•   “System settings”


Ribbon (3)

The ribbon in the “Marking settings” screen contains tools to execute file handling, create or
edit marking data and control the laser marking system. Tools displayed in the ribbon vary
depending on the model of the laser marking system, and the screen you selected. You can
do the following with the tools:

•   Open files for editing.
•   Save files.

•   Undo or redo an operation.

•   Create marking objects (“Character”, “TrueType”, “Graphic”, “Shapes”, “Bar code”, “2D
   code”, “Point radiation”).

•   Add an object group to organize marking objects.

•   Align and distribute marking objects.

•   Modify character objects (e.g. increase or reduce line spacing).

•   Copy, paste, cut or delete a marking object.

•   Create a 3D marking layout (LP-ZV)

•   Switch the camera on and change its settings (LP-ZV)

•   Perform the test marking and guide laser operation with the “Test marking” and “Guide
   laser” tools.

•   Establish an online connection or go offline. The icon of the “Connection” tool indicates
   the connection status of the laser marking system.


34                                                                                             ME-NAVIS2-OP-5

---

## หน้า 35

3.1 User interface overview


•   Use the “Operation” tool to switch the laser marking system operation to remote or RUN
   mode.

•   Turn laser pumping on or off. The status icon of the “Laser pumping” tool will change to
   indicate that laser pumping is off or completed.
•   Use the “Stop laser” button to terminate the laser radiation or disable the laser radiation
   temporarily, for example when the workpiece is burning.


Marking image editor (4)

In the marking image editor, marking objects such as characters or graphics are displayed.

LP-ZV: If a PC and the laser head are connected and the camera is turned on, the image
taken by the built-in camera is displayed in the marking image editor.


Status bar (5)

The status bar appears at the bottom of the Laser Marker NAVI smart window if a laser
marking system is connected. It displays any of the following information:

•   Current operation mode (remote mode or RUN mode)

•   Laser pumping status (on or off)

•   Error number, error message, and for an error that cannot be reset, an icon that opens
   the error dialog


Tabs to set the marking data (6)

Set the marking data in the following tabs:

•   “Object settings”

•   “Function settings”

•   “File settings”

•   “Laser settings”

•   “On-the-fly marking” (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)


Help (7)

Select the help icon to open the Laser Marker NAVI smart help topics.


User selection (8)

To change the user, select the user icon. If you select “Administrator” in the dialog and
a password was set, you must log in with the password. The password can be set in the
“System settings” screen.


ME-NAVIS2-OP-5                                                                                                     35

---

## หน้า 36

3 Laser Marker NAVI smart basics


Related topics

Marking image editor (page 90)

“Marking settings” screen (page 36)

Set or disable a password (page 338)

Availability of the screens (page 38)

3D viewer (page 222)


3.2     “Startup” screen

When you launch Laser Marker NAVI smart, the “Startup” screen appears.


You can do the following:

•   Establish an online connection with a laser marking system.

•   Disconnect a laser marking system.

•   Open an existing marking file (offline mode).

•   Create a new marking file (offline mode).

•   Open backup files (offline mode).

•   Change the user interface language.

•   Customize user interface elements.

•   Open help topics.

•   View the software version.

•   Exit the software.


3.3     “Marking settings” screen

In this screen, you can create and edit marking data such as character, graphic and bar code
objects and save them in a file.


You can do the following:

•   Create new marking data.

•   Edit a marking or backup file that is saved on a local or network drive (offline mode).

•   Edit a marking file that is saved on the laser marking system (online mode).

•   Execute test marking (online mode).


36                                                                                             ME-NAVIS2-OP-5

---

## หน้า 37

3.4 “Monitor” screen


3.4     “Monitor” screen

In this screen, you can monitor the operation status of the laser marking system during
remote mode or RUN mode.


You can do the following:

•   Check the marking image.

•   Check the marking settings (only enabled parameters are displayed).

•   Check the ON or OFF status of I/O terminals.

•   Check data for on-the-fly marking.

•   Check the marking energy (LP-ZV).


3.5     “Maintenance” screen

This screen is used for the maintenance of the laser marking system.


You can do the following:

•   Check the operating data.

•   Check the error log.

•   Check the communication command history.

•   Check and correct the laser power using the built-in power monitor (LP-ZV).

•   Start laser radiation to measure the laser power (commercial power meter required).
•   Simulate output operation.


3.6     “Data management” screen

This screen lists all files that are currently saved on the laser marking system, including
marking files, graphic files and font files.


You can do the following:

•   Add or delete a marking file, graphic file, or font file.

•   Copy a backup file from the laser marking system.

•   Save a backup file or restore it to the laser marking system.

•   Change the name of a marking file.


ME-NAVIS2-OP-5                                                                                                 37

---

## หน้า 38

3 Laser Marker NAVI smart basics


3.7     “System settings” screen

In this screen, you set the system properties of the laser marking system. If changes are
required, make the settings before operation.


You can do the following:

•   View information about the laser marking system.

•   Change the date and time of the system clock.

•   Make settings for communication with external devices.

•   Specify input and output settings.

•   Make settings for laser power correction and marking position offset.

•   Calibrate the marking field (LP-RF, LP-RV, LP-ZV).

•   Set the administrator password.


3.8     Availability of the screens

The availability of screens depends on the application mode and the user role (administrator
or restricted user).

To go to another screen, select a screen tab. The screen tabs are not displayed on the
“Startup” screen.


Online mode

•   If remote mode is off and you are logged in as “Administrator”, the following screens are
   available:
   “Startup”, “Marking settings”, “Monitor”, “Maintenance”, “Data management”, “System
   settings”

•   If remote mode is off and you are logged in as “Restricted user”, the following screens are
   available:
   “Startup”, “Marking settings”, “Monitor”, “Maintenance”

•   If remote mode or RUN mode is on, the following screens are available:
   “Startup”, “Monitor”


Offline mode

•   If you edit a backup file, the following screens are available:
   “Startup”, “Marking settings”, “Maintenance”, “Data management”, “System settings”

•   If you edit a marking file, the following screens are available:


38                                                                                            ME-NAVIS2-OP-5

---

## หน้า 39

3.9 User selection


“Startup”, “Marking settings”


Password protection

You can set a password that is required when switching the user from “Restricted user” to
“Administrator”.

In offline mode, you cannot select a user.


The password protection of this configuration software is designed for the purpose to prevent a wrong
configuration or unintended operation. You cannot use this password for security purpose.


Related topics

Set or disable a password (page 338)

Delete a forgotten password (page 338)

User selection (page 39)

Online and offline mode (page 41)


3.9    User selection

You can select between two user roles “Restricted user” or “Administrator”. In offline mode,
you cannot select a user.


“Restricted user”

The access to screens and settings is restricted. The following screens are available if
remote mode is off: “Startup”, “Marking settings”, “Monitor”, “Maintenance”.

The parameters in the “Marking settings” screen that a “Restricted user” is allowed to edit,
can be configured in “System settings” > “Access permissions”. You must be logged in as
“Administrator” to configure these settings.

LP-RH, LP-ZV: If you use the optional touch panel console or a commercially available
monitor, you can only edit the parameters allowed for the “Restricted user”, regardless of the
currently set user role.


“Administrator”

As “Administrator” you have access to all screens and settings. The following screens are
available if remote mode is off: “Startup”, “Marking settings”, “Monitor”, “Maintenance”, “Data
management”, “System settings”.


ME-NAVIS2-OP-5                                                                                                       39

---

## หน้า 40

3 Laser Marker NAVI smart basics


User selection

A password was not set for the “Administrator” role:

•   When you establish an online connection between your PC and laser marking system,
   the default user role is set to “Administrator”.

A password was set for the “Administrator” role:

•   When you establish an online connection between your PC and laser marking system,
   the “User selection” dialog appears.

•   Select “Restricted user” or “Administrator”.

•   If you select “Administrator”, enter the password and select “OK”.

•   A password is not required if you select “Restricted user”.


Switch the user

•   To switch the user from “Restricted user” to “Administrator”, select the user icon.


User icon


•   The “User selection” dialog appears.

•   Select “Administrator”, enter the password if it was set and select “OK”.

•   The user icon changes to indicate the “Administrator” role.


User icon for “Administrator”


Related topics

Set or disable a password (page 338)

Configure permissions and customize the “Monitor” screen (page 339)


40                                                                                                ME-NAVIS2-OP-5

---

## หน้า 41

4.1 Online and offline mode


4      Online connection between PC and laser marking system


4.1    Online and offline mode

The PC configuration software Laser Marker NAVI smart is in online mode if your PC and the
laser marking system are connected via USB, Bluetooth, or Ethernet. In offline mode, there
is no connection between the devices.

An online connection between your PC and the laser marking system is required to configure
the laser marking system and to save the marking data to the laser marking system. In online
mode, you can use the PC to control operations such as laser pumping or marking.

In offline mode, you can create and edit marking files (including backup files) saved on local
or network drives.

The status icon of the “Connection” tool indicates an online or offline connection.


(1)              (2)

(1)       Online mode icon
(2)       Offline mode icon


Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
system failure may occur.
Do not disconnect the USB or LAN cable while the laser marking system is online.


Note

•     The online connection between the laser marking system and the PC is disabled when
   the PC goes into sleep mode. When the laser marking system is in remote or RUN mode,
   the operation mode (remote or RUN mode) is maintained, but the online connection is
   disabled. Deactivate the sleep mode setting of the PC to prevent a disconnection.

•     One PC can be connected with multiple laser marking systems. However, you can only
   establish one online connection at a time. The laser marking system which is connected
   is displayed in the “Connection” dialog together with the online mode icon. To configure
   and to control more than one laser marking system, you must switch the connected
   device in the software.

•     If your version of Laser Marker NAVI smart does not support the connected laser marker
   model, some functions and operations cannot be set or executed online.


ME-NAVIS2-OP-5                                                                                                         41

---

## หน้า 42

4 Online connection between PC and laser marking system


Related topics

Establish a USB connection between PC and laser marking system (page 42)

Establish an Ethernet connection between PC and laser marking system (page 43)

Establish a Bluetooth connection between PC and laser marking system (page 45)

Disconnect an online connection (page 46)


4.2     Establish a USB connection between PC and laser marking system

The PC and the laser marking system can be connected via USB, Bluetooth, or Ethernet.

You can connect more than one laser marker to a PC, e.g. using a USB hub.

Laser Marker NAVI smart must be installed on your PC.

                 1.   Connect the laser marking system and the PC with a USB cable.
                      Connect the USB cable to the USB interface B on the controller.

                 2.   Start the laser marking system.

                 3.   Start Laser Marker NAVI smart.

                 4.   On the “Startup” screen, select “Online” to open the “Connection” dialog.
                      Any laser marking system that is ready for an online connection is displayed in the list.
                      If the desired laser marking system is not in the list, select “Search laser marker”.

                 5.   Select the laser marking system that you want to connect.

                 6.   Select “Connect” to establish the connection.
                      When the online connection is established, the “Marking settings” screen appears.


                  •   Do not turn off the power supply during an online connection with your PC. Otherwise a data loss
                      or system failure may occur.
                  •   Do not disconnect the USB cable while the laser marker is online.


42                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 43

4.3 Establish an Ethernet connection between PC and laser marking system


Note

•    The online connection between the laser marking system and the PC is disabled when
   the PC goes into sleep mode. When the laser marking system is in remote or RUN mode,
   the operation mode (remote or RUN mode) is maintained, but the online connection is
   disabled. Deactivate the sleep mode setting of the PC to prevent a disconnection.

•    One PC can be connected with multiple laser marking systems. However, you can only
   establish one online connection at a time. The laser marking system which is connected
   is displayed in the “Connection” dialog together with the online mode icon. To configure
   and to control more than one laser marking system, you must switch the connected
   device in the software.

•    If your version of Laser Marker NAVI smart does not support the connected laser marker
   model, some functions and operations cannot be set or executed online.


Related topics

Start Laser Marker NAVI smart (page 27)


4.3    Establish an Ethernet connection between PC and laser marking system

The PC and the laser marking system can be connected via USB, Bluetooth, or Ethernet.
For Ethernet connections, use a LAN cable.

•    Before you can make an Ethernet connection, you must make the appropriate
   communication settings in Laser Marker NAVI smart. Connect the PC via USB to make
   these settings.

•    Ethernet communication should be performed in a secure network environment.

•    Using a hub or a router, you can connect multiple devices simultaneously to the Ethernet
   interface, such as a PC for configuration, a PLC for command control, and a code reader
   to check the marking results.

                 1.    Connect the PC and the laser marking system with a LAN cable.
                       For LP-RF, LP-RH, LP-RV, and LP-ZV, connect the LAN cable to the interface
                       labeled “LAN” on the rear of the controller. The interfaces of the optional network unit
                       (EtherNet/IP or PROFINET) cannot be used to operate Laser Marker NAVI smart.

                 2.    Start the laser marking system.

                 3.    Start Laser Marker NAVI smart.

                 4.    On the “Startup” screen, select “Online” to open the “Connection” dialog.
                       Any laser marking system that is ready for an online connection is displayed in the list. If
                       the desired laser marking system with an Ethernet connection is not listed, you can find
                       it using any of the following methods:
                       •   To display all available laser marking systems, enable “Including Ethernet
                           connections” and select “Search laser marker”.


ME-NAVIS2-OP-5                                                                                                    43

---

## หน้า 44

4 Online connection between PC and laser marking system


If you want to change the default setting so that the check box is always activated in
this dialog, go to “Startup” > “Preferences” > “General settings”, and select the check
box “Enable "Including Ethernet connections" by default”.

•   To find a laser marking system with specific IP address settings, select “Search by
   IP address”. In the dialog, enter the “IP address” and the “Port number” identical to
   those specified in “System settings” > “Communication” for the “IP address” and “Port
   for PC configuration software”, and select “OK”.

                 5.    Check that an Ethernet connection appears in the list.

                 6.    Select the laser marking system that you want to connect.

                 7.    Select “Connect” to establish the connection.
                       When the online connection is established, the “Marking settings” screen appears.


                  •   Do not turn off the power supply during an online connection with your PC. Otherwise a data loss
                      or system failure may occur.
                  •   Do not disconnect the LAN cable while the laser marking system is online.


Note

•    The online connection between the laser marking system and the PC is disabled when
   the PC goes into sleep mode. When the laser marking system is in remote or RUN mode,
   the operation mode (remote or RUN mode) is maintained, but the online connection is
   disabled. Deactivate the sleep mode setting of the PC to prevent a disconnection.

•    One PC can be connected with multiple laser marking systems. However, you can only
   establish one online connection at a time. The laser marking system which is connected
   is displayed in the “Connection” dialog together with the online mode icon. To configure
   and to control more than one laser marking system, you must switch the connected
   device in the software.
•    If your version of Laser Marker NAVI smart does not support the connected laser marker
   model, some functions and operations cannot be set or executed online.


Related topics

Specify Ethernet communication settings (page 317)

Start Laser Marker NAVI smart (page 27)

Specify “General settings” (page 29)


44                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 45

4.4 Establish a Bluetooth connection between PC and laser marking system


4.4    Establish a Bluetooth connection between PC and laser marking system

The PC and the laser marking system can be connected via USB, Bluetooth, or Ethernet.
You must enable Bluetooth in the communication settings.

•    For Bluetooth connections, place the laser head and the Bluetooth-enabled PC in such a
   way that the connection is not disturbed by interferences.

•    Before you can make a Bluetooth connection, you must make the appropriate
   communication settings in Laser Marker NAVI smart. Connect the PC via USB to make
   these settings.

•    The following models have an integrated Bluetooth antenna and transmitter in the laser
   head LED display:
   LP-GS051, LP-GS051-E, LP-GS051-L, LP-GS051-LE, LP-GS052, LP-GS052-E

                 1.    Start the laser marking system.

                 2.    Start Laser Marker NAVI smart.

                 3.    On the “Startup” screen, select “Online” to open the “Connection” dialog.

                 4.    Check that a Bluetooth connection appears in the list.
                       If a Bluetooth enabled laser marking system is not listed, check the environment for
                       obstacles or verify that the operation range corresponds to the specifications.

                 5.    Select “Connect” to establish the connection.
                       When the online connection is established, the “Marking settings” screen appears.


Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
system failure may occur.


ME-NAVIS2-OP-5                                                                                                         45

---

## หน้า 46

4 Online connection between PC and laser marking system


Note

•   It cannot be guaranteed, that every Bluetooth enabled device can connect with the laser
   marking system.

•   Bluetooth usage may be restricted depending on the ambient situation or environment.
   Check with the building administrator if Bluetooth is allowed.

•   Do not use the Bluetooth function of this product when wireless LAN or any other wireless
   device is used around, in places where there are many obstacles or in an environment
   where radio wave signals are weak. Otherwise, the communication speed may decrease,
   or a communication error or disconnection may occur.

•   Although the maximum operation range is 5m, an obstacle between the devices or the
   ambient environment or the building structure may shorten the operation range.

•   The online connection between the laser marking system and the PC is disabled when
   the PC goes into sleep mode. When the laser marking system is in remote or RUN mode,
   the operation mode (remote or RUN mode) is maintained, but the online connection is
   disabled. Deactivate the sleep mode setting of the PC to prevent a disconnection.

•   One PC can be connected with multiple laser marking systems. However, you can only
   establish one online connection at a time. The laser marking system which is connected
   is displayed in the “Connection” dialog together with the online mode icon. To configure
   and to control more than one laser marking system, you must switch the connected
   device in the software.

•   If your version of Laser Marker NAVI smart does not support the connected laser marker
   model, some functions and operations cannot be set or executed online.


Related topics

Enable Bluetooth (page 319)

Start Laser Marker NAVI smart (page 27)


4.5     Disconnect an online connection

You can disconnect an online connection between the laser marking system and a PC on the
“Startup” screen or alternatively with the “Connection” tool.

Disconnect the laser marking system on the “Startup” screen:

•   Go to the “Startup” screen and select “Online”.

•   In the “Connection” dialog, select “Disconnect”.
   The online connection with the laser marking system is now disconnected.

Disconnect the laser marking system with the “Connection” tool:

•   Select the “Connection” tool in the ribbon.

•   In the “Connection” dialog, select “Disconnect”.
   The online connection with the laser marking system is now disconnected.


46                                                                                          ME-NAVIS2-OP-5

---

## หน้า 47

5.1 Tool overview


5      Operation of the laser marking system


5.1    Tool overview

The ribbon contains tools for operating the connected laser marking system. Tools displayed
in the ribbon vary depending on the screen you selected.

In the “Marking settings” screen (e.g. logged in as administrator and with remote mode set to
off), you will see the following tools:


(1)            (2)      (3)          (4)         (5)

(1)    “Test marking” tool
   Opens the “Test marking/guide laser” dialog.
(2)    “Guide laser” tool
   Opens the “Test marking/guide laser” dialog.
(3)    “Operation” tool
   Use this tool to switch the laser marking system operation to remote or RUN mode.
   The icon of the “Operation” tool indicates the operation mode of the laser marking system.
(4)    “Laser pumping” tool
   Turns laser pumping on or off. The status icon changes when laser pumping is completed.
(5)    “Stop laser” button
   Terminates the laser radiation or disable the laser radiation temporarily, for example when the
   workpiece is burning.


Related topics

Guide laser (page 56)

Perform test marking (page 54)

Switch remote mode on and off by configuration software (page 50)

Perform marking in RUN mode (page 53)

Turn laser pumping on or off (page 47)

Stop laser radiation with the “Stop laser” button (page 49)


5.2    Turn laser pumping on or off

Turn laser pumping on to enable the lasing process.

                 1.     Establish an online connection between your PC and the laser marking system.

                 2.     Go to the “Marking settings” screen.


ME-NAVIS2-OP-5                                                                                                            47

---

## หน้า 48

5 Operation of the laser marking system


                  3.    To open a marking file, select “Open” > “From laser marking system” or “From PC”.

                  4.    You can edit marking objects and specify the marking settings.

                  5.    Select “Save” > “To laser marking system” to save the file to the laser marking system.
                  6.    Select the “Laser pumping” tool.


                        The icon indicates that laser pumping is off.

                  7.    Select “Yes” to start laser pumping.
                        After a few seconds, laser pumping is completed and the status icon of the “Laser
                        pumping” tool changes.


                        This icon indicates that laser pumping is completed.


                        A certain amount of time is required to complete laser pumping for the different laser
                        marking systems:
                        •   LP-GS: approx. 8-15s

                        •   LP-RC: approx. 10s

                        •   LP-RF: approx. 7s

                        •   LP-RH: approx. 5-10s

                        •   LP-RV, LP-ZV: approx. 1s


5.3      Start laser radiation with the “Start marking” button

In RUN mode, you can use the “Start marking” button to trigger the laser radiation.

The “Start marking” button is located on the “Monitor” screen. To prevent accidental
operation, the “Start marking” button is locked. It is shown grayed out.

•    Laser pumping must be completed before you can use the “Start marking” button.

•    If “Continuous trigger” is set for “Trigger mode” in “File settings”, the “Start marking”
   button is not available.

•    The “Start marking” button is not available for on-the-fly marking.

                  1.    To unlock the “Start marking” button, select “Lock”.

                  2.    In the dialog, select the check box and select “OK”.

                  3.    To confirm, select “Yes”.


                        “Start marking” button is enabled


48                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 49

5.4 Stop laser radiation with the “Stop laser” button


                 4.    Select “Start marking” to trigger the laser radiation.

                 5.    After the marking process is finished, lock the “Start marking” button. Select “Lock”.

                 6.    In the dialog, deselect the check box and select “OK”.


                       “Start marking” button is disabled


Related topics

Perform marking in RUN mode (page 53)


5.4    Stop laser radiation with the “Stop laser” button

Use the “Stop laser” button to terminate the laser radiation or disable the laser radiation
temporarily, for example when the workpiece is burning.

The “Stop laser” button is available in all screens except the “Startup” screen.

If you select the “Stop laser” button, the power supply of the oscillator is shut off via software.
To shut off the power supply of the oscillator via hardware, use the INTERLOCK inputs on
the TERMINAL connector of your laser marking system.

Select the “Stop laser” button to stop laser pumping and laser emission.


“Stop laser” button


The dialog for the laser stop alarm appears and the laser marking system executes the
following operations:
 ‒ Laser pumping turns off.

‒ Shutter closes.

‒ Alarm is activated.

Solve the safety problem, then select “Reset” to finish the laser stop status.


ME-NAVIS2-OP-5                                                                                                   49

---

## หน้า 50

5 Operation of the laser marking system


5.5      Remote mode


5.5.1    Switch remote mode on and off by configuration software


Unless you changed the initial setting, the laser marking system can be switched to remote
mode in Laser Marker NAVI smart.

Make sure that “Configuration software” (initial setting) is selected for “Remote mode
switching method” in the “System settings” screen of Laser Marker NAVI smart. If “I/O” is
selected for “Remote mode switching method”, you cannot switch remote mode on and off by
configuration software.

                  1.   Establish an online connection between your PC and the laser marking system.

                  2.   Select the “Operation” tool.


                       “Operation” tool icon

                  3.   In the dialog, select “Remote ON”.
                       Select “Yes” to confirm.
                       When shifting to remote mode while editing in the “Marking settings” screen, a file
                       saving confirmation message appears. After saving the file, the screen shifts to the
                       “Monitor” view.
                       The icon of the “Operation” tool changes to indicate that the laser marking system is in
                       remote mode.


                       Icon indicates that remote mode is on

                  4.   To deactivate remote mode, select the “Operation” tool and “Remote/RUN OFF”.


Related topics

Automatically switch to remote mode at power-on (page 51)

Switch remote mode on and off by external devices (page 52)

Specify remote mode settings (page 304)


50                                                                                            ME-NAVIS2-OP-5

---

## หน้า 51

5.5 Remote mode


5.5.2   Automatically switch to remote mode at power-on


In the “System settings” screen, you can specify that the laser marking system will
automatically start in remote mode when you turn on the key switch.


In case of an emergency stop or an interlock, re-pumping of the laser marking system will
be necessary. For safety reasons, construct a laser re-pumping system which must be
operated by hand.


•    To use this function, you need to make all settings in the configuration software in
   advance.

•    If the laser marking system starts in remote mode, you cannot switch remote mode on
   and off by external devices.

                 1.    Establish an online connection between your PC and the laser marking system.
                 2.    Go to the “System settings” screen and select “Operation/information”.

                 3.    For “Remote mode switching method”, select “Configuration software”.

                 4.    For “Remote mode at power-on”, select “ON”.

                 5.    Select “Apply to laser marking system” in the ribbon.

                 6.    Disconnect the online connection with the laser marking system.

                 7.    Turn off the power of the laser marking system, wait five seconds and then restart the
                       system.


                        Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                        system failure may occur.


                       The laser marking system will automatically start in remote mode.


Related topics

Switch remote mode on and off by configuration software (page 50)

Switch remote mode on and off by external devices (page 52)

Specify remote mode settings (page 304)


ME-NAVIS2-OP-5                                                                                                        51

---

## หน้า 52

5 Operation of the laser marking system


5.5.3    Switch remote mode on and off by external devices


In the “System settings” screen, you can specify that an external device, for instance a PLC,
can switch the laser marking system to remote mode by inputting a signal at the TERMINAL
connector.


In case of an emergency stop or an interlock, re-pumping of the laser marking system will
be necessary. For safety reasons, construct a laser re-pumping system which must be
operated by hand.


•    To use this function, you need to make all settings in the configuration software in
   advance.

•    If “I/O” is selected for “Remote mode switching method”, you cannot switch remote mode
   on and off by configuration software.

                  1.    Establish an online connection between your PC and the laser marking system.

                  2.    Go to the “System settings” screen and select “Operation/information”.

                  3.    For “Remote mode switching method”, select “I/O”.

                  4.    Select “Apply to laser marking system” in the ribbon.

                  5.    Disconnect the online connection with the laser marking system.

                  6.    Turn off the power of the laser marking system, wait five seconds and then restart the
                        system.


                         Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                         system failure may occur.


                        The laser marking system can now be switched to remote mode by turning ON the
                        remote mode input X4 of the TERMINAL connector.


                                        REMOTE IN
                              (1)


                        (1)   PLC output


52                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 53

5.6 Perform marking in RUN mode


Related topics

Switch remote mode on and off by configuration software (page 50)

Automatically switch to remote mode at power-on (page 51)

Specify remote mode settings (page 304)


5.6    Perform marking in RUN mode

In RUN mode, either a signal from Laser Marker NAVI smart or from an external device
starts the laser radiation.

•    The external device can be a switch, or a sensor connected to the I/O terminal. When
   you turn on RUN mode, the laser marking system enters the marking trigger ready status.
   Use this mode for semi-automatic marking processes.

•    You cannot edit the marking data in RUN mode.
•    LP-RC: Laser pumping must be completed before you can turn on RUN mode.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “Marking settings” or “Monitor” screen.

                 3.    This step is only possible in the “Marking settings” screen:
                       a.   To open a marking file, select “Open” > “From laser marking system” or “From PC”.

                       b.   You can edit marking objects and specify the marking settings.

                       c.   Select “Save” > “To laser marking system” to save the file to the laser marking
                            system.

                 4.    Select the “Laser pumping” tool.

                 5.    Select “Yes” to start laser pumping.
                       After a few seconds, laser pumping is completed and the status icon of the “Laser
                       pumping” tool changes.

                 6.    Select the “Operation” tool.


                       “Operation” tool icon

                 7.    In the dialog, select “RUN ON”.
                       Select “Yes” to confirm.
                       When shifting to RUN mode while editing in the “Marking settings” screen, a file saving
                       confirmation message appears. After saving the file, the screen shifts to the “Monitor”
                       view.
                       The icon of the “Operation” tool changes to indicate that the laser marking system is in
                       RUN mode.


ME-NAVIS2-OP-5                                                                                                53

---

## หน้า 54

5 Operation of the laser marking system


Icon indicates that RUN mode is on

The laser marking system changes to the marking trigger ready status.

                  8.    Input the marking trigger signal.
                        The signal input TRIGGER IN of the TERMINAL connector and the “Start marking”
                        button of Laser Marker NAVI smart can both be used to input the marking trigger signal.


                        Controlling the laser marking system using a switch


Related topics

Turn laser pumping on or off (page 47)

Start laser radiation with the “Start marking” button (page 48)


5.7      Perform test marking

In test marking mode, start the marking by manually triggering the laser radiation in Laser
Marker NAVI smart. Perform the test marking process to test the marking settings during
installation or when you want to radiate the laser during maintenance work.

•    The counter value is not updated during test marking.

•    If “Trigger mode” is set to “Continuous trigger”, the setting value of “Minimum number of
   scans” is used for the test marking.

                  1.      Establish an online connection between your PC and the laser marking system.

                  2.      Go to the “Marking settings” screen.

                  3.      To open a marking file, select “Open” > “From laser marking system” or “From PC”.

                  4.      You can edit marking objects and specify the marking settings.
                          In the “Laser settings” tab, specify settings such as “Laser power” and “Scan speed
                          [mm/s]”.

                  5.      Select “Save” > “To laser marking system” to save the file to the laser marking system.

                  6.      Select the “Laser pumping” tool.


54                                                                                              ME-NAVIS2-OP-5

---

## หน้า 55

5.7 Perform test marking


                 7.    Select “Yes” to start laser pumping.
                       After a few seconds, laser pumping is completed and the status icon of the “Laser
                       pumping” tool changes.

                 8.    Select “Test marking” to open the “Test marking/guide laser” dialog.


                       “Test marking” tool

                 9.    In the dialog, specify new values for the laser settings.
                       You can change the laser power, scan speed, pulse cycle (LP-RF, LP-RV, LP-ZV) or
                       pulse duration (LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P). The changes will be
                       transferred to the parameters in the “Laser settings” tab.


                          Take appropriate protective measures during laser radiation such as wearing laser
                          protective goggles or using a protective enclosure.

                 10.   LP-ZV: If you set “File settings” > “Autofocus” > “ON”, you can measure the
                       displacement of the workpiece. Select “Measure” to measure the workpiece
                       displacement. The result value is used for test marking.

                 11.   Select “Start marking” to trigger the laser radiation.
                       A confirmation dialog appears.

                 12.   Select “Yes” to start laser radiation. The shutter opens automatically and marking
                       starts.
                       During a marking process, you can select “Stop marking” to terminate the test
                       marking.
                       LP-RC: Warning E640 may occur if laser pumping was off for several days. In this
                       case, repeat the test marking process.
                       LP-ZV: If you activate the camera and use the autofocus function, the camera lighting
                       turns briefly off before laser radiation starts.

                 13.   The “Test marking result” dialog appears as soon as test marking is completed.
                       LP-RH: “Marking time” is displayed.
                       LP-ZV: The following parameters are displayed: “Marking time”, “Marking energy”,
                       “Workpiece displacement” (if autofocus function is used)
                       “Marking energy” is available for LP-ZV500P, LP-ZV505P and LP-ZV506P.

                       To hide this dialog from the next marking on, select “Do not display this dialog again.”.
                       To show the dialog again, go to “Startup” > “Preferences” > “General settings”, and
                       select “Display results after test marking.”.


ME-NAVIS2-OP-5                                                                                                55

---

## หน้า 56

5 Operation of the laser marking system


Related topics

Work with files (page 63)

Turn laser pumping on or off (page 47)

Set laser parameters (page 273)

Configure trigger parameters (page 265)

Specify “General settings” (page 29)

Check the workpiece displacement (page 61)


5.8      Guide laser

The guide laser is used to check the marking position. The available guide laser functions
depend on the model of your laser marking system.

•   If the LASER STOP IN or INTERLOCK inputs on the TERMINAL connector are open,
   guide laser radiation is still possible by configuration software.

•   If you want to use the guide laser in remote mode (controlled by an external device),
   but cannot start the guide laser because the INTERLOCK alarm is output (for example
   because a maintenance door was opened), you can deactivate this alarm as long as the
   shutter is closed. Set “Deactivate while shutter closed” in “System settings” > “Operation/
   information” > “INTERLOCK alarm detection”.

•   LP-ZV: During guide laser radiation, the camera function cannot be used. The built-in
   camera turns off automatically when you start radiating the guide laser.


The guide laser function is used for reference only. To obtain the most appropriate marking quality,
fine adjust the work distance and the position of the workpiece after performing a test marking.


Guide laser function (LP-GS052)

For LP-GS052, only the pointer is available as a guide laser function.

To turn on the pointer, select the “Guide laser” tool in the “Marking settings” screen. In the
“Test marking/guide laser” dialog, select “Guide laser ON”.


“Guide laser” tool

The pointer is a red laser beam emitted diagonally from the pointer emission port. The
pointer must be turned on in the software. At the base position of the laser head, the pointer
indicates the center of the marking field. The pointer radiates for 30min or until you select the
“Guide laser OFF” button.


56                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 57

5.8 Guide laser


Remarks

•   Pointer radiation stops when remote mode or RUN mode is turned on.

•   If the test marking starts while the pointer is radiating, the pointer turns off temporarily.
   The pointer turns on automatically after the test marking has stopped.


Guide laser function (LP-GS051, LP-GS051-L, LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)

For LP-GS051, LP-GS051-L, LP-RC, LP-RF, LP-RH, LP-RV, and LP-ZV, you can use the
guide laser to display the marking field, marking image, masked objects, or work distance.

The guide laser is a red laser beam to simulate the marking process or to indicate the
marking field and work distance. The guide laser radiates for 1min or until you select the
“Guide laser OFF” button.

In the “Marking settings” screen, select the “Guide laser” tool to open the “Test marking/guide
laser” dialog.


“Guide laser” tool

Specify any of the following parameters:

•   For “Guide laser display”, select a display mode:
   ‒ “Work distance”: Select this mode to adjust the work distance. The guide laser
   displays the dot of the pointer and the crosshairs. Adjust the distance so that the dot
   of the pointer overlaps with the center of the crosshairs.

‒ “Marking image”: The guide laser displays the marking data in the file. Objects are
  not displayed if they are set to “OFF” under “Marking ON/OFF”.
   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: If on-the-fly marking is set, the guide laser of
   the marking image and the masked objects operate on-the-fly.

‒ “Marking field”: The guide laser displays the marking field frame and center lines.

‒ “Masked objects”: The guide laser displays marking objects with the following
  settings:
   “OFF” is set for “Marking ON/OFF”.
   “Guide laser display” is selected. The “Guide laser display” check box appears
   after setting “Marking ON/OFF” to “OFF”.

•   “Guide laser scan speed [mm/s]”: Enter a value to change the scan speed of the guide
   laser. This setting is independent from the scan speed under “Laser settings”.
   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: If on-the-fly marking is set, this setting is not
   applied to the guide laser of the marking image and the masked objects. To them, the on-
   the-fly speed is applied.
   The setting applies to all files in the laser marking system.

•   “Guide laser Z-movement [mm]” (LP-ZV, LP-GS051 models except LP-GS051-L): This
   parameter is enabled if “Guide laser display” is set to “Marking field” or “Work distance”.
   Specify a value if the laser head is not installed at base position to specify the work
   distance.


ME-NAVIS2-OP-5                                                                                                       57

---

## หน้า 58

5 Operation of the laser marking system


If “Work distance” is set for “Guide laser display”, adjust the distance so that the dot of the
pointer overlaps with the center of the crosshairs.
The setting applies to all files in the laser marking system.


Related topics

Check the work distance (page 58)

Check the marking position using the guide laser (page 59)

Indicate the marking field center using the pointer (LP-GS052) (page 60)

Specify remote mode settings (page 304)


5.9      Check the work distance

When installing the laser head, check the work distance using the guide laser function.

•    To obtain the most appropriate marking quality, fine adjust the work distance and the
   position of the workpiece after performing a test marking.

•    LP-GS051 (except LP-GS051-L), LP-ZV:
   ‒ The point of intersection of the pointer and the guide laser varies depending on the
   value set for “Guide laser Z-movement [mm]”.

‒ The center of the crosshairs only indicates the center of the marking field if the laser
  head is installed at base position and if the value for “Guide laser Z-movement [mm]”
  is set to 0mm. Otherwise the center of the crosshairs is shifted from the center of the
  marking field.

•    This function is not available for LP-GS052.

                  1.    Establish an online connection between your PC and the laser marking system.
                  2.    Go to the “Marking settings” screen and select “Guide laser”.

                  3.    In the “Test marking/guide laser” dialog, select “Work distance” for “Guide laser display”.

                  4.    Select “Guide laser ON” to start radiating the guide laser.

                  5.    The scan speed of the guide laser can be changed by entering a value for “Guide laser
                        scan speed [mm/s]”.

                  6.    Adjust the work distance so that the dot overlaps with the center of the crosshairs.


58                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 59

5.10 Check the marking position using the guide laser


                 7.   Select “Guide laser OFF” to stop the radiation of the guide laser.
                      The guide laser display stops automatically after about one minute.


Related topics

Guide laser (page 56)


5.10   Check the marking position using the guide laser

The marking position can be checked visually by using the guide laser function.

To obtain the most appropriate marking quality, fine adjust the work distance and the position
of the workpiece after performing a test marking.

LP-GS051 (except LP-GS051-L), LP-ZV: The marking position varies depending on the
value set for “Guide laser Z-movement [mm]”.

This function is not available for LP-GS052.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Marking settings” screen and select “Guide laser”.

                 3.   In the “Test marking/guide laser” dialog, select a display mode for “Guide laser display”.

                 4.   Select “Guide laser ON” to start radiating the guide laser.


                      The guide laser indicates the marking image, the marking field, or masked objects, depending on
                      your selection for “Guide laser display”.

                 5.   The scan speed of the guide laser can be changed by entering a value for “Guide laser
                      scan speed [mm/s]”.

                 6.   Select “Guide laser OFF” to stop the radiation of the guide laser.
                      The guide laser display stops automatically after about one minute.


Related topics

Guide laser (page 56)


ME-NAVIS2-OP-5                                                                                                     59

---

## หน้า 60

5 Operation of the laser marking system


5.11     Indicate the marking field center using the pointer (LP-GS052)

When the laser head is installed at the specified base position, the pointer can be used to
indicate the center of the marking field.

For LP-GS052, only the pointer is available as a guide laser function. This function is not
available for LP-GS051, LP-GS051-L, LP-RC, LP-RF, LP-RH, LP-RV, and LP-ZV.

•    Pointer radiation stops when remote mode or RUN mode is turned on.

•    If the test marking starts while the pointer is radiating, the pointer turns off temporarily.
   The pointer turns on automatically after the test marking has stopped.

                  1.    Establish an online connection between your PC and the laser marking system.

                  2.    Go to the “Marking settings” screen and select “Guide laser”.

                  3.    In the “Test marking/guide laser” dialog, select “Guide laser ON”.
                        The pointer radiates for 30min or until you select the “Guide laser OFF” button.


                        The pointer indicates the center of the marking field.


Related topics

Guide laser (page 56)


5.12     Perform marking time measurement

This function simulates the marking process with the specified marking settings and displays
the calculated marking time. The measurement is executed without laser emission.

•    If a functional character such as counter is used, the marking time is measured with the
   current value.

•    If the actual marking time is shorter than the time set for “One-shot pulse duration [ms]”,
   the result of the marking time measurement is the same as the time set for “One-shot
   pulse duration [ms]”.

•    If the marking time is too long to execute on-the-fly marking at regular intervals, an error
   message with the measurement result appears.


60                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 61

5.13 Check the workpiece displacement


•    For on-the-fly marking, the following time periods add up to the marking time
   measurement result:
   ‒ Time between the input of the marking start signal (trigger) and the arrival of the
   workpiece at the preset marking position
   ‒ Laser radiation time

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “Marking settings” screen.

                 3.    To open a marking file, select “Open” > “From laser marking system” or “From PC”.

                 4.    You can edit marking objects and specify the marking settings.

                 5.    Select “Test marking” or “Guide laser” to open the “Test marking/guide laser” dialog.

                 6.    Select “Marking time” to perform the measurement.
                       The marking time is displayed in the dialog.
                       During a measurement operation, you can select “Cancel” to terminate the
                       measurement.
                 7.    To exit the dialog, select “OK”.


Related topics

Specify input and output settings (page 316)


5.13   Check the workpiece displacement

To check the workpiece displacement in advance, you can measure it in the “Test marking/
guide laser” dialog on the “Marking settings” screen. This setting is available for the LP-ZV
series.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “Marking settings” screen and select “File settings”.

                 3.    For “Autofocus”, select “ON”.
                       “ON” is available if the expansion board is installed in the controller.

                 4.    Select “Test marking” or “Guide laser” to open the “Test marking/guide laser” dialog.

                 5.    Select the “Measure” button. The value measured by the external sensor is displayed for
                       “Workpiece displacement”.
                       An error occurs if you select “Measure” when no external sensor is connected.
                       •   To apply a workpiece displacement to test marking, measure the value before you
                           start test marking. Without measuring the workpiece displacement, test marking is
                           performed with a workpiece displacement value of 0mm.

                       •   The workpiece displacement value is automatically reset after test marking.

                       •   To apply a workpiece displacement to the guide laser, measure the value before you
                           start using the guide laser function. The workpiece displacement is applied if “Guide
                           laser display” is set to “Marking image” or “Masked objects”.


ME-NAVIS2-OP-5                                                                                                   61

---

## หน้า 62

5 Operation of the laser marking system


•   Autofocus:
   The “Measure workpiece displacement when marking starts” check box in the
   “Test marking/guide laser” dialog is selected, and the workpiece displacement is
   automatically measured and applied when you start test marking. If you deselect the
   check box, the workpiece displacement value measured in advance by selecting the
   “Measure” button is used for test marking.

•   If “Autofocus” is set to “OFF”, “Workpiece displacement” is not displayed in the “Test
   marking/guide laser” dialog.

                  6.   To reset the workpiece displacement value, select “Reset”.
                       After resetting, “--” is displayed for “Workpiece displacement”.


Related topics

Use the autofocus function (page 271)

Perform test marking (page 54)

Guide laser (page 56)


62                                                                                              ME-NAVIS2-OP-5

---

## หน้า 63

6.1 About marking files


6      Work with files


6.1    About marking files

The marking data is saved in the .lzs or .lms file format. Marking files are created and edited
using the PC configuration software Laser Marker NAVI smart.

•   A connection between your PC and the laser marking system is not necessary to create
   or edit a marking file. You can later transfer a marking file to the laser marking system, if
   you want to mark it on a workpiece.

•   A marking file is composed of one or more marking objects. All the data in one file can be
   marked with one single trigger.

•   Up to 2000 marking objects can be stored in one marking file. The following marking
   objects can be used in a marking file: character object, TrueType object, graphic object,
   shape object, bar code object, 2D code object and point radiation object.

•   A marking file can contain up to 2000 object groups. You can use object groups to
   manage the marking objects in your marking file. Object group settings apply to all
   marking objects in the group.

•   Every marking file in the laser marking system is listed under “Data management” >
   “Marking files” and has a dedicated file number.

•   Up to 10000 marking files can be stored in one laser marking system.

•   When saved on a local or network drive, marking files have the file extension .lzs or
   .lms. These files contain the graphic files used in the marking image, including TrueType
   objects (.ttd).

•   The marking file format (.lzs or .lms) depends on your version of Laser Marker NAVI
   smart. If you edit or create a marking file with Laser Marker NAVI smart version 3.0.0 or
   higher, the marking data is saved in the .lzs file format. If you use version 2.x.x or lower,
   the marking data is saved in the .lms file format.

•   With Laser Marker NAVI smart version 3.0.0 or higher, you can open .lzs and .lms
   marking files. If you use Laser Marker NAVI smart version 2.x.x or lower, you can only
   open .lms marking files.


Related topics

Work with marking files in offline mode (page 64)

Work with marking files in online mode (page 66)

Transfer a marking file from your PC to the laser marking system (page 69)

Manage files in the laser marking system (page 74)

Online and offline mode (page 41)


ME-NAVIS2-OP-5                                                                                                   63

---

## หน้า 64

6 Work with files


6.2      Work with marking files in offline mode

In offline mode, there is no connection between your PC and the laser marking system. You
can use the PC configuration software Laser Marker NAVI smart to create, edit and save a
marking file.

The marking file is saved on your PC. You can later transfer a marking file to the laser
marking system, if you want to mark it on a workpiece.

In offline mode, you can do the following:

•    Create and save a marking file to your PC (offline mode) (page 64)

•    Open and save an existing marking file to your PC (offline mode) (page 65)


6.2.1    Create and save a marking file to your PC (offline mode)


You can create a new marking file, add marking data and save it to your PC or a network
drive.

                    1.    Open the “Startup” screen by starting Laser Marker NAVI smart.

                    2.    Select “Offline”.

                    3.    Select “New...” > “Marking file (.lzs)” or “Marking file (.lms)” and select the model of your
                          laser marking system.
                          The “Marking settings” screen opens with an empty marking image editor.

                    4.    Create marking objects and specify the desired marking settings.

                    5.    If you edit a marking file in offline mode, you must save it to your PC before you can
                          transfer it to the laser marking system.
                          •   Select “Save” > “Save” or “Save as” to save the marking file on a local or network
                              drive.

                          •   After saving the file, you can select “Save as” to create a copy of the existing file
                              under a new name.

                          The file is saved in the marking file format .lzs or .lms to your local or network drive.

                    6.    You can later transfer a marking file to the laser marking system, if you want to mark it
                          on a workpiece.
                          Establish an online connection and add the marking file to the list in “Data
                          management” > “Marking files”.


64                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 65

6.2 Work with marking files in offline mode


Related topics

About marking files (page 63)

Edit marking data (page 90)

Open and save an existing marking file to your PC (offline mode) (page 65)

Transfer a marking file from your PC to the laser marking system (page 69)

Manage fonts that can be used in offline mode (page 31)


6.2.2   Open and save an existing marking file to your PC (offline mode)


You can open an existing marking file from your PC, make changes and save your changed
file to your PC or a network drive.

                 1.   Open the “Startup” screen by starting Laser Marker NAVI smart.

                 2.   You have two options to open a marking file.
                      •   You can open a marking file from the “Recent files” list.
                          Select a file from the list and select “Open”.

                      •   If the file is not shown in the “Recent files” list, select “Offline” > “Open...” > “Marking
                          file (.lzs/.lms)”.
                          Choose a marking file (.lzs/.lms) from your local or network drive and select “Open”.
                          The selected file is opened in the “Marking settings” screen.

                 3.   You can edit marking objects and specify the marking settings.

                 4.   If you edit a marking file in offline mode, you must save it to your PC before you can
                      transfer it to the laser marking system.
                      •   Select “Save” > “Save” or “Save as” to save the marking file on a local or network
                          drive.

                      •   After saving the file, you can select “Save as” to create a copy of the existing file
                          under a new name.

                      The file is saved in the marking file format .lzs or .lms to your local or network drive.
                 5.   You can later transfer a marking file to the laser marking system, if you want to mark it
                      on a workpiece.
                      Establish an online connection and add the marking file to the list in “Data
                      management” > “Marking files”.


ME-NAVIS2-OP-5                                                                                                      65

---

## หน้า 66

6 Work with files


Related topics

About marking files (page 63)

Edit marking data (page 90)

Create and save a marking file to your PC (offline mode) (page 64)

Transfer a marking file from your PC to the laser marking system (page 69)

Manage fonts that can be used in offline mode (page 31)


6.3      Work with marking files in online mode

To work in online mode, establish an online connection between your PC and the laser
marking system. You can use the PC configuration software Laser Marker NAVI smart to
create, edit and save a marking file.

Save the marking files to the connected laser marking system, if you want to mark it on a
workpiece.

In online mode, you can do the following:

•    Create and save a marking file to the laser marking system (page 66)

•    Open an existing marking file from the laser marking system (page 67)

•    Open an existing marking file from your PC (page 68)

•    Save a marking file to the laser marking system (page 69)


6.3.1    Create and save a marking file to the laser marking system


You can create a new marking file, add marking data and save it to your laser marking
system.

                    1.    Establish an online connection between your PC and the laser marking system.

                    2.    Go to the “Marking settings” screen and select “Open” > “From laser marking system”.
                          A dialog opens and shows a list of all marking files saved on the laser marking system.
                          This dialog also appears automatically right after the online connection is established.

                    3.    To create a new marking file, select an empty table row. This is necessary to assign a
                          number to the new marking file.

                    4.    Select “OK”.
                          The file opens in the marking image editor.

                    5.    To save your marking file on the laser marking system, select “Save” > “To laser marking
                          system”.


66                                                                                               ME-NAVIS2-OP-5

---

## หน้า 67

6.3 Work with marking files in online mode


                 6.   In the dialog, select “OK”.
                      The marking file is saved under the name “No Name”. To edit the name of the marking
                      file, select the icon in the tab on top of the marking image editor.


                      Pen icon
                      Alternatively, you can change the name of the marking file on the “Data management”
                      screen.


Related topics

About marking files (page 63)

Online connection between PC and laser marking system (page 41)

Edit marking data (page 90)

Manage files in the laser marking system (page 74)

Rename a marking file (page 75)


6.3.2   Open an existing marking file from the laser marking system


You can open an existing marking file from the laser marking system, make changes and
save your changed file.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Marking settings” screen and select “Open” > “From laser marking system”.
                      A dialog opens and shows a list of all marking files saved on the laser marking system.
                      This dialog also appears automatically right after the online connection is established.

                 3.   Select a marking file from the list.

                 4.   Select “OK”.
                      The file opens in the marking image editor.
                      If the laser marking system is in remote mode, the marking file selected in the laser
                      marking system opens in the “Monitor” screen.

                 5.   You can edit marking objects and specify the marking settings.

                 6.   When you finish the editing process, save the changed marking file on the laser marking
                      system.


ME-NAVIS2-OP-5                                                                                                67

---

## หน้า 68

6 Work with files


Related topics

About marking files (page 63)

Online connection between PC and laser marking system (page 41)

Edit marking data (page 90)

Save a marking file to the laser marking system (page 69)

Manage files in the laser marking system (page 74)


6.3.3    Open an existing marking file from your PC


You can open an existing marking file from your PC, make changes and save your changed
file on the laser marking system.

                    1.   Establish an online connection between your PC and the laser marking system.

                    2.   Go to the “Marking settings” screen and select “Open” > “From PC”.

                    3.   Choose a marking file (.lzs or .lms) from your local or network drive and select “Open”.
                         A dialog opens and shows a list of all marking files saved on the laser marking system.

                    4.   Select an empty table row to assign the marking file to a number on the laser marking
                         system.
                         It is possible to overwrite an existing marking file with a new file. To do this, select the
                         marking file in the list that you want to overwrite.

                    5.   Select “OK”.
                         The file opens in the marking image editor.

                    6.   You can edit marking objects and specify the marking settings.

                    7.   When you finish the editing process, save the changed marking file.


Related topics

About marking files (page 63)

Online connection between PC and laser marking system (page 41)

Edit marking data (page 90)

Save a marking file to the laser marking system (page 69)

Manage files in the laser marking system (page 74)


68                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 69

6.4 Transfer a marking file from your PC to the laser marking system


6.3.4   Save a marking file to the laser marking system


You must save a marking file to the laser marking system before you can perform the
marking process.

Up to 10000 marking files can be stored in one laser marking system.

If you edit your marking data in online mode, the corresponding marking file is already
present on the connected laser marking system and is listed in “Data management” >
“Marking files”.

A restricted user can perform this operation, if the option “Save to laser marking system” is
enabled in “System settings” > “Access permissions”.

                 1.    In the “Marking settings” screen, select “Save” > “To laser marking system” to update
                       (overwrite) the current file on the laser marking system.
                       If you configured a counter, you can choose between updating or not updating the
                       current counter value in the laser marking system.

                 2.    In the dialog, check if the file is assigned to the correct number.

                 3.    Select “OK”.
                       The marking file is now saved on the laser marking system.


Related topics

About marking files (page 63)

Open an existing marking file from the laser marking system (page 67)

Open an existing marking file from your PC (page 68)


6.4     Transfer a marking file from your PC to the laser marking system

To transfer a marking file from your PC to the laser marking system, establish an online
connection and add the file to the list in “Data management” > “Marking files”.

You must save the marking file to the laser marking system before you can perform the
marking process. Up to 10000 marking files can be stored in one laser marking system.

If you add a marking file that contains graphic files (VEC, DXF, BMP, JPEG, HPGL, or TTD
files), they are automatically added to the list in “Data management” > “Graphic files”.

There are two different ways to save a marking file on the laser marking system. Use the
“Data management” screen to save the marking file. Alternatively, open the marking file on
the “Marking settings” screen and save it to the laser marking system.

For details, refer to the following topics:

•    Save a marking file on the “Data management” screen (page 70)

•    Save a marking file on the “Marking settings” screen (page 70)


ME-NAVIS2-OP-5                                                                                                   69

---

## หน้า 70

6 Work with files


6.4.1    Save a marking file on the “Data management” screen


To save a marking file on the laser marking system, add the file to the list in “Data
management” > “Marking files”.

                    1.   Establish an online connection between your PC and the laser marking system.

                    2.   Go to the “Data management” screen and select “Marking files”.
                    3.   Select an empty table row to assign the marking file to a number on the laser marking
                         system.
                         It is possible to overwrite an existing marking file with a new file. To do this, select the
                         marking file in the list that you want to overwrite.

                    4.   Select “Add” in the ribbon.

                    5.   Confirm the message dialog with “OK”. This step is only required if you selected to
                         overwrite an existing marking file.

                    6.   Choose a marking file (.lzs or .lms) from your local or network drive and select “Open”.
                         The marking file is now saved on the laser marking system.


Related topics

About marking files (page 63)

Save data to your PC or another external memory (page 76)

Online and offline mode (page 41)


6.4.2    Save a marking file on the “Marking settings” screen


In the “Marking settings” screen, open a marking file that is saved on your PC and save the
file on the laser marking system.

                    1.   Establish an online connection between your PC and the laser marking system.

                    2.   Go to the “Marking settings” screen.
                    3.   Select “Open” > “From PC”.

                    4.   Choose a marking file (.lzs or .lms) from your local or network drive and select “Open”.
                         A dialog opens and shows a list of all marking files saved on the laser marking system.

                    5.   Select an empty table row to assign the marking file to a number on the laser marking
                         system.
                         It is possible to overwrite an existing marking file with a new file. To do this, select the
                         marking file in the list that you want to overwrite.

                    6.   Select “OK” to save the marking file on the laser marking system.

                    7.   Confirm the message dialog with “OK”. This step is only required if you selected to
                         overwrite an existing marking file.


70                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 71

6.5 Work with font files


The marking file is opened in the “Marking settings” screen.


Related topics

About marking files (page 63)

Save data to your PC or another external memory (page 76)

Online and offline mode (page 41)


6.5     Work with font files


6.5.1   About font files


At the factory, all included font files are already installed in the laser marking system. These
font files are saved to your PC when you install Laser Marker NAVI smart.

If you add a font, you created or edited using the Font Maker software, you must assign the
font to a suitable font number in the table. For example, do not assign a Simplified Chinese
font to the font numbers 01 to 50. Otherwise, some characters cannot be imported properly.

The fonts that are installed in the laser marking system are assigned to the following font
numbers:

J1

JIS level 1 font: Hiragana, Katakana and Kanji characters for Japanese, special characters
for Greek and Cyrillic.
Initial font file: JIS1.fon


J2

JIS level 2 font: Kanji characters for Japanese
Initial font file: JIS2.fon


GB1

Simplified Chinese font: GB 2312 level 1 characters
Initial font file: GB2312-1.fon


GB2

Simplified Chinese font: GB 2312 level 2 characters
Initial font file: GB2312-2.fon


US

User-defined font
Initial font file: USER1.fon


ME-NAVIS2-OP-5                                                                                                  71

---

## หน้า 72

6 Work with files


At the factory, two characters are preassigned to character codes 8121h and 8122h for U1
and U2.


2D

2D code pattern font
A total of 60 characters can be assigned to any character code from 2230h to 2239h or
from 8121h to 8152h. When you create a new character, overwrite an existing character
code from 2230h to 2239h or from 8121h to 814Ch, or add a new character in the range
from 814Dh to 8152h. Do not use any other character codes.
Initial font file: 2DCODE.fon


01–50

Fonts for alphanumeric characters and symbols
Initial font files:
01–05: ORG1.fon to ORG5.fon
06: OCR1.fon
07–09: ORG1S.fon to ORG3S.fon
10: ORG3-L1.fon
11: DINLIKE1-L1.fon
Font features:
ORG1, ORG3: For multipurpose letter marking
ORG2, ORG5: For marking small-sized characters
ORG4: For high-speed marking (not suitable for bold characters)
OCR1: Alphanumeric font suitable for image recognition
ORG1S to ORG3S: Same as ORG1 to ORG3 but reduced by 80%. Can be used when
alphanumeric characters and Japanese characters are used in the same character line.
ORG3-L1: Alphanumeric font including Latin-1 (ISO/IEC 8859-1) characters based on
ORG3 font style. If you use European special characters such as À or Ä, select this font.
DINLIKE1-L1: Alphanumeric font including Latin-1 (ISO/IEC 8859-1) characters
resembling the DIN 1451 font style. If you use European special characters such as À or
Ä, select this font.


Remarks

•    Use only font files in the .fon format. Windows TrueType fonts cannot be saved as font
   files in the laser marking system.

•    Japanese and Simplified Chinese characters cannot be used together in one file. Select
   the East Asian character set under “Marking settings” > “File settings” > “East Asian
   characters”.

•    To view the differences between the fonts, use the “Preview” in “Data management” >
   “Font files” or in “Startup” > “Preferences” > “Fonts for offline editing”.
   ‒ Alphanumeric characters: Numbers, A to Z, and a to z are displayed.


72                                                                                               ME-NAVIS2-OP-5

---

## หน้า 73

6.5 Work with font files


‒ Japanese and Simplified Chinese: The first 100 characters of the font are displayed
  in the preview.

•    Refer to “Font Maker Operation Manual” for details about creating and editing font files
   using the Font Maker software. You cannot create or modify Simplified Chinese fonts with
   the Font Maker software.

•    For details about the applicable characters, refer to “Character code table” in the “Serial
   Communication Command Guide”.


Related topics

2D code pattern font (page 189)

Add font files (page 73)

Specify the East Asian character set (page 265)


6.5.2   Add font files


You can add font files (.fon format) other than the preinstalled fonts to use them in your
marking images. An online connection between your PC and the laser marking system is
required.

To add a font file to a backup file, no online connection is required. Open the backup file and
add the font file in the “Data management” screen.

If you add a font, you created or edited using the Font Maker software, you must assign the
font to a suitable font number in the table. For example, do not assign a Simplified Chinese
font to the font numbers 01 to 50. Otherwise, some characters cannot be imported properly.

                 1.    Establish an online connection between your PC and the laser marking system.
                 2.    Go to the “Data management” screen and select “Font files”.

                 3.    Select an empty table row to add a font file.
                       A font must be assigned to a suitable font number in the table (J1, J2, GB1, GB2, etc.).
                       If necessary, you can also overwrite an existing font file.
                       Use only font files in the .fon format. Windows TrueType fonts cannot be saved as font
                       files in the laser marking system.

                 4.    Select “Add” in the ribbon.

                 5.    Select a font file from your local or network drive.
                       The font is added to the list. It is saved on the laser marking system.


Related topics

About font files (page 71)

About backup files (page 77)

Manage files in the laser marking system (page 74)


ME-NAVIS2-OP-5                                                                                                  73

---

## หน้า 74

6 Work with files


6.6      Manage files in the laser marking system


6.6.1    Search for files


You can search for marking files, font files, or graphic files by entering a character string
in the search box. For marking files, it is possible to search for file names or a marking file
number.

To search for files in the laser marking system, you must establish an online connection. In
offline mode, you can only perform searches in backup files.

The search function supports single-byte and double-byte characters. The use of AND, OR,
or NOT as search operators is not supported.

•   Establish an online connection between your PC and the laser marking system.
   To search in a backup file, open the file from the “Startup” screen of Laser Marker NAVI
   smart.

•   Go to the “Data management” screen.

•   Select the “Marking files”, “Graphic files” or “Font files” tab, depending on the file type you
   want to search.

Search for a file name:

•   To search for a character string, enter text in the search box labeled “File name”.
   Press <Enter> or select the magnifying glass symbol to start the search.

All files matching the search criteria are displayed in the list.

•   To reset the search results and display all files, select “Clear search”.

Search for a marking file number in the “Marking files” tab:

•   To search for a marking file number, enter a file number in the search box labeled
   “Number”.
   Press <Enter> or select the arrow symbol to start the search for the file with this number.

The marking file is highlighted in the list.


Related topics

Copy, paste and delete files (page 75)


74                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 75

6.6 Manage files in the laser marking system


6.6.2   Copy, paste and delete files


To manage files in the laser marking system, use the copy, paste, and delete functions
available in the “Data management” screen. You can organize marking files, graphic files and
font files.

The copy and paste operation is not available for the graphic file in TTD format (TrueType
object).

When the marking file is deleted, the graphic files (VEC, DXF, BMP, JPEG, HPGL, TTD)
used in the file, remain in the laser marking system or the backup file. Delete the graphic files
separately.

•   Establish an online connection between your PC and the laser marking system.

•   Go to the “Data management” screen.

•   Depending on the file type, select a tab: “Marking files”, “Graphic files” or “Font files”.

Copy and paste files:

•   Select the files to copy.
   Marking files: To select two or more individual files, press <Ctrl> and select the files. To
   select a group of contiguous files, press <Shift> and select the first and last file.

•   Select “Copy” in the ribbon.

•   For marking files and font files, select the destination file number to paste the files.

•   Select “Paste”.
   Marking files: If you copied several files, the files are inserted from the destination
   number.

•   For graphic files and font files, enter the file name.
   Input a file name with max. 123 characters. The control characters cannot be used in the
   file name.

•   Select “OK”.

Delete files:

•   Select the file that you want to delete.
   To select two or more individual files, press <Ctrl> and select the files. To select a group
   of contiguous files, press <Shift> and select the first and last file.

•   Select “Delete” in the ribbon.

•   In the dialog, select “OK”.


6.6.3   Rename a marking file


You can rename marking files saved on the connected laser marking system.

You can also change the name of marking files saved in a backup file.


ME-NAVIS2-OP-5                                                                                                      75

---

## หน้า 76

6 Work with files


Rename a marking file that is opened on the “Marking settings” screen:

•   Select the icon in the tab on top of the marking image editor.


Pen icon

•   In the dialog, enter a dedicated file name.

•   Select “OK”.

•   Select “Save” > “To laser marking system”.

Rename a marking file on the “Data management” screen:

•   Go to the “Data management” screen and select “Marking files”.

•   Select a marking file from the list and select “Rename”.


“Rename” icon


Alternatively, double-click on the “File name” cell.

•   In the dialog, enter a dedicated file name (max. 127 characters).

•   Select “OK”.


6.6.4    Save data to your PC or another external memory


You can save a marking file, a graphic file or a font file to your PC or an external memory.

Graphic files in TTD format (TrueType object data) cannot be saved as individual files.

When saved on a local or network drive, marking files have the file extension .lzs or
.lms. The graphic files (VEC, DXF, BMP, JPEG, HPGL, TTD) used in the marking file are
contained in the marking file (.lzs or .lms).

Save a marking file on the “Marking settings” screen:

•   To save the file that is opened in the “Marking settings” screen, select “Save” > “To PC”.

Save a marking file on the “Data management” screen:

•   Go to “Data management” > “Marking files”.
   The “Data management” screen is not available when you edit a marking file in offline
   mode.

•   Select the marking file that you want to save from the list.

•   Select “Save to PC” to save the file on a local drive, a network drive or an external
   memory.

Save a font file or graphic file (online mode or backup editing):


76                                                                                                ME-NAVIS2-OP-5

---

## หน้า 77

6.7 Backup files


•   Go to the “Data management” screen.
   The “Data management” screen is not available when you edit a marking file in offline
   mode.

•   Select “Graphic files” or “Font files”.
•   Select the file that you want to save from the list.

•   Select “Save to PC” to save the file on a local drive, a network drive or an external
   memory.


Related topics

About marking files (page 63)

Transfer a marking file from your PC to the laser marking system (page 69)

Save a marking file to the laser marking system (page 69)


6.7     Backup files


6.7.1   About backup files


A backup file contains the data from the laser marking system. Backup files have the file
extension .lzb or .lmb.

To create or restore a backup file, an online connection between Laser Marker NAVI smart
on your PC and the laser marking system is required. To edit a backup file, you can work in
offline mode.

Backup files contain the following data:

•   Marking files

•   Graphic files

•   Font files

•   Function settings for all files

•   System settings

•   Error log

•   Command history

•   Power check history (LP-ZV)

•   Operating data

•   Current value of the counter function


ME-NAVIS2-OP-5                                                                                                77

---

## หน้า 78

6 Work with files


Note

•    System settings are party restorable.

•    Error logs, command history, power check history (LP-ZV), operation data, settings of
   “Power check” (LP-ZV) and current values of counter functions are not restorable.

•    The backup file format (.lzb or .lmb) depends on your version of Laser Marker NAVI
   smart. If you edit or create a backup file with Laser Marker NAVI smart version 3.0.0
   or higher, the backup data is saved in the .lzb file format. If you use version 2.x.x or
   previous, the backup data is saved in the .lmb file format.

•    With Laser Marker NAVI smart version 3.0.0 or higher, you can open .lzb and .lmb backup
   files. If you use Laser Marker NAVI smart version 2.x.x or lower, you can only open .lmb
   backup files.


Related topics

Backup the data (page 78)

Edit a backup file (page 79)

Restore a backup file (page 80)


6.7.2    Backup the data


Create and keep periodic backups in case you need to replace the laser marking system for
repair or maintenance.

A backup file contains the data from the laser marking system.

                    1.    Establish an online connection between your PC and the laser marking system.

                    2.    Go to the “Data management” screen.

                    3.    Select “Backup”.


                          “Backup” icon

                    4.    Select a storage location for the backup file and select “Save”.

                    5.    If desired, enter comments about the backup file (max. 300 characters) in the “Backup
                          comment” dialog.
                          You can refer to the comments when restoring the backup file.

                    6.    Select “OK”.
                          The file is saved as a backup file (.lzb or .lmb) to your local or network drive.


78                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 79

6.7 Backup files


Related topics

About backup files (page 77)

Edit a backup file (page 79)

Restore a backup file (page 80)


6.7.3   Edit a backup file


A backup file contains the data from the laser marking system. To edit a backup file, you can
work in offline mode.

To edit LP-400/LP-V or LP-M/LP-S/LP-Z backup data, you must first convert it to the backup
file format .lzb or .lmb.

•   Start Laser Marker NAVI smart.
   The “Startup” screen appears.

•   Select “Offline” > “Open...” > “Backup (.lzb/.lmb)”.

•   Select a backup file from your local or network drive and select “Open”.
   A dialog opens and shows a list of all marking files saved in the backup file. The marking
   file with the lowest number is selected in the list.
   To open another marking file, select it from the list.

•   Select “OK”.
   The selected file is opened in the “Marking settings” screen.

•   You can edit the marking files that are saved in the backup file.

•   To open another marking file, select “Open” > “From backup”.

•   The “Data management” screen is available when editing backup files in offline mode. If
   required, you may add marking files, graphic files, or font files to the backup file or delete
   files.

Save a changed marking file:

•   To save the marking file in the .lzs or .lms format to your PC, select “Save” > “To PC”.
•   To save the changed marking file in the backup, select “Save” > “Pre-save to backup”.
   This operation means that the marking file is pre-saved. You can continue to make
   changes to data in the backup file. When you made all changes to the data, you must
   save the whole backup file.

Save the changed backup file:

•   When you finish editing your data in your backup file, you must save the whole backup
   file.

•   In the ribbon, select “Save backup” > “Save”.
   Depending on the amount of data, this may take some time.

The file is saved as a backup file (.lzb or .lmb) to your local or network drive.


ME-NAVIS2-OP-5                                                                                                   79

---

## หน้า 80

6 Work with files


•    If required, you can create a copy of the existing backup file under a new name.
   ‒ Select “Save backup” > “Save as”.

   ‒ Select a storage location for the backup file and select “Save”.
•    To transfer your work to the laser marking system, establish an online connection and
   restore the contents of the backup file to the laser marking system.


Related topics

About backup files (page 77)

Backup the data (page 78)

Restore a backup file (page 80)

Convert an LP-400/LP-V backup file (page 82)

Convert an LP-M/LP-S/LP-Z backup file (page 86)


6.7.4    Restore a backup file


With this function, you can restore an existing backup file to your laser marking system.

Do not disconnect the laser marking system while restoring a backup file.

When you restore a backup file, the following data in the laser marking system are
overwritten: marking files, graphic files, font files, function settings for all files and partly the
system settings.

The laser marking system retains the original settings of the following parameters: current
counter value, time and date of system clock, settings of “Power optimization by marking
position” (LP-GS, LP-RC, LP-RH), settings of “Marking field calibration” (LP-RF, LP-RV,
LP-ZV), settings of optionally added hardware and software functions (e.g. PROFINET),
settings of “Power check” (LP-ZV), error log, command history, power check history (LP-ZV),
operating data.

To restore LP-400/LP-V or LP-M/LP-S/LP-Z backup data, you must first convert it to the
backup file format .lzb or .lmb.

                    1.      Establish an online connection between your PC and the laser marking system.


                             Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                             system failure may occur.

                    2.      Go to the “Data management” screen.

                    3.      Select “Restore”.


                            “Restore” icon


80                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 81

6.7 Backup files


                 4.     Select a backup file (.lzb or .lmb) to be restored and select “Open”.

                 5.     In the “Backup information” dialog, check the backup contents and select “OK” to
                        continue.

                 6.     In the dialog, specify if you want to restore the following settings:
                        “IP address (Ethernet)”, “IP address (EtherNet/IP)”, “Laser marker name”, “Camera”
                        (LP-ZV).
                        “IP address (EtherNet/IP)”: This check box is displayed if the optional network unit is
                        installed.
                        Make sure the IP address for the laser marking system does not overlap with IP
                        addresses of other external devices.

                 7.     To overwrite the settings with the backup data, select the check boxes.
                        Do not select the check boxes if you want to keep the setting as they are.

                 8.     Select “OK”.

                 9.     Select “Close” in the completion dialog.

                 10.    Turn off the power of the laser marking system, wait five seconds and then restart the
                        system.
                        The new settings will be updated in the laser marking system.


Related topics

About backup files (page 77)

Backup the data (page 78)

Edit a backup file (page 79)

Convert an LP-400/LP-V backup file (page 82)

Convert an LP-M/LP-S/LP-Z backup file (page 86)


6.7.5   Create a backup file for initial configuration


With this function, you can start editing your marking data and specify system setting
parameters before the laser marking system is delivered.

When the laser marking system is delivered, you restore the new backup file to the laser
marking system.

We recommend restoring a newly created backup file only for initial configuration. This is
useful, because the following parameters on the “System settings” screen should be set
before creating the first marking file: “Head direction to axis”, “First day of the week”, “First
week of the year”, “Compatible mode”, “Default setting for East Asian characters” and default
fonts under “Advanced system settings”.

If you restore a new backup later, be aware, that the current settings in the laser marking
system are overwritten. It may happen that the settings defined in the new backup are not
the same as your current settings on the laser marking system. For instance, a marking file


ME-NAVIS2-OP-5                                                                                                 81

---

## หน้า 82

6 Work with files


(No. 0002) is already saved on the laser marking system. Your backup does not contain a
marking file in the corresponding file No. 0002. If you restore your backup, the marking file
No. 0002 will be deleted.

Create a backup file for initial configuration:

                    1.   Start Laser Marker NAVI smart.
                         The “Startup” screen appears.

                    2.   Select “Offline” > “New...” > “Backup (.lzb)” or “Backup (.lmb)”.

                    3.   Select your future laser marking system from the list.
                         The “Marking settings” screen opens.

                    4.   You can create marking data on the “Marking settings” screen and specify different
                         parameters on the “System settings” screen.

                    5.   Select “Save backup” > “Save as”.
                         The file is saved as a backup file (.lzb or .lmb) to your local or network drive.


Related topics

About marking files (page 63)

Restore a backup file (page 80)


6.8      Convert files


6.8.1    Convert an LP-400/LP-V backup file


Convert an LP-400/LP-V backup file into the backup file format .lzb or .lmb if you want to
open it with Laser Marker NAVI smart.

Some functions and settings of LP-400/LP-V backup files cannot be converted as they are
not supported by LP-GS, LP-RC, LP-RF, LP-RH, LP-RV, and LP-ZV.

Please check the conversion result before operating the laser marking system.

                    1.   Start Laser Marker NAVI smart.
                         The “Startup” screen appears.

                    2.   Select “Convert” > “Convert backup” to open the “File conversion” dialog.

                    3.   Select “...” to open the folder list.

                    4.   Select the backup folder “SUNX_BKUP” and select “OK”.
                         Leave the following folder structure unchanged to avoid a reading error.


82                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 83

6.8 Convert files


SUNX_BKUP
  (1)
   BACKUP
  SYSTEM.LOG
  BKUP.INI

(1)   Folder (can be renamed)

                 5.   Select the backup data and select “OK”.
                 6.   Choose the laser marking systems of the source and the destination file.

                 7.   Select “OK”.
                      The conversion result information is displayed. It shows conversion errors and
                      parameters that were replaced.
                      To save the conversion result information, enable “Save the log file” and select “OK”.

                 8.   If you save the conversion result information, enter a file name and select “Save”.
                      The converted file is opened in the “Marking settings” screen.

                 9.   To save the converted backup file, select “Save backup” > “Save as”.
                      The file is saved as a backup file (.lzb or .lmb) to your local or network drive.


Related topics

About backup files (page 77)

Conversion rules for LP-400/LP-V files (page 84)


6.8.2   Convert an LP-400/LP-V file (.nlm)


Convert an LP-400/LP-V file into the marking file format .lzs or .lms if you want to open it with
Laser Marker NAVI smart.

Some functions and settings of LP-400/LP-V files cannot be converted as they are not
supported by LP-GS, LP-RC, LP-RF, LP-RH, LP-RV, and LP-ZV.

Please check the conversion result before operating the laser marking system.

                 1.   Start Laser Marker NAVI smart.
                      The “Startup” screen appears.

                 2.   Select “Convert” > “Convert marking file”.

                 3.   Select an LP-400/LP-V file (.nlm) that you want to convert.

                 4.   Select “Open”.
                      The file conversion dialog appears.

                 5.   In the dialog, choose the laser marking systems of the source and the destination file.

                 6.   Select “OK”.
                      The conversion result information is displayed. It shows conversion errors and
                      parameters that were replaced.


ME-NAVIS2-OP-5                                                                                                  83

---

## หน้า 84

6 Work with files


To save the conversion result information, enable “Save the log file” and select “OK”.

                    7.   If you save the conversion result information, enter a file name and select “Save”.
                         The converted file is opened in the “Marking settings” screen.
                    8.   You can edit marking objects and specify the marking settings.

                    9.   To save the converted file, select “Save” > “Save” or “Save as”.
                         You must save the file to your PC before you can transfer it to the laser marking system.

                         The file is saved in the marking file format .lzs or .lms to your local or network drive.


Related topics

Conversion rules for LP-400/LP-V files (page 84)

Transfer a marking file from your PC to the laser marking system (page 69)


6.8.3    Conversion rules for LP-400/LP-V files


There are certain rules that are applied when LP-400/LP-V files are converted into the LP-
GS, LP-RC, LP-RF, LP-RH, LP-RV, or LP-ZV, file format.


Marking data

The table shows the LP-400/LP-V setting categories and the corresponding categories in
Laser Marker NAVI smart after the conversion process.

LP-400/LP-V setting categories             Setting categories in Laser Marker NAVI smart

Marking character                          Reference character strings

Character condition                        Character object settings

Bar code condition                         Bar code object settings

2D code object settings

Logo condition                             Graphic object settings

Processing condition                       Shape object settings

Point radiation condition                  Point radiation object settings

General condition                          File settings

Object group settings

Function setting                           Function settings

Common setting                             Function settings for all files

Reference character strings for all files

Laser setting                              Laser settings

Object group settings


84                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 85

6.8 Convert files


LP-400/LP-V setting categories            Setting categories in Laser Marker NAVI smart

Trigger setting                           On-the-fly marking

File settings


In the converted files, the parameters for “Marking settings” > “File settings” > “Compatibility
with former models” are the same as the settings of the source data.


Object number and object group number

The object numbers of the marking data are assigned to the numbers shown in the following
table. These numbers can be used with LP-400/LP-V compatible command mode. The
marking data converted from LP-400/LP-V files and data set by LP-400/V compatible
command mode are assigned to the object group number 1000. If another object number
or object group number is set, the marking data cannot be controlled by the LP-400/LP-V
communication commands.

Object type                               Object number

Character object (reference list type)    1001–1060

Bar code object, 2D code object           1100–1107

Graphic object                            1200–1215

Shape object                              1300–1307

Point radiation object                    1400–1415

Object group                              1000


System settings

In converted backup files, “Compatible mode” (in “System settings” > “Operation/
information”) is set to “LP-400/V compatible”.

If “LP-400/V compatible” is set for “Compatible mode”, the following settings are changed:

•   The command mode is changed from standard command mode to LP-400/V command
   mode. In this mode you can use the command format of the LP-400/LP-V series.

•   If you create a new marking file, the object group number 1000 is automatically created
   in the object list. Be aware that only the marking data located in the object group number
   1000 can be controlled by the LP-400/LP-V series communication commands.

•   The parameters under “File settings” > “Compatibility with former models” are available.


Related topics

Select compatible mode (page 308)

Convert an LP-400/LP-V backup file (page 82)

Convert an LP-400/LP-V file (.nlm) (page 83)

Specify parameters under “Compatibility with former models” (page 269)


ME-NAVIS2-OP-5                                                                                                  85

---

## หน้า 86

6 Work with files


6.8.4    Convert an LP-M/LP-S/LP-Z backup file


Convert an LP-M/LP-S/LP-Z backup file into the backup file format .lzb if you want to open
it with Laser Marker NAVI smart. The converted LP-M/LP-S/LP-Z files are only supported by
the LP-ZV series.

Some functions and settings of LP-M/LP-S/LP-Z backup files cannot be converted as they
are not supported by LP-ZV.

                    1.    Start Laser Marker NAVI smart.
                          The “Startup” screen appears.

                    2.    Select “Convert” > “Convert backup” to open the “File conversion” dialog.

                    3.    Select “...” to open the folder list.

                    4.    Select the backup folder “SUNX_BACKUP” and select “OK”.
                          Leave the following folder structure unchanged to avoid a reading error.

                                SUNX_BACKUP
                                  (1)
                                        BACKUP
                                  BACKUP.LOG
                                  BKUP.INI

                          (1)   Folder (can be renamed)

                    5.    Select the backup data and select “OK”.

                    6.    Choose the laser marking systems of the source and the destination file and select
                          “OK”.

                    7.    For LP-M files, the “Conversion option” dialog opens.
                          If you use an external displacement sensor, activate “Enable the external
                          displacement sensor in the marking files”, and select “OK”.
                          You can use an external displacement sensor, provided that the optional expansion
                          board is installed in the controller.

                    8.    The conversion result information is displayed. It shows conversion errors and
                          parameters that were replaced.
                          To save the conversion result information, enable “Save the log file” and select “OK”.

                    9.    If you save the conversion result information, enter a file name and select “Save”.
                          The converted file is opened in the “Marking settings” screen.

                    10.   To save the converted backup file, select “Save backup” > “Save as”.
                          The file is saved as a backup file (.lzb) to your local or network drive.


Related topics

About backup files (page 77)

Conversion rules for LP-M/LP-S/LP-Z files (page 88)


86                                                                                                ME-NAVIS2-OP-5

---

## หน้า 87

6.8 Convert files


6.8.5   Convert an LP-M/LP-S/LP-Z file (.zlm)


Convert an LP-M/LP-S/LP-Z file into the marking file format .lzs if you want to open it with
Laser Marker NAVI smart. The converted LP-M/LP-S/LP-Z files are only supported by the
LP-ZV series.

Some functions and settings of LP-M/LP-S/LP-Z files cannot be converted as they are not
supported by LP-ZV.

                 1.     Start Laser Marker NAVI smart.
                        The “Startup” screen appears.

                 2.     Select “Convert” > “Convert marking file”.

                 3.     Select an LP-M/LP-S/LP-Z file (.zlm) that you want to convert.

                 4.     Select “Open”.
                        The file conversion dialog appears.

                 5.     In the dialog, choose the laser marking systems of the source and the destination file
                        and select “OK”.

                 6.     For LP-M files, the “Conversion option” dialog opens.
                        If you use an external displacement sensor, activate “Enable the external
                        displacement sensor in the marking files”, and select “OK”.
                        You can use an external displacement sensor, provided that the optional expansion
                        board is installed in the controller.

                 7.     The conversion result information is displayed. It shows conversion errors and
                        parameters that were replaced.
                        To save the conversion result information, enable “Save the log file” and select “OK”.

                 8.     If you save the conversion result information, enter a file name and select “Save”.
                        The converted file is opened in the “Marking settings” screen.

                 9.     You can edit marking objects and specify the marking settings.

                 10.    To save the converted file, select “Save” > “Save” or “Save as”.
                        You must save the file to your PC before you can transfer it to the laser marking
                        system.

                        The file is saved in the marking file format .lzs to your local or network drive.


Related topics

Conversion rules for LP-M/LP-S/LP-Z files (page 88)

Transfer a marking file from your PC to the laser marking system (page 69)


ME-NAVIS2-OP-5                                                                                                  87

---

## หน้า 88

6 Work with files


6.8.6    Conversion rules for LP-M/LP-S/LP-Z files


There are certain rules that are applied when LP-M/LP-S/LP-Z files are converted into the
LP-ZV file format.


Marking data

The table shows the LP-M/LP-S/LP-Z setting categories and the corresponding categories in
Laser Marker NAVI smart after the conversion process.

LP-M/LP-S/LP-Z setting categories             Setting categories in Laser Marker NAVI smart

Marking character                             Reference character strings

Character condition                           Character object settings

Bar code condition                            Bar code object settings

2D code object settings

Logo condition                                Graphic object settings

Processing condition                          Shape object settings

Point radiation condition                     Point radiation object settings

General condition                             File settings

Object group settings

Function setting                              Function settings

Common setting                                Function settings for all files

Laser setting                                 Laser settings

Object group settings

Trigger setting                               On-the-fly marking

File settings


In the converted files, the parameters for “Marking settings” > “File settings” > “Compatibility
with former models” are the same as the settings of the source data.


Object number and object group number

The object numbers of the marking data are assigned to the numbers shown in the following
table. These numbers can be used with LP-M/S/Z compatible command mode. The marking
data converted from LP-M/LP-S/LP-Z files and data set by LP-M/S/Z compatible command
mode are assigned to the object group number 1000 or 1001 to 1016. If another object
number or object group number is set, the marking data cannot be controlled by the LP-M/
LP-S/LP-Z communication commands.


88                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 89

6.8 Convert files


Object type                               Object number

Character object (reference list type)    1001–1099

Bar code object, 2D code object           1100–1115

Graphic object                            1200–1299

Shape object                              1300–1315

Point radiation object                    1400–1415

Object group                              1000 (when 3D marking is not used),
   1001–1016 (when 3D marking is used)


System settings

In converted backup files, “Compatible mode” (in “System settings” > “Operation/
information”) is set to “LP-M/S/Z compatible”.

If “LP-M/S/Z compatible” is set for “Compatible mode”, the following settings are changed:

•   The command mode is changed from standard command mode to LP-M/S/Z command
   mode. In this mode you can use the command format of the LP-M/LP-S/LP-Z series.

•   If you create a new marking file, the object group number 1000 is automatically created
   in the object list. Be aware that only the marking data located in the object group number
   1000 or 1001–1016 can be controlled by the LP-M/LP-S/LP-Z series communication
   commands.

•   The parameters under “File settings” > “Compatibility with former models” are available.

•   In the “Object settings” tab on the “Marking settings” screen, “Layer No. (LP-M/S/Z)” is
   displayed for character objects (reference list), graphic objects, shape objects, bar code
   objects, 2D code objects and point radiation objects. “Layer No. (LP-M/S/Z)” is used for
   the LP-M/S/Z compatible command mode.


Related topics

Select compatible mode (page 308)

Convert an LP-M/LP-S/LP-Z backup file (page 86)

Convert an LP-M/LP-S/LP-Z file (.zlm) (page 87)

Specify parameters under “Compatibility with former models” (page 269)


ME-NAVIS2-OP-5                                                                                                  89

---

## หน้า 90

7 Edit marking data


7        Edit marking data


7.1      Marking image editor

In the marking image editor, marking objects such as characters or graphics are displayed.
The marking image editor is part of the “Marking settings” screen and the “Monitor” screen.


1


3

   4
13
   5

2                                            6
   7
   8
   9
   10


12

11

(1)      File number and file name
   The file number and name are displayed in the tab. You can change the name by selecting the
   icon next to the name.
(2)      Image display
   The image of marking data such as characters and graphics is displayed in this area.
   LP-ZV: If a PC is connected to the laser head, you can display the camera view in the image
   display. The marking image is overlaying the camera image.
(3)      Zoom in / zoom out button
   To enlarge or reduce the view of marking data, select the “+” or “-” icon. Zooming does not
   affect the size of the marking data. You can change the magnification from x0.1 to x100. This
   setting applies to all marking files.
(4)      Grid button
   Select this button to show or hide the grid lines.
(5)      Snap to grid button
   To align the selected object along the grid, use this button.
(6)      Hand button
   Select the hand button to pan around the marking image editor.
(7)      Button to show or hide the marking field overview
   Select this button to show or hide the marking field overview.
(8)      Camera button (LP-ZV)
   The camera button turns on the camera and shows the real-time camera view of the marking
   field on the image display. The button is available when a PC and the laser head are connected
   with the supplied camera connection cable.
(9)      Zoom level indication
   The zoom level changes when you enlarge or reduce the view of the marking data.
(10)     Laser head direction
   The icon shows the direction of the laser head. “F” indicates the front of the laser head.
   LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), the icon is displayed
   in the 3D marking image editor.


90                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 91

7.2 Editing tools overview


(11)     Estimated marking time
   The estimated marking time of the file is calculated based on the input data and settings. This
   function is not available for on-the-fly marking and 3D marking (LP-ZV). To obtain a more
   precise result, perform marking time measurement.
(12)     Marking field overview
   At large zoom levels, the marking field overview indicates which part of the marking field is
   displayed.
   LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), the icon is displayed
   in the 3D marking image editor.
(13)     Ruler
   The rulers appear on the top and left side of the marking image editor. The origin of the rulers is
   the center of the marking field.


Note

You can customize the colors and the appearance of the marking image editor under
“Startup” > “Preferences” > “Color and appearance”.


Related topics

Change the appearances of user interface elements (page 30)

Perform marking time measurement (page 60)

Set the laser head direction (page 315)

Switch the camera on or off (page 95)

3D viewer (page 222)


7.2    Editing tools overview

To create marking objects and edit marking data, use the tools in the ribbon of the “Marking
settings” screen.


Create marking objects

Select the icon representing the object type that you want to create.


(1)           (2)         (3)      (4)         (5)       (6)

(1)    “Character” tool
(2)    “TrueType” tool
(3)    “Graphic” tool
(4)    “Bar code” tool
(5)    “2D code” tool
(6)    “Point radiation” tool


ME-NAVIS2-OP-5                                                                                                            91

---

## หน้า 92

7 Edit marking data


Create an object group

Select the following icon to create a new object group in the object list.


“Group” icon


Basic operations

To perform basic operations, use the icons in the ribbon. Alternatively, you can use keyboard
shortcuts to modify an object directly in the marking image editor. Select an object in the
marking image editor or an object group in the object list. Then select any of the following
icons:


(1)         (2)         (3)        (4)

(1)       To cut an object, select the “Cut” icon or press <Ctrl>+<X>.
(2)       To delete an object, select the “Delete” icon or press <Del>.
(3)       To copy an object, select the “Copy” icon or press <Ctrl>+<C>.
(4)       To paste the copied or cut object, select the “Paste” icon or press <Ctrl>+<V>.
   You can specify that a copied marking object is offset when pasted in the marking image editor.
   Go to “Startup” > “Preferences” > “General settings” > “Marking image editor”. If “Apply offset
   when pasting objects.” is selected, the copied marking object is pasted with an offset from the
   position of the original object. If you deselect the check box, the copied marking object is pasted at
   the same position as the original object.


(1)          (2)

(1)       To revert the most recent operation, select the “Undo” icon or press <Ctrl>+<Z>.
(2)       To redo the most recent undo operation, select the “Redo” icon or press <Ctrl>+<Y>.


Align and distribute objects

To align or distribute selected objects, use the “Align” tool.

LP-ZV: The “Align” tool is not available for 3D marking (“File settings” > “3D marking” is set to
“ON”).


“Align” tool

Select the type of alignment or distribution:

“Left”
“Center horizontally”
“Right”
“Top”
“Center vertically”
“Bottom”


92                                                                                                           ME-NAVIS2-OP-5

---

## หน้า 93

7.3 Move, modify or align objects


“Distribute horizontally”
“Distribute vertically”
“Center”


Adjust character objects

To adjust a character object, use the “Adjust” tool. This tool is not available for TrueType
objects.


“Adjust” tool

Select one of these options:

“Increase bold line width”
“Decrease bold line width”
“Increase character spacing”
“Decrease character spacing”
“Increase linefeed spacing”
“Decrease linefeed spacing”


Related topics

Specify “General settings” (page 29)


7.3    Move, modify or align objects

In the marking image editor, you can move and edit objects.

Before you can move or modify an object, you need to select it in the marking image editor.

•   Click on the object to select it.

•   To select two or more objects, press <Shift> or <Ctrl> and select the objects. Or click any
   position in the image display and drag over all marking objects you want to select.
•   Move the object by dragging it to a new location in the marking image editor. Hold down
   the <Shift> key while dragging to move the object in a precise horizontal or vertical
   direction.

•   You can scale an object with the circle symbols       located around the object. The
   proportions of the object are not maintained.
   a.   Position the pointer over one of the circle symbols.

b.   Click and drag until the object is the desired size.


ME-NAVIS2-OP-5                                                                                                  93

---

## หน้า 94

7 Edit marking data


c.   To maintain the object’s proportions as it scales, hold down <Shift> as you click and
   drag the circle symbols (in the corners).
   (3)                          (3)


(2)                                                       (2)


(1)

(1)   Increase or decrease the height of the object.
(2)   Increase or decrease the width of the object.
(3)   Increase or decrease the height and width of the object.

•   To rotate an object, use the circular arrow symbol . The rotation center of graphic files
   is the center of the graphic. The rotation center of other objects is the reference point of
   the object.
   a.   Position the pointer over the symbol.

b.   Click and drag in a circular motion.

c.   To rotate an object by 15 degree increments, hold down the <Shift> key while
   dragging.


•   To align or distribute selected objects, use the “Align” tool in the ribbon. Select the type of
   alignment or distribution.

•   Set the arrangement of a character object along an arc. You can do this directly in the
   marking image editor. This option is not available for TrueType objects.
   a.   Position the pointer over the arc symbol         .

b.   Click and drag until the object is the desired shape.


94                                                                                                ME-NAVIS2-OP-5

---

## หน้า 95

8.1 About the built-in camera


8      Built-in camera


8.1    About the built-in camera

The camera is installed in the laser head of the laser marking system (LP-ZV). In the marking
image editor, you can display the image of the marking field taken by the camera.

You can check the marking layout by superimposing the marking data on the captured
image. This function is available for the LP-ZV series.

Note the following points when using the camera:

•   The camera function is available only on the “Marking settings” screen.

•   To use the camera function, connect the laser head of the laser marking system and your
   PC with the supplied camera connection cable (USB cable).
•   The camera can capture in the range of the marking field.

•   The internal LED lights located on the laser head turn automatically on or off together with
   the camera.

•   The camera image can also be displayed when test marking is performed.

•   If you use both camera and autofocus function, the LED lights turn temporarily off when
   test marking starts and when measuring the workpiece displacement.

•   During guide laser radiation, the camera function cannot be used. The built-in camera
   turns off automatically when you start radiating the guide laser.

•   When editing a marking file in offline mode, you cannot specify the camera settings.

•   Depending on the materials of the workpiece and the surrounding environmental
   conditions, the camera may not take the image properly. Before operation, make sure that
   the camera works properly.

•   The colors of the camera image may differ from the actual colors.


8.2    Switch the camera on or off

You can switch the camera on or off with the “Camera” tool in the ribbon or with the camera
icon on the right side of the marking image editor.

The camera function is available only on the “Marking settings” screen. The camera can be
switched on only if the laser head of the laser marking system is connected to the PC.

•   If you use the “Camera” tool in the ribbon:
   ‒ Connect the laser head of the laser marking system and your PC with the supplied
   camera connection cable (USB cable).

‒ Establish an online connection between your PC and the laser marking system.


ME-NAVIS2-OP-5                                                                                                 95

---

## หน้า 96

8 Built-in camera


‒ In the “Marking settings” screen, select the “Camera” tool in the ribbon. The “Camera”
  dialog is displayed.


“Camera” tool

‒ Select “Camera ON” in the dialog. The image taken by the camera is displayed in the
  marking image editor.
‒ Select “Camera OFF” in the dialog to switch the camera off.

‒ To close the dialog, select “Close” or “X”.

•   If you use the camera icon on the right side of the marking image editor:
   ‒ Connect the laser head of the laser marking system and your PC with the supplied
   camera connection cable (USB cable).

‒ Establish an online connection between your PC and the laser marking system.

‒ Select the camera icon on the right side of the marking image editor to switch the
  camera on.


Camera icon

‒ To switch the camera off, select the camera icon again.

•   The following icons are available when the camera is on:


Pause icon
Select this icon to pause the camera and display the current still image. Deselect the icon
to resume displaying the live camera image.


Icon to show the marking data
Select this icon, to superimpose the marking data on the camera image. Deselect the
icon to hide the marking data.
You can change the color of the marking data under “Startup” > “Preferences” > “Color
and appearance” > “Color of marking objects in camera view”.


8.3      Specify the camera settings

In the “Camera” dialog, you can change the contrast and hue of the camera image
depending on the workpiece and the surrounding environmental conditions.

The value for “Z-movement of camera [mm]” can be set and saved separately for every
marking file. The other settings in the dialog apply to all files, and are saved in the laser
marking system without overwriting the file.


96                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 97

8.3 Specify the camera settings


                 1.   To use the camera, connect the laser head of the laser marking system and your PC
                      with the supplied camera connection cable (USB cable).

                 2.   Establish an online connection between your PC and the laser marking system.

                 3.   Select the “Camera” tool in the ribbon on the “Marking settings” screen.
                      The “Camera” dialog is displayed.

                 4.   Select “Camera ON” in the dialog to display the camera image in the marking image
                      editor.
                      You can specify the camera settings even if the camera is switched off. If the camera is
                      switched on, you can check the changes in real-time on the marking image editor.

                 5.   Specify any of the following parameters:
                      •   “Z-movement of camera [mm]”: -25.000 to 25.000
                          Specify a value (workpiece displacement) depending on the height of the workpiece
                          to adjust the work distance.
                          Set this parameter to 0mm if the laser head is installed at base position (LP-ZV200P/
                          LP-ZV500P: 190mm, LP-ZV205P/LP-ZV505P: 220mm, LP-ZV206P/LP-ZV506P:
                          330mm).
                          Enter a positive value to reduce the work distance and a negative value to increase
                          the work distance.


                                               (1)


                                         (2)         (5)
                                                           +25
                                                           0
                                         (3)
                                                           -25
                                             (4)
                                                                 [mm]

                          (1)   Laser head
                          (2)   Work distance (base position)
                          (3)   “Z-movement of camera [mm]” (workpiece displacement)
                          (4)   Workpiece
                          (5)   Setting range of “Z-movement of camera [mm]”

                          If you specify a wrong value for “Z-movement of camera [mm]”, the size of the
                          workpiece is displayed incorrectly in the marking image editor.
                          This setting is saved for every marking file. A restricted user cannot change this
                          setting.

                      •   “Brightness”: -128 to 127 (initial setting: 0)
                          Use the slider to adjust the brightness of the image.

                      •   “Contrast”: 0 to 255 (initial setting: 85)
                          Use the slider to adjust the image highlights and shadows.

                      •   “Hue”: -40 to 40 (initial setting: 0)
                          Use the slider to adjust the color or shade of the image.


ME-NAVIS2-OP-5                                                                                                 97

---

## หน้า 98

8 Built-in camera


•   “Saturation”: 0 to 255 (initial setting: 85)
   Use the slider to adjust the strength of the colors in the image.

•   “Sharpness”: 0 to 255 (initial setting: 64)
   Use the slider to sharpen the camera image by enhancing the definition of edges or
   contours.

•   “Gamma correction”: 48 to 192 (initial setting: 100)
   Use the slider to adjust the gamma correction.

•   “Auto-exposure”:
   If you select “ON” (initial setting), the gain and exposure time are set automatically.
   Select “OFF” to specify the parameters “Gain” and “Exposure time”.
   ‒ “Gain”: 0 to 112 (initial setting: 112)
   Use the slider to adjust the gain. A higher gain results in a brighter image, but
   the image can contain noise.

‒ “Exposure time”: 1 to 957 (initial setting: 957)
   Use the slider to adjust the exposure in order to brighten or darken the image. A
   long exposure time results in a brighter image, but the image might get blurry.

                    6.   Select “Camera OFF” in the dialog, to stop the camera image display.

                    7.   To close the dialog, select “Close” or “X”.


8.4      Adjust the camera lighting

Two LED lights are installed on the laser head of the LP-ZV series. Their brightness can be
adjusted to accommodate a wide range of different workpieces and the changing ambient
brightness.

The LED lights turn automatically on or off when the camera is switched on or off. The
lighting setting applies to all files, and is saved in the laser marking system without
overwriting the file.

                    1.   To use the camera, connect the laser head of the laser marking system and your PC
                         with the supplied camera connection cable (USB cable).

                    2.   Establish an online connection between your PC and the laser marking system.

                    3.   Select the “Camera” tool in the ribbon on the “Marking settings” screen.
                         The “Camera” dialog is displayed.

                    4.   Select “Camera ON” in the dialog to display the camera image in the marking image
                         editor.
                         You can specify the camera settings even if the camera is switched off. If the camera is
                         switched on, you can check the changes in real-time on the marking image editor.

                    5.   Set the parameters “LED 1 brightness” or “LED 2 brightness”.
                         Use the slider to set the brightness of the LED lights in the range from 0 to 5 (initial
                         setting: 3). The higher the value, the brighter the lighting. If you set 0, the LED light turns
                         off.


98                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 99

8.4 Adjust the camera lighting


(1)


(2)

(1)   LED 1
(2)   LED 2

                 6.   Select “Camera OFF” in the dialog, to stop the camera image display.

                 7.   To close the dialog, select “Close” or “X”.


ME-NAVIS2-OP-5                                                                                            99

---

## หน้า 100

9 Marking object basics


9        Marking object basics


9.1      Object type overview

You can use different marking objects in your marking file.

An object is the smallest data unit in a marking file. The following object types can be used:

•   Character object:
   Can contain characters and functional characters such as an expiry date.

•   TrueType object:
   Text that is formatted with a TrueType font installed on your PC.

•   Graphic object:
   VEC, DXF, BMP, JPEG and HPGL files are supported.
•   Shape object:
   You can create different shapes such as a line, circle or arc.

•   Bar code object:
   Various bar code types such as CODE39, EAN/UPC/JAN or CODE128 are supported.

•   2D code object:
   Various 2D code types such as QR Code or Data Matrix are supported.

•   Point radiation object:
   Use this object type to mark a specified coordinate.


Related topics

Character object (page 104)

TrueType object (page 120)

Graphic object (page 131)

Bar code object (page 156)

2D code object (page 169)

Point radiation object (page 153)


100                                                                                            ME-NAVIS2-OP-5

---

## หน้า 101

9.2 General object/object group parameters


9.2    General object/object group parameters

You can change the general parameters of a marking object or object group, for example the
object number or the object group name.

To edit the parameters of an object, select the object in the object list or in the marking image
editor. To edit the parameters of an object group, select the group in the object list.

The general parameters are displayed in the “General” category below the object list.

•   “Object No.”, “Object group No.”:
   The numbers are assigned in sequential order every time an object or object group
   is created. Enter another number in the text box to change it. The number is used for
   external control such as communication commands.

•   “Object name”, “Object group name”:
   To specify a name, select “Change”. Enter a name and select “OK”.
   The names are useful to identify the marking objects in the “Monitor” and “Marking
   settings” screen.

•   “Marking ON/OFF”:
   Select “ON” (initial setting) to mark the object or all objects grouped in an object group.
   Select “OFF” if you do not want to include an object or object group in the marking
   process. These objects are masked and grayed out in the object list. The objects are still
   displayed in the marking image editor.
   If “Marking ON/OFF” is set to “OFF” for an object group, it removes the “Marking ON/
   OFF” setting for all objects within the group, setting them all to “OFF” internally.

•   “Guide laser display” (LP-GS051, LP-GS051-L, LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV):
   The “Guide laser display” check box appears for objects after setting “Marking ON/OFF”
   to “OFF”.
   Select the check box if you want to display masked objects with the guide laser.
   If “Marking ON/OFF” is set to “OFF” for an object group, it removes the “Guide laser
   display” setting for all objects within the group, disabling the guide laser display.


Related topics

Guide laser (page 56)


9.3    Object list overview

The object list shows all marking objects and object groups of a marking file.

To display the object list, select “Object settings” on the “Marking settings” screen. The
following information is shown in the object list: object number, object type (code type for bar
code and 2D code objects) and object name if it was set. If you have not specified a name
for a character and TrueType object, the input characters of the first row are displayed in the


ME-NAVIS2-OP-5                                                                                                 101

---

## หน้า 102

9 Marking object basics


object list. If you have not specified a name for a graphic object, the file name of the graphic
is displayed.

Object groups provide a way to manage all objects in your marking file. You can create new
object groups and move objects into them or move objects from one object group to another
at any time.

LP-ZV: An icon of the 3D shape is displayed together with the object group in the object list
if 3D marking is turned on (“File settings” > “3D marking” > “ON”) and if the object group
belongs to a 3D shape.


Error symbol in the object list


The symbol appears next to the object group and object name. It indicates that this object
group contains an object with a setting error.


Grayed out objects in the object list

If “Marking ON/OFF” is set to “OFF” for a marking object or an object group, it will not be
marked. These objects or object groups are grayed out in the object list.


Move an object to a different object group

•   Select the name of the desired object in the object list.

•   You cannot move two or more objects together.

•   Drag the object to the object group you want.


Change the marking order

The display order in the object list indicates the marking order of the objects. The object at
the top of the list is marked first. Select an object and drag it to the desired position in the
object list.


Specify common parameters for multiple objects

When you select two or more individual objects, the parameters that are set in all selected
objects are displayed under “Multiselected objects”.

With this function, you can specify the commonly used parameters for multiple objects
together.

To select two or more objects in the object list, press <Ctrl> and select the objects. To select
a group of contiguous objects, press <Shift> and select the first and last object.


102                                                                                              ME-NAVIS2-OP-5

---

## หน้า 103

9.3 Object list overview


Related topics

General object/object group parameters (page 101)

Create, duplicate or delete an object group (page 207)


ME-NAVIS2-OP-5                                                                                103

---

## หน้า 104

10 Character object


10       Character object


10.1     Create a character object (direct input)

You can create a character object to add text to your marking image.

                  1.   Select the “Character” tool in the ribbon.

                  2.   Select “Direct input”.
                       If you want to use preset reference character strings, select “Reference list”. Reference
                       character strings can be commonly used across several objects or files.

                  3.   In the dialog, select a font for alphanumeric characters from the list.

                  4.   Enter the text for your character object (Max. 299 characters).
                       •   Select “Functional characters”, to specify functional characters such as date or
                           counter.
                       •   Select “User-defined characters”, to insert a user-defined character.

                       •   To set the percent sign “%” as a character, input “%%”.

                       •   To use Japanese or Simplified Chinese characters, specify the character set under
                           “East Asian characters” in “File settings”.

                       •   Multi-byte characters (e.g. East Asian characters) may contain a mixture of single-
                           byte and double-byte characters. Single-byte and double-byte represent the data
                           input method. For the appearance of the marking characters, there is no distinction
                           made between single-byte and double-byte.

                  5.   Select “OK”.
                       The entered text is displayed in the marking image editor and the new character object
                       is highlighted in the object list.
                  6.   To edit the parameters of the character object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.


Related topics

Create a character object (reference list) (page 105)

Use functional characters (page 241)

Set a user-defined character (page 106)

Specify the East Asian character set (page 265)

Set laser correction parameters for a marking object (page 283)

General object/object group parameters (page 101)

About font files (page 71)


104                                                                                               ME-NAVIS2-OP-5

---

## หน้า 105

10.2 Create a character object (reference list)


10.2   Create a character object (reference list)

You can create a character object by selecting preset character strings from a list. These
character strings can be commonly used across character objects in the current file or in all
files.

Under “Function settings” > “Current file” > “Reference character strings”, all character
strings that can be used in the current file are displayed. You can also edit the existing
character strings in this list.

To display and edit the character strings that are available for all files, select “Function
settings” > “For all files” > “Reference character strings”.

                 1.   Select the “Character” tool in the ribbon.

                 2.   Select “Reference list”.

                 3.   In the dialog, select “Current file” or “For all files” to display the corresponding reference
                      list.
                      In the “Current file” tab, you can set character strings that can only be used in the
                      current file. In the “For all files” tabs you can set character strings that can be used in all
                      files.
                      Reference character strings for all files can only be set in online mode or when editing a
                      backup file.

                 4.   If there are no character strings in the list, you can create them. Double-click on a row.

                 5.   In the dialog, enter the text (max. 99 characters).
                      •   Select “Functional characters”, to specify functional characters such as date or
                          counter.

                      •   Select “User-defined characters”, to insert a user-defined character.

                      •   To set the percent sign “%” as a character, input “%%”.

                      •   You cannot use a line feed in a reference character string.

                      •   To use Japanese or Simplified Chinese characters, specify the character set under
                          “East Asian characters” in “File settings”.

                      •   Multi-byte characters (e.g. East Asian characters) may contain a mixture of single-
                          byte and double-byte characters. Single-byte and double-byte represent the data
                          input method. For the appearance of the marking characters, there is no distinction
                          made between single-byte and double-byte.

                 6.   Select “OK” to close the dialog and return to the “Character (reference list)” dialog.

                 7.   To use a group of contiguous character strings, enter a value for “First string No.” and
                      “Last string No.”.
                      To use only one character string, enter the same number for “First string No.” and “Last
                      string No.”.

                 8.   Select “OK”.
                      The selected character strings are displayed in the marking image editor and the new
                      character object is highlighted in the object list.


ME-NAVIS2-OP-5                                                                                                   105

---

## หน้า 106

10 Character object


                  9.   To edit the parameters of the character object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.


Related topics

Create a character object (direct input) (page 104)

Use functional characters (page 241)

Set a user-defined character (page 106)

Specify the East Asian character set (page 265)

Specify reference character strings (page 263)

Set laser correction parameters for a marking object (page 283)

General object/object group parameters (page 101)


10.3     Set a user-defined character

You can insert a user-defined character in your character object or in a reference character
string.

To create a new character or symbol, use the provided Font Maker software. Add the new
character to the user-defined character font (USER1.FON). For details, refer to the “Font
Maker Operation Manual”.

To use the character in your character object, you must save the user-defined font on your
laser marker system.

                  1.   In the “Character” dialog, select “User-defined characters”.
                       The font images of the user-defined characters are displayed.
                       The following two characters are preassigned to character codes 8121h and 8122h for
                       U1 and U2 (initial setting).


                  2.   To select a character, click on it.

                  3.   Select “OK” to close the dialog and return to the “Character” dialog.


Related topics

Create a character object (direct input) (page 104)

Create a character object (reference list) (page 105)

Add font files (page 73)


106                                                                                               ME-NAVIS2-OP-5

---

## หน้า 107

10.4 Change characters or reference character strings


10.4   Change characters or reference character strings

You can modify the characters or reference character strings of an existing character object
in the “Object settings” tab.

                 1.    To edit the parameters of the character object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    Select “Change” next to “Text” to change the text of a character object.
                       For character objects that consist of reference character strings, select “Change” next to
                       “Applied character strings”.
                       Alternatively, double-click on the character object in the marking image editor.

                 3.    In the dialog, change the characters.
                       For character objects that consist of reference character strings, set other reference
                       character strings.

                 4.    Select “OK” to save the changes and close the dialog.


Related topics

Create a character object (direct input) (page 104)

Create a character object (reference list) (page 105)


10.5   Change the basic parameters of a character object

You can modify the parameters of an existing character object in the “Object settings” tab.

•    To edit the parameters of the character object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Do either of the following to adjust the basic parameters:

•    For “Font”, select a font for alphanumeric characters from the list.

•    Enter a value for “Bold line width [mm]” to specify the width of bold characters.
   The bold font style is not available for some characters if the font “Original 4” is set.
   Set “Bold line width [mm]” to max. one half of the value of “Character height [mm]” or
   “Character width [mm]”, whichever is smaller.

•    Specify the height and width of a character under “Character height [mm]” and “Character
   width [mm]”.
   For bold characters, set the ratio of “Character height [mm]” to “Character width [mm]”
   within the range from 1/10 to 10.


ME-NAVIS2-OP-5                                                                                                    107

---

## หน้า 108

10 Character object


(2)


(1)


(1)    Character height
(2)    Character width

•    “Bold filling line spacing [mm]”: Displays the value that is set for the distance between the
   filling lines of bold characters.
   You can change this parameter in the object group settings.

•    “Line width (calculation value) [mm]”: Displays the value that is set for the line width. It is
   defined as the laser line width for calculation.
   You can change this parameter in the object group settings.


Related topics

General object/object group parameters (page 101)

Set object group parameters (page 209)


10.6     Set the arrangement of a character object

Specify the arrangement of a character object. You can set different text paths such as a
straight line, arc inner side or arc outer side.

                  1.    To edit the parameters of the character object, select the object in the object list or in the
                        marking image editor.
                        The parameters are displayed in the category below the object list.

                  2.    For “Character arrangement”, you can select that the text is arranged along a straight
                        line or along the outer or inner side of an arc.
                        For character objects along an arc, you can specify whether the character spacing is
                        defined by angle or by length.


                                  (1)                          (2)                       (3)

                        (1)    “Straight line (horizontal)”
                        (2)    “Arc outside, char. spacing by angle”, “Arc outside, char. spacing by length”
                        (3)    “Arc inside, char. spacing by angle”, “Arc inside, char. spacing by length”


                        For arc aligned character objects with multiple text lines, the character layout depends
                        on the selected setting for “Character arrangement”. The following drawings show the
                        different character layouts.


108                                                                                                          ME-NAVIS2-OP-5

---

## หน้า 109

10.7 Align a character object


(1)                      (2)                 (3)                         (4)

(1)    “Arc outside, char. spacing by angle”
(2)    “Arc inside, char. spacing by angle”
(3)    “Arc outside, char. spacing by length”
(4)    “Arc inside, char. spacing by length”

                 3.   For character objects along an arc, you can specify the arc radius under “Arc radius
                      [mm]”.
                       (1)                               (2)


                      (1)    Arc radius (arc outside)
                      (2)    Arc radius (arc inside)


Related topics

Set the character spacing of a character object along a straight line (page 112)

Set the character spacing of a character object along an arc (page 114)


10.7   Align a character object

Specify the horizontal alignment of a character object. For objects along a straight line, you
can also specify the vertical alignment.

The “Horizontal alignment” and “Vertical alignment” settings influence the reference point
position of text objects along a straight line.

                 1.   To edit the parameters of the character object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   For “Horizontal alignment”, select one of the following options to specify the horizontal
                      position of the object.

                      ABijY                        ABijY                 ABijY
                      CDM12                       CDM12                 CDM12
                              (1)                        (2)                        (3)

                      (1)    “Left”
                      (2)    “Center”
                      (3)    “Right”


ME-NAVIS2-OP-5                                                                                                     109

---

## หน้า 110

10 Character object


                  3.    For “Vertical alignment”, select one of the following options to specify the vertical
                        position of character objects along a straight line. This setting is not available for
                        character objects along an arc.
                                                 (1)
                                                 (2)
                                                 (3)


                                                 (4)

                        (1)     “Top”
                        (2)     “1st baseline”
                        (3)     “Center”
                        (4)     “Bottom”


Related topics

Change the position of a character object (page 110)


10.8     Change the position of a character object

To position a character object, specify the coordinates of the reference point. Alternatively,
you can move the object in the marking image editor by dragging it to a new location.

LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the position values
specified in the object settings define the coordinates on a 3D model (local position).

•    To edit the parameters of the character object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.
•    For character objects along a straight line, specify values for “X-position [mm]” and “Y-
   position [mm]”. The position of an object also depends on the settings under “Horizontal
   alignment” and “Vertical alignment”.
   (X, Y)                          (X, Y)                                          (X, Y)

ABijY                          ABijY                          ABijY
CDM12                         CDM12                         CDM12
EFyWel                        EFyWel                        EFyWel
   (1)                            (2)                            (3)

(1)    “Horizontal alignment” > “Left”, “Vertical alignment” > “1st baseline”
(2)    “Horizontal alignment” > “Center”, “Vertical alignment” > “Center”
(3)    “Horizontal alignment” > “Right”, “Vertical alignment” > “Top”


110                                                                                                       ME-NAVIS2-OP-5

---

## หน้า 111

10.9 Rotate a character object


•   For character objects along an arc, specify values for “Center X-position [mm]” and
   “Center Y-position [mm]”, the arc's center.


   BijY
A      (1)          (X, Y)

(1)   “Arc outside, char. spacing by angle”, “Arc outside, char. spacing by length”

•   Alternatively, select the object in the marking image editor and drag it to a new location.


Related topics

Align a character object (page 109)

Move, modify or align objects (page 93)


10.9   Rotate a character object

To rotate a character object, set a rotation center and specify a rotation angle. Alternatively,
use the circular arrow symbol in the marking image editor.

•   To edit the parameters of the character object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

•   Specify the rotation center. Depending on whether your object is arranged along a line or
   an arc, specify values for “X-position [mm]” and “Y-position [mm]” or “Center X-position
   [mm]” and “Center Y-position [mm]”, the arc's center.
   For objects along a straight line, the rotation center varies depending on your “Horizontal
   alignment” and “Vertical alignment” setting.

•   If your object is arranged along a straight line, enter a value for “Rotation angle [°]” to
   rotate it. Enter a positive value for counterclockwise rotation and a negative value for
   clockwise rotation.


(1)      (2)                                                       (3)


(1)   Rotation angle ( “Horizontal alignment” > “Left”)
(2)   Rotation angle (“Horizontal alignment” > “Right”)
(3)   Rotation angle (“Horizontal alignment” > “Center”)


ME-NAVIS2-OP-5                                                                                                     111

---

## หน้า 112

10 Character object


•    If your object is arranged along an arc, enter a value for “Start angle [°]”. The start angle
   rotates the position of the arc based on your “Horizontal alignment” setting. Enter a
   positive value for counterclockwise rotation and a negative value for clockwise rotation.
   (1)                                           (2)                 (3)                             (4)
   i j Y                                             B i j Y
   jY                                                 BijY
   Bi
   B                                                       A
   A


   A
A

(1)   Start angle (“Arc outside, char. spacing by angle” or “Arc outside, char. spacing by length”,
   “Horizontal alignment” > “Left”)
(2)   Start angle (“Arc inside, char. spacing by angle” or “Arc inside, char. spacing by length”,
   “Horizontal alignment” > “Left”)
(3)   Start angle (“Arc outside, char. spacing by angle” or “Arc outside, char. spacing by length”,
   “Horizontal alignment” > “Center”)
(4)   Start angle (“Arc inside, char. spacing by angle” or “Arc inside, char. spacing by length”,
   “Horizontal alignment” > “Center”)

•    To rotate an object with the circular arrow symbol , select the object in the marking
   image editor. Position the pointer over the symbol. Click and drag in a circular motion.


Related topics

Move, modify or align objects (page 93)


10.10 Set the character spacing of a character object along a straight line

Character spacing refers to adjusting the spacing throughout a selected word or a block of
text.

                  1.    To edit the parameters of the character object, select the object in the object list or in the
                        marking image editor.
                        The parameters are displayed in the category below the object list.

                  2.    Set “Straight line (horizontal)” for “Character arrangement”.

                  3.    For “Character spacing type”, select one of the following options: “Fixed spacing”,
                        “Proportional 1”, “Proportional 2”, “Proportional 3”, “Justify”.


                        “Fixed spacing”
                        Regardless of the character width, the characters are spaced evenly by a specified
                        value. The character spacing value is defined as the distance from the center of one
                        character to the center of the next.


112                                                                                                       ME-NAVIS2-OP-5

---

## หน้า 113

10.10 Set the character spacing of a character object along a straight line


(1)


(1)    Character spacing


“Justify”
The space between characters is distributed evenly to align to a specified character
string width. If the specified character string width is smaller than the character width
multiplied by the number of characters, the character width is automatically reduced.
If you encounter a broken character layout while using an LP-400/LP-V or LP-M/LP-S/
LP-Z marking file, go to “System settings” > “Operation/information” > “Advanced system
settings” and deselect the check box “Adjust character width when justifying”.
   (1)


(1)    Character string width


Proportional settings (“Proportional 1”, “Proportional 2”, “Proportional 3”)
Depending on the width of the characters, the character spacing is adjusted. Select this
setting to adjust the spacing of specific characters such as “i” or “l”. This setting creates
spaces of a specified value between characters. The character spacing value is defined
as the distance from the end (right edge) of one character to the start (left edge) of the
next.
Select “Proportional 1”, “Proportional 2” or “Proportional 3” from the list box.
“Proportional 1” specifies the smallest spacing between the characters, “Proportional 3”
the largest.
•     “Proportional 1”: The character spacing of “i” or “l” (small letter “L”) is defined as “0”.
   Use this setting to set a minimum character spacing value.

•     “Proportional 2”: With this setting, the character width of “i” or “l” (small letter “L”) is
   defined as 1/4 of the width of the letter “W”.

•     “Proportional 3”: With this setting, the character width of “i” or “l” (small letter “L”) is
   defined as 5/8 of the width of the letter “W”.

If “Compatible mode” on the “System settings” screen is set to “LP-400/V compatible”
or “LP-M/S/Z compatible”, specify the proportional settings under “File settings” >
“Proportional type”.


ME-NAVIS2-OP-5                                                                                                    113

---

## หน้า 114

10 Character object


(1)


(1)

(1)    Character spacing

                  4.    Specify a value for “Character spacing [mm]” or “Character string width [mm]”.
                        The available setting names change depending on your selection for “Character spacing
                        type”.
                        •     For “Fixed spacing” and proportional settings (“Proportional 1”, “Proportional 2”,
                              “Proportional 3”), input the desired value under “Character spacing [mm]”.

                        •     For “Justify”, input the desired value under “Character string width [mm]”.

                  5.    If you select “Proportional 1”, specify the width of a blank character under “Space width
                        [mm]”.


Related topics

Specify parameters under “Compatibility with former models” (page 269)

Set the character spacing of a character object along an arc (page 114)

Configure advanced system settings (page 310)


10.11 Set the character spacing of a character object along an arc

There are two different options to specify the character spacing for arc aligned character
objects. You can specify whether the character spacing is defined by angle or by length.

•    If “Arc outside, char. spacing by angle” or “Arc inside, char. spacing by angle” is set for
   “Character arrangement”, select a character spacing type and set an angle value.

•    If “Arc outside, char. spacing by length” or “Arc inside, char. spacing by length” is set for
   “Character arrangement”, select a character spacing type and set a length value.

For details, refer to the following topics:

•    Set the character spacing by specifying an angle (page 115)

•    Set the character spacing by specifying a length (page 116)


114                                                                                                ME-NAVIS2-OP-5

---

## หน้า 115

10.11 Set the character spacing of a character object along an arc


10.11.1 Set the character spacing by specifying an angle


Character spacing refers to adjusting the spacing throughout a selected word or a block of
text.

                 1.   To edit the parameters of the character object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.
                 2.   Set “Arc outside, char. spacing by angle” or “Arc inside, char. spacing by angle” for
                      “Character arrangement”.

                 3.   For “Character spacing type”, select one of the following options: “Fixed spacing”,
                      “Proportional 1”, “Proportional 2”, “Proportional 3”, “Justify”.


                      “Fixed spacing”
                      Regardless of the character width, the characters are spaced evenly by a specified
                      angle. The character spacing value is defined as the angle between the center lines of
                      two adjacent characters.
                              (1)                                     (2)


                      (1)   Character spacing angle (“Arc outside, char. spacing by angle”)
                      (2)   Character spacing angle (“Arc inside, char. spacing by angle”)


                      “Justify”
                      The space between characters is distributed evenly to align to a specified arc angle.
                                     (1)                                       (2)


                      (1)   Arc angle (“Arc outside, char. spacing by angle”)
                      (2)   Arc angle (“Arc inside, char. spacing by angle”)


                      Proportional settings (“Proportional 1”, “Proportional 2”, “Proportional 3”)
                      If “Compatible mode” on the “System settings” screen is set to “LP-400/V compatible”
                      or “LP-M/S/Z compatible”, set “Proportional” for “Character spacing type”. Specify the
                      proportional settings (“Proportional 1”, “Proportional 2”, “Proportional 3”) under “File
                      settings” > “Proportional type”.


ME-NAVIS2-OP-5                                                                                                  115

---

## หน้า 116

10 Character object


Depending on the width of the characters, the character spacing is adjusted. Select this
setting to adjust the spacing of specific characters such as “i” or “l”. This setting creates
spaces of a specified angle between characters. The character spacing value is defined
as the angle between the end (right edge) of one character and the start (left edge) of
the next.
Select “Proportional 1”, “Proportional 2” or “Proportional 3” from the list box.
“Proportional 1” specifies the smallest spacing between the characters, “Proportional 3”
the largest.
•     “Proportional 1”: The character spacing of “i” or “l” (small letter “L”) is defined as “0”.
   Use this setting to set a minimum character spacing value.

•     “Proportional 2”: With this setting, the character width of “i” or “l” (small letter “L”) is
   defined as 1/4 of the width of the letter “W”.

•     “Proportional 3”: With this setting, the character width of “i” or “l” (small letter “L”) is
   defined as 5/8 of the width of the letter “W”.

(1)                               (2)


(1)    Character spacing angle (“Arc outside, char. spacing by angle”)
(2)    Character spacing angle (“Arc inside, char. spacing by angle”)

                  4.   Specify a value for “Character spacing angle [°]” or “Arc angle [°]”.
                       The available setting names change depending on your selection for “Character spacing
                       type”.
                       •     For “Fixed spacing” and proportional settings (“Proportional 1”, “Proportional 2”,
                             “Proportional 3”), input the desired value under “Character spacing angle [°]”.
                       •     For “Justify”, input the desired value under “Arc angle [°]”.

                  5.   If you select “Proportional 1”, specify the width of a blank character under “Space width
                       [mm]”.


Related topics

Specify parameters under “Compatibility with former models” (page 269)

Set the character spacing of a character object along an arc (page 114)


10.11.2 Set the character spacing by specifying a length


Character spacing refers to adjusting the spacing throughout a selected word or a block of
text.

                  1.   To edit the parameters of the character object, select the object in the object list or in the
                       marking image editor.


116                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 117

10.11 Set the character spacing of a character object along an arc


The parameters are displayed in the category below the object list.

                 2.   Set “Arc outside, char. spacing by length” or “Arc inside, char. spacing by length” for
                      “Character arrangement”.

                 3.   For “Character spacing type”, select one of the following options: “Fixed spacing”,
                      “Proportional 1”, “Proportional 2”, “Proportional 3”.
                      “Justify” cannot be selected.


                      “Fixed spacing”
                      Regardless of the character width, the characters are spaced evenly by a specified
                      length. The character spacing value is defined as the length along an arc between the
                      center lines of two adjacent characters.
                             (1)               (1)                  (2)                   (2)


                      (1)    Character spacing (“Arc outside, char. spacing by length”)
                      (2)    Character spacing (“Arc inside, char. spacing by length”)


                      Proportional settings (“Proportional 1”, “Proportional 2”, “Proportional 3”)
                      Depending on the width of the characters, the character spacing is adjusted. Select
                      this setting to adjust the spacing of specific characters such as “i” or “l”. The character
                      spacing value is defined as the length along an arc between the end (right edge) of one
                      character and the start (left edge) of the next.
                      Select “Proportional 1”, “Proportional 2” or “Proportional 3” from the list box.
                      “Proportional 1” specifies the smallest spacing between the characters, “Proportional 3”
                      the largest.
                      •     “Proportional 1”: The character spacing of “i” or “l” (small letter “L”) is defined as “0”.
                            Use this setting to set a minimum character spacing value.

                      •     “Proportional 2”: With this setting, the character width of “i” or “l” (small letter “L”) is
                            defined as 1/4 of the width of the letter “W”.
                      •     “Proportional 3”: With this setting, the character width of “i” or “l” (small letter “L”) is
                            defined as 5/8 of the width of the letter “W”.

                      If “Compatible mode” on the “System settings” screen is set to “LP-400/V compatible”
                      or “LP-M/S/Z compatible”, set “Proportional” for “Character spacing type”. Specify the
                      proportional settings (“Proportional 1”, “Proportional 2”, “Proportional 3”) under “File
                      settings” > “Proportional type”.


ME-NAVIS2-OP-5                                                                                                         117

---

## หน้า 118

10 Character object


(1)              (1)                        (2)           (2)


(1)   Character spacing (“Arc outside, char. spacing by length”)
(2)   Character spacing (“Arc inside, char. spacing by length”)

                  4.   Specify a value for “Character spacing [mm]”.

                  5.   If you select “Proportional 1”, specify the width of a blank character under “Space width
                       [mm]”.


Related topics

Specify parameters under “Compatibility with former models” (page 269)

Set the character spacing of a character object along an arc (page 114)


10.12 Specify the line spacing of a character object

If a character object consists of multiple text lines, you can specify the vertical distance
between them. Line spacing can be set for character objects along a straight line and along
arcs.

                  1.   To edit the parameters of the character object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                  2.   Input a value for “Linefeed spacing [mm]”. The line spacing is the vertical distance
                       between lines of text.


                       (1)


                       (1)   Line spacing (“Straight line (horizontal)”)


                       For arcs with multiple lines of text, the arc radius of the second or subsequent text lines
                       is increased or reduced with the line spacing value.


118                                                                                               ME-NAVIS2-OP-5

---

## หน้า 119

10.12 Specify the line spacing of a character object


(1)                           (2)

(1)    Line spacing (“Arc outside, char. spacing by angle”)
(2)    Line spacing (“Arc inside, char. spacing by angle”)


(1)                            (2)

(1)    Line spacing (“Arc outside, char. spacing by length”)
(2)    Line spacing (“Arc inside, char. spacing by length”)


ME-NAVIS2-OP-5                                                                                               119

---

## หน้า 120

11 TrueType object


11       TrueType object


11.1     Create a TrueType object

You can create a TrueType object to format text with a TrueType font installed on your PC.
TrueType objects are automatically converted into graphic files.

Characters written from right to left such as Arabic or Hebrew and, characters based on
ligature such as Indian languages are not supported.

                     1.   Select the “TrueType” tool in the ribbon.

                     2.   In the dialog, select a font from the list box.

                     3.   Enter the text for your TrueType object and select “OK”.
                          The entered text is displayed in the marking image editor and the new TrueType object
                          is highlighted in the object list.
                          The TrueType object is saved as a graphic file with the file extension .ttd. In the dialog,
                          the file name is displayed under “Graphic (TTD) file”.

                     4.   To edit the parameters of the TrueType object, select the object in the object list.
                          The parameters are displayed in the “TrueType” category below the object list.


Related topics

General object/object group parameters (page 101)

Change the basic parameters of a TrueType object (page 121)

Set the arrangement of a TrueType object (page 121)

Align a TrueType object (page 122)

Change the position of a TrueType object (page 123)

Rotate a TrueType object (page 124)

Set the character spacing of a TrueType object along a straight line (page 125)

Set the character spacing of a TrueType object along an arc (page 127)

Set kerning for TrueType objects (page 128)

Specify the line spacing of a TrueType object (page 129)

Apply fill settings to a TrueType object (page 129)

Set laser correction parameters for a marking object (page 283)


120                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 121

11.2 Change the basic parameters of a TrueType object


11.2   Change the basic parameters of a TrueType object

You can modify the input text, font and styles as well as the character height and width in the
“Object settings” tab.

•    To edit the parameters of the TrueType object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Do either of the following to adjust the basic parameters:

•    Select “Change” next to “Text” to change the text of a TrueType object.

•    For “Font”, select a font from the list of installed fonts on your PC.
   For characters that are not supported by the selected font, the fallback font that is
   specified in the font properties is applied. If there is no fallback font, these characters
   cannot be used.

•    Select “Bold” or “Italic” to change the font style.
   For some fonts, you must select the bold or italic type style, to be able to create a
   TrueType object.

•    Specify the height and width of a character under “Character height [mm]” and “Character
   width [mm]”.
   These values do not represent the actual character size, because they include the
   spacing defined for each TrueType character. To specify the character size accurately,
   measure the actual size of a marked character, and adjust the height and width values.


Related topics

Create a TrueType object (page 120)


11.3   Set the arrangement of a TrueType object

Specify the arrangement of a TrueType object. You can set different text paths such as a
straight line, arc inner side or arc outer side.

                 1.    To edit the parameters of the TrueType object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.


ME-NAVIS2-OP-5                                                                                                      121

---

## หน้า 122

11 TrueType object


                     2.   For “Character arrangement”, you can select that the text is arranged along a straight
                          line or along the outer or inner side of an arc.


                                   (1)                               (2)              (3)

                          (1)   “Straight line (horizontal)”
                          (2)   “Arc outside”
                          (3)   “Arc inside”

                     3.   For TrueType objects along an arc, you can specify an arc radius value under “Arc
                          radius [mm]”.
                          (1)                                  (2)


                          (1)   Arc radius (“Arc outside”)
                          (2)   Arc radius (“Arc inside”)


Related topics

Set the character spacing of a TrueType object along a straight line (page 125)

Set the character spacing of a TrueType object along an arc (page 127)


11.4     Align a TrueType object

Specify the horizontal alignment of a TrueType object. For objects along a straight line, you
can also specify the vertical alignment.

The “Horizontal alignment” and “Vertical alignment” settings influence the reference point
position of text objects along a straight line.

                     1.   To edit the parameters of the TrueType object, select the object in the object list or in the
                          marking image editor.
                          The parameters are displayed in the category below the object list.


122                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 123

11.5 Change the position of a TrueType object


                 2.    For “Horizontal alignment”, select one of the following options to specify the horizontal
                       position of the object.


                               (1)                       (2)                         (3)

                       (1)   “Left”
                       (2)   “Center”
                       (3)   “Right”

                 3.    For “Vertical alignment”, select one of the following options to specify the vertical
                       position of TrueType objects along a straight line. This setting is not available for
                       TrueType objects along an arc.
                                              (1)

                                              (2)
                                              (3)


                                              (4)

                       (1)   “Top”
                       (2)   “1st baseline”
                       (3)   “Center”
                       (4)   “Bottom”


Related topics

Change the position of a TrueType object (page 123)


11.5   Change the position of a TrueType object

To position a TrueType object, specify the coordinates of the reference point. Alternatively,
you can move the object in the marking image editor by dragging it to a new location.

LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the position values
specified in the object settings define the coordinates on a 3D model (local position).

•    To edit the parameters of the TrueType object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.


ME-NAVIS2-OP-5                                                                                                  123

---

## หน้า 124

11 TrueType object


•   For TrueType objects along a straight line, specify values for “X-position [mm]” and “Y-
   position [mm]”. The position of an object also depends on the settings under “Horizontal
   alignment” and “Vertical alignment”.
   (X, Y)                           (X, Y)                                           (X, Y)


(1)                            (2)                              (3)

(1)    “Horizontal alignment” > “Left”, “Vertical alignment” > “1st baseline”
(2)    “Horizontal alignment” > “Center”, “Vertical alignment” > “Center”
(3)    “Horizontal alignment” > “Right”, “Vertical alignment” > “Top”

•   For TrueType objects along an arc, specify values for “Center X-position [mm]” and
   “Center Y-position [mm]”, the arc's center.


(1)         (X, Y)

(1)    “Arc outside”

•   Alternatively, select the object in the marking image editor and drag it to a new location.


Related topics

Align a TrueType object (page 122)

Move, modify or align objects (page 93)


11.6     Rotate a TrueType object

To rotate a TrueType object, set a rotation center and specify a rotation angle. Alternatively,
use the circular arrow symbol in the marking image editor.

•   To edit the parameters of the TrueType object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

•   Specify the rotation center. Depending on whether your object is arranged along a line or
   an arc, specify values for “X-position [mm]” and “Y-position [mm]” or “Center X-position
   [mm]” and “Center Y-position [mm]”, the arc's center.
   For objects along a straight line, the rotation center varies depending on your “Horizontal
   alignment” and “Vertical alignment” setting.


124                                                                                                         ME-NAVIS2-OP-5

---

## หน้า 125

11.7 Set the character spacing of a TrueType object along a straight line


•    If your object is arranged along a straight line, enter a value for “Rotation angle [°]” to
   rotate it. Enter a positive value for counterclockwise rotation and a negative value for
   clockwise rotation.


(1)      (2)                                                    (3)


(1)   Rotation angle (“Horizontal alignment” > “Left”)
(2)   Rotation angle (“Horizontal alignment” > “Right”)
(3)   Rotation angle (“Horizontal alignment” > “Center”)

•    If your object is arranged along an arc, enter a value for “Start angle [°]”. The start angle
   rotates the position of the arc based on your “Horizontal alignment” setting. Enter a
   positive value for counterclockwise rotation and a negative value for clockwise rotation.
   (1)                                   (2)                      (3)               (4)


(1)   Start angle (“Arc outside”, “Horizontal alignment” > “Left”)
(2)   Start angle (“Arc inside”, “Horizontal alignment” > “Left”)
(3)   Start angle (“Arc outside”, “Horizontal alignment” > “Center”)
(4)   Start angle (“Arc inside”, “Horizontal alignment” > “Center”)

•    To rotate an object with the circular arrow symbol , select the object in the marking
   image editor. Position the pointer over the symbol. Click and drag in a circular motion.


Related topics

Move, modify or align objects (page 93)


11.7   Set the character spacing of a TrueType object along a straight line

Character spacing refers to adjusting the spacing throughout a selected word or a block of
text.

                 1.    To edit the parameters of the TrueType object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    Set “Straight line (horizontal)” for “Character arrangement”.

                 3.    For “Character spacing type”, select one of the following options: “Standard”, “Fixed
                       spacing”, “Justify”.


                       “Standard”
                       Depending on the width of the characters, the character spacing is adjusted by following
                       the standard of the TrueType font. Select this setting to adjust the spacing of specific


ME-NAVIS2-OP-5                                                                                                       125

---

## หน้า 126

11 TrueType object


characters such as “i” or “l”. This setting creates spaces of a specified value between
characters. The character spacing value is defined as the distance from the end (right
edge) of one character to the start (left edge) of the next.


(1)

(1)    Character spacing


“Fixed spacing”
Regardless of the character width, the characters are spaced evenly by a specified
value. The character spacing value is defined as the distance from the start (left edge) of
one character to the start of the next.


(1)

(1)    Character spacing


“Justify”
The space between characters is distributed evenly to align to a specified character
string width. If the specified character string width is smaller than the character width
multiplied by the number of characters, the character width is automatically reduced.


(1)

(1)    Character string width


                     4.   Specify a value for “Character spacing [mm]” or “Character string width [mm]”.
                          The available setting names change depending on your selection for “Character spacing
                          type”.
                          •     For “Standard” and “Fixed spacing”, input the desired value under “Character
                                spacing [mm]”.

                          •     For “Justify”, input the desired value under “Character string width [mm]”.


Related topics

Set the character spacing of a TrueType object along an arc (page 127)


126                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 127

11.8 Set the character spacing of a TrueType object along an arc


11.8   Set the character spacing of a TrueType object along an arc

Character spacing refers to adjusting the spacing throughout a selected word or a block of
text.

                 1.   To edit the parameters of the TrueType object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Set “Arc outside” or “Arc inside” for “Character arrangement”.

                 3.   For “Character spacing type”, select one of the following options: “Standard”, “Fixed
                      spacing”, “Justify”.


                      “Standard”
                      Depending on the width of the characters, the character spacing is adjusted by following
                      the standard of the TrueType font. Select this setting to adjust the spacing of specific
                      characters such as “i” or “l”. This setting creates spaces of a specified angle between
                      characters. The character spacing value is defined as the angle between the end (right
                      edge) of one character and the start (left edge) of the next.
                                                                            (2)
                                  (1)                                             (2)
                      (1)


                      (1)   Character spacing angle (“Arc outside”)
                      (2)   Character spacing angle (“Arc inside”)


                      “Fixed spacing”
                      Regardless of the character width, the characters are spaced evenly by a specified
                      angle. The character spacing value is defined as the angle between the center lines of
                      two adjacent characters.
                                                                      (2)
                                        (1)                   (2)

                                              (1)


                      (1)   Character spacing angle (“Arc outside”)
                      (2)   Character spacing angle (“Arc inside”)


                      “Justify”
                      The space between characters is distributed evenly to align to a specified arc angle.


ME-NAVIS2-OP-5                                                                                                  127

---

## หน้า 128

11 TrueType object


   (2)
   (1)
   B i j
Bij


   A
   Y
A
   Y
(1)    Arc angle (“Arc outside”)
(2)    Arc angle (“Arc inside”)


                     4.   Specify a value for the “Character spacing angle [°]” or “Arc angle [°]”.
                          The available setting names change depending on your selection for “Character spacing
                          type”.
                          •     For “Standard” and “Fixed spacing”, input the desired angle value under “Character
                                spacing angle [°]”.

                          •     For “Justify”, input the desired arc angle value under “Arc angle [°]”.


Related topics

Set the character spacing of a TrueType object along a straight line (page 125)


11.9     Set kerning for TrueType objects

Kerning is the adjustment of the spaces between specific letter pairs, called kerning pairs.

The “Kerning” setting is available when the character spacing type is set to “Standard”.

                     1.   To edit the parameters of the TrueType object, select the object in the object list or in the
                          marking image editor.
                          The parameters are displayed in the category below the object list.

                     2.   Select “Kerning” to apply a correction of the single character distances depending on
                          their size.


                                             (1)


                                             (2)


                          (1)    With kerning
                          (2)    Without kerning


128                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 129

11.10 Specify the line spacing of a TrueType object


Related topics

Set the character spacing of a TrueType object along a straight line (page 125)

Set the character spacing of a TrueType object along an arc (page 127)


11.10 Specify the line spacing of a TrueType object

If a TrueType object consists of multiple text lines, you can specify the vertical distance
between them. Line spacing can be set for TrueType objects along a straight line and along
arcs.

                 1.    To edit the parameters of the TrueType object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    Input a value for “Linefeed spacing [mm]”. The line spacing is the vertical distance
                       between lines of text.
                       For arcs with multiple lines of text, the arc radius of the second or subsequent text lines
                       is increased or decreased with the line spacing value.


                       (1)

                                                           (2)                        (3)

                       (1)   Line spacing (“Straight line (horizontal)”)
                       (2)   Line spacing (“Arc outside”)
                       (3)   Line spacing (“Arc inside”)


11.11 Apply fill settings to a TrueType object

With the “Character fill” setting, you can create a filling for TrueType characters.

TrueType characters are created with an outline only. This is the default setting. An outline is
the exterior border around each character of your TrueType object.

•    To edit the parameters of the TrueType object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.


ME-NAVIS2-OP-5                                                                                                     129

---

## หน้า 130

11 TrueType object


•   Select “Character fill” to fill the outlines of TrueType characters.


(1)                           (2)

(1)   Without character fill
(2)   With character fill (horizontal)

•   Select “No outline”, to remove the outline. Only the character fill remains.


(1)                             (2)

(1)   With outline
(2)   Without outline

•   For “Filling line marking direction” select one of these options:
   “Left to right”, “Right to left”, “Right-left alternatively”, “Top to bottom”, “Bottom to top”,
   “Up-down alternatively”.
   With these settings, you define the direction in which the filling lines are drawn during the
   marking process. The alternate direction setting reduces the marking time compared to
   the one direction setting.

•   Specify the distance between the filling lines under “Filling line spacing [mm]”.

•   For “Empty margin [mm]”, input the distance between the outline and the filling. With
   negative values, the filling lines run over the outline.

(1)


(1)


(1)   Empty margin


130                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 131

12.1 Add graphic files using the “Graphic” tool


12     Graphic object


12.1   Add graphic files using the “Graphic” tool

You can add graphic files (VEC, DXF, BMP, JPEG, HPGL) to use them in your marking file.
In the “Marking settings” screen, use the “Graphic” tool in the ribbon to add a graphic file.

•    To add a graphic in the “Marking settings” screen, an online connection between your PC
   and the laser marking system is not required.

•    You can also add a graphic file to a backup file. To add a graphic to a backup file, open
   the backup file and add the graphic file in the “Marking settings” screen.

•    For JPEG files, the extensions .jpg, .jpeg, .jpe, and .jfif are supported. For HPGL files, the
   extensions .pgl, .hgl, and .plt are supported.

                 1.    Go to the “Marking settings” screen.
                 2.    Select “Graphic” > “Graphic files”.

                 3.    In the dialog, select “Add”.

                 4.    Choose a graphic file from your local or network drive and select “Open”.
                       •   VEC files are directly added to the graphic files list.

                       •   For DXF, BMP, JPEG, or HPGL file types, the “Edit graphic” dialog opens. In the
                           dialog, do any of the following:
                            ‒ DXF: To specify individual graphic settings in each marking file, set “OFF
                              (recommended)” for “Graphic presets”.
                               If you want to use a DXF file with fixed graphic settings in multiple marking files,
                               set “ON” for “Graphic presets” and specify settings for size and filling.
                            ‒ BMP, JPEG, HPGL: Make settings for position, rotation and scaling. You can
                              also specify the parameters of the graphic later, once it is placed into the
                              marking file.

                            ‒ To convert a DXF, BMP, JPEG, or HPGL graphic into the VEC file type, select
                              “Save in line-editable format (VEC)”.

                            ‒ Select “OK” to close the “Edit graphic” dialog. The graphic file is added to the list.

                 5.    Select the graphic to be inserted into the marking file and confirm with “OK”.
                       The graphic is added and displayed in the marking image editor.


Related topics

General object/object group parameters (page 101)

Add graphic files in the “Data management” screen (page 132)

Use graphic objects in a marking file (page 133)


ME-NAVIS2-OP-5                                                                                                  131

---

## หน้า 132

12 Graphic object


12.2     Add graphic files in the “Data management” screen

You can add graphic files (VEC, DXF, BMP, JPEG, HPGL) to use them in your marking file.
Go to the “Data management” screen to add a graphic file.

•    An online connection between your PC and the laser marking system is required to add a
   graphic in the “Data management” screen.

•    You can also add a graphic to a backup file. To add a graphic to a backup file, open the
   backup file and add the graphic file in the “Data management” screen.

•    For JPEG files, the extensions .jpg, .jpeg, .jpe, and .jfif are supported. For HPGL files, the
   extensions .pgl, .hgl, and .plt are supported.

                    1.    Establish an online connection between your PC and the laser marking system.

                    2.    Select the “Data management” screen.

                    3.    Select the “Graphic files” tab.

                    4.    In the ribbon, select “Add”.

                    5.    Choose a graphic file from your local or network drive and select “Open”.
                          •   VEC files are directly added to the graphic files list.

                          •   For DXF, BMP, JPEG, or HPGL file types, the “Edit graphic” dialog opens. In the
                              dialog, do any of the following:
                               ‒ DXF: To specify individual graphic settings in each marking file, set “OFF
                                 (recommended)” for “Graphic presets”.
                                  If you want to use a DXF file with fixed graphic settings in multiple marking files,
                                  set “ON” for “Graphic presets” and specify settings for size and filling.

                               ‒ BMP, JPEG, HPGL: Make settings for position, rotation and scaling. You can
                                 also specify the parameters of the graphic later, once it is placed into the
                                 marking file.

                               ‒ To convert a DXF, BMP, JPEG, or HPGL graphic into the VEC file type, select
                                 “Save in line-editable format (VEC)”.

                               ‒ Select “OK” to close the “Edit graphic” dialog.
                                  The graphic file is added to the list. It is saved on the laser marking system.


Related topics

General object/object group parameters (page 101)

Add graphic files using the “Graphic” tool (page 131)

Use graphic objects in a marking file (page 133)


132                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 133

12.3 Use graphic objects in a marking file


12.3   Use graphic objects in a marking file

To mark a graphic, insert it into a marking file.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Marking settings” screen.

                 3.   Select the “Graphic” tool in the ribbon.

                 4.   Select “Graphic files”.
                      The graphic files saved in the laser marking system are listed.

                 5.   Select the graphic to be inserted into the marking file and confirm with “OK”.
                      The graphic is added and displayed in the marking image editor.


Related topics

Add graphic files using the “Graphic” tool (page 131)

Add graphic files in the “Data management” screen (page 132)


12.4   Move a graphic object

To move your graphic object to a new position, specify the position of your object relative
to the reference point. Alternatively, you can move the graphic object in the marking image
editor by dragging it to a new location.

For VEC files, the reference point is the center of the image editor in the Logo Data Editing
software. For DXF, HPGL, JPEG or BMP files, the reference point is the position set for
“Origin” in the graphic presets or graphic object settings.

The reference point is the origin of the X- and Y-position.

LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the position values
specified in the object settings define the coordinates on a 3D model (local position).

                 1.   To edit the parameters of the graphic object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Enter values for “X-position [mm]” and “Y-position [mm]” to move the graphic to a new
                      location in the marking image editor.
                      Alternatively, select the graphic in the marking image editor and drag it to a new
                      location.


Related topics

Move, modify or align objects (page 93)


ME-NAVIS2-OP-5                                                                                                  133

---

## หน้า 134

12 Graphic object


12.5     Rotate a graphic object

To rotate a graphic object, specify a rotation angle or use the circular arrow symbol in the
marking image editor.

The rotation center is the reference point of the graphic.

For VEC files, the reference point is the center of the image editor in the Logo Data Editing
software.

DXF, HPGL, JPEG or BMP files: If “Center” is set for “Origin” (reference point position),
the values under “X-position [mm]” and “Y-position [mm]” remain the same while rotating a
graphic. When another option is set for “Origin”, the values under “X-position [mm]” and “Y-
position [mm]” change while rotating the graphic.

                    1.   To edit the parameters of the graphic object, select the object in the object list or in the
                         marking image editor.
                         The parameters are displayed in the category below the object list.

                    2.   Enter a value for “Rotation angle [°]” to rotate the graphic object by a specific angle.
                         Enter a positive value for counterclockwise rotation and a negative value for clockwise
                         rotation.
                         Alternatively, rotate a graphic with the circular arrow symbol . Select the graphic
                         object in the marking image editor. Position the pointer over the symbol. Click and drag
                         in a circular motion.


Related topics

Move a graphic object (page 133)

Move, modify or align objects (page 93)


12.6     Edit a VEC file

After inserting a VEC file into the marking file, you can fine-tune its size and position and set
laser correction parameters in the “Marking settings” screen. To edit your VEC file with the
Logo Data Editing software, you can launch the software directly from Laser Marker NAVI
smart.

If you modify a VEC file, the changes apply to all marking files in which the graphic is used.

                    1.   There are two different ways to open the Logo Data Editing software.
                         In the “Marking settings” screen:
                         •   Double-click on the graphic object in the marking image editor. The “Graphic” dialog
                             opens.
                             Alternatively, select the graphic object in the object list or in the marking image editor.
                             Select the “Change” button next to “Graphic file” to open the “Graphic” dialog.


134                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 135

12.7 Scale a VEC file


•   In the dialog, select “Edit”.

In the “Data management” screen:
•   Select the “Graphic files” tab.
•   Select the VEC file that you want to edit.

•   In the ribbon, select “Edit graphic file”.

                 2.    The Logo Data Editing software starts up. With this software you can create and edit
                       VEC files.
                       For details about the operation of the software, refer to the “Logo Data Editing Operation
                       Manual”.


Related topics

Add graphic files using the “Graphic” tool (page 131)

Add graphic files in the “Data management” screen (page 132)

Use graphic objects in a marking file (page 133)

Move a graphic object (page 133)

Rotate a graphic object (page 134)

Scale a VEC file (page 135)

Set laser correction parameters for a marking object (page 283)


12.7   Scale a VEC file

Scale a VEC file to enlarge or reduce it by a specific percentage or use the circle symbols
located around the graphic file in the marking image editor.

•    To edit the parameters of the graphic object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

•    You can scale the height and width separately. Input a percentage for “X-scaling [%]” or
   “Y-scaling [%]”, or both.

•    To scale the graphic with the circle symbols , select the graphic object in the marking
   image editor. Position the pointer over one of the circle symbols around the graphic
   object. Click and drag until the object is the desired size.


Related topics

Edit a VEC file (page 134)

Move, modify or align objects (page 93)


ME-NAVIS2-OP-5                                                                                                   135

---

## หน้า 136

12 Graphic object


12.8     Edit a DXF file in the “Marking settings” screen

After inserting the DXF file into the marking file, you can fine-tune its size and set marking
parameters without changing the graphic presets.

                    1.   To edit the parameters of the graphic object, select the object in the object list or in the
                         marking image editor.
                         The parameters are displayed in the category below the object list.

                    2.   For “Adjustment of size and filling” select “ON”.
                         “Adjustment of size and filling” is automatically set to “ON” if you use the Graphic object
                         settings (DXF) (CDD) command.
                         If you select “OFF”, the graphic presets are used for the size and filling settings. In this
                         case, make sure that “ON” is set for “Graphic presets” in the “Edit graphic” dialog.

                    3.   Specify any of the following parameters:
                         •   For “Size specification”, select a method to resize the graphic. Select one of these
                             options:
                              ‒ “Height/width”: The height and width are scaled separately. The proportions of
                                the graphic are not maintained.

                              ‒ “Width (aspect ratio fixed)”: Specify the width of your graphic. The graphic is
                                resized proportionally.

                              ‒ “Height (aspect ratio fixed)”: Specify the height of your graphic. The graphic is
                                resized proportionally.

                              ‒ “As original size”: The original height and width of the graphic is maintained.

                         •   Depending on your selection for “Size specification”, you can specify a value for
                             either “Width [mm]” or “Height [mm]”, or for both.

                         •   Under “Origin”, specify the position of the reference point. The reference point
                             defines the point where each coordinate in the system is zero. Select one of these
                             options: “Center”, “Bottom left”, “Bottom right”, “Top left”, “Top right”, “As original
                             graphic”.

                         •   If SOLID or HATCH functions were used to create the filling lines in the DXF file, you
                             can make settings for the filling lines. Specify any of the following parameters:
                              ‒ “Filling line”: Select “Straight line (alternate)” or “Straight line (one direction)”.

                              ‒ “Filling angle [°]”: Specify a value for the filling line angle.

                              ‒ “Filling line spacing [mm]”: Specify the distance between the filling lines.


                                           (1)                                (2)

                                 (1)   Filling line spacing value: 0.2mm
                                 (2)   Filling line spacing value: 0.7mm


136                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 137

12.9 Change the preset position of a DXF, HPGL, JPEG, BMP file


•   “Layer to mark”: Displays all layers of the graphic file. If you deselect a layer, it will
   not be included in the marking process of the graphic.

•   “Font in the graphic”: Select a font from the list box. Text in a graphic file is replaced
   with a font stored in the laser marking system.


Related topics

Add graphic files using the “Graphic” tool (page 131)

Add graphic files in the “Data management” screen (page 132)

Use graphic objects in a marking file (page 133)

Move a graphic object (page 133)

Rotate a graphic object (page 134)

Change the preset position of a DXF, HPGL, JPEG, BMP file (page 137)

Change the preset size of a DXF, HPGL, JPEG, BMP file (page 138)

Change the preset marking parameters for DXF or HPGL files (page 140)


12.9   Change the preset position of a DXF, HPGL, JPEG, BMP file

For DXF, HPGL, JPEG and BMP files, you can specify presets for the position of the graphic
such as the reference point position or the graphic's position and angle relative to this
reference point.

If you change the presets of a graphic file, the changes apply to all marking files in which the
graphic is used.

To change the presets of a DXF file, set “Graphic presets” > “ON” in the “Edit graphic” dialog.

For DXF files, you can specify individual position settings for each marking file in the
“Marking settings” screen. To do this, set “Adjustment of size and filling” > “ON” in the
“Marking settings” screen.

                 1.   To change the preset position and angle of the graphic object, select the object in the
                      object list or in the marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Select the “Change” button next to “Graphic file” to open the “Graphic” dialog.

                 3.   Select the graphic file and select “Edit”.
                      The “Edit graphic” dialog opens.

                 4.   To change the presets of a DXF file, select “ON” for “Graphic presets”.

                 5.   In the dialog, configure any of the following settings:
                      •   Under “Origin”, specify the position of the reference point. The reference point
                          defines the point where each coordinate in the system is zero. Select one of these


ME-NAVIS2-OP-5                                                                                                     137

---

## หน้า 138

12 Graphic object


options: “Center”, “Bottom left”, “Bottom right”, “Top left”, “Top right”, “As original
graphic”.

•   To offset the reference point, enter values for “X-offset of origin [mm]” and “Y-offset of
   origin [mm]”.
•   If required, enter a value for “Rotation offset of origin [°]” to offset the rotation. Enter
   a positive value for counterclockwise rotation and a negative value for clockwise
   rotation.

•   To display the original graphic, select “Show original graphic”. Select the button again
   to show the edited graphic.

                    6.   Select “OK” to save your settings and close the “Edit graphic” dialog.
                         A confirmation dialog appears.

                    7.   Select “Yes” to save your graphic settings.
                         To save the graphic file as a new one, select “No”, enter a file name and select “OK”.

                    8.   Select “OK” to close the “Graphic” dialog.


Related topics

Move a graphic object (page 133)

Rotate a graphic object (page 134)

Edit a DXF file in the “Marking settings” screen (page 136)


12.10 Change the preset size of a DXF, HPGL, JPEG, BMP file

For DXF, HPGL, JPEG or BMP files, you can specify presets for the size of the graphic such
as the width or height (or both) by which the graphic is enlarged or reduced.

If you change the presets of a graphic file, the changes apply to all marking files in which the
graphic is used.

To change the presets of a DXF file, set “Graphic presets” > “ON” in the “Edit graphic” dialog.

For a DXF file, you can specify individual size settings for each marking file in the “Marking
settings” screen. To do this, set “Adjustment of size and filling” > “ON” in the “Marking
settings” screen.

                    1.   To edit the parameters of the graphic object, select the object in the object list or in the
                         marking image editor.
                         The parameters are displayed in the category below the object list.

                    2.   Select the “Change” button next to “Graphic file” to open the “Graphic” dialog.

                    3.   Select the graphic file and select “Edit”.
                         The “Edit graphic” dialog opens.

                    4.   To change the presets of a DXF file, select “ON” for “Graphic presets”.


138                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 139

12.11 Change the preset marking parameters for JPEG or BMP files


                 5.   For “Size specification”, select a method to resize the graphic. Select one of these
                      options:
                      •   “Height/width”: The height and width are scaled separately. The proportions of the
                          graphic are not maintained.
                      •   “Width (aspect ratio fixed)”: Specify the width of your graphic. The graphic is resized
                          proportionally.

                      •   “Height (aspect ratio fixed)”: Specify the height of your graphic. The graphic is
                          resized proportionally.

                      •   “As original size”: The original height and width of the graphic is maintained.

                 6.   Depending on your selection for “Size specification”, you can specify a value for either
                      “Width [mm]” or “Height [mm]”, or for both.

                 7.   Select “OK” to save your settings and close the “Edit graphic” dialog.
                      A confirmation dialog appears.

                 8.   Select “Yes” to save your graphic settings.
                      To save the graphic file as a new one, select “No”, enter a file name and select “OK”.
                 9.   Select “OK” to close the “Graphic” dialog.


Related topics

Scale a VEC file (page 135)

Move, modify or align objects (page 93)


12.11 Change the preset marking parameters for JPEG or BMP files

You can specify marking parameters for JPEG or BMP files, for example the image rendering
method or marking direction.

These settings are saved as presets for the graphic file. If you change the presets of a
graphic file, the changes apply to all marking files in which the graphic is used.

                 1.   To edit the parameters of the graphic object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Select the “Change” button next to “Graphic file” to open the “Graphic” dialog.

                 3.   Select the graphic file and select “Edit”.
                      The “Edit graphic” dialog opens.

                 4.   Specify any of the following parameters:
                      “Image rendering”: Choose a rendering method from the list box. Select one of these
                      options:
                      •   “Illustration/logo (fill)”: Creates a filling for dark areas of a graphic.

                      •   “Illustration/logo (outline)”: Draws the outline of a graphic.

                      •   “Photo (dither)”: Adjusts a graphic by using the dither method.


ME-NAVIS2-OP-5                                                                                                  139

---

## หน้า 140

12 Graphic object


•   “Photo (error diffusion)”: Adjusts a graphic by using an error-diffusion process.

Depending on your selection for “Image rendering”, the following options become
available:
•   “Black/white reversal”: Select this check box to invert the colors of a graphic (white
   becomes black, and black becomes white).

•   “Line smoothing”: Select this check box to create a smooth outline.

•   “Marking direction”: Select “Horizontal” or “Vertical”.
   With these settings, you define the direction in which the filling lines are drawn during
   the marking process.

•   “Filling line spacing [mm]”: Specify the distance between the filling lines.

•   “Resolution [dpi]”: Use the resolution setting, if the option “As original size” for “Size
   specification” is selected.
   It is recommended to set the same value as the resolution value of the original
   graphic.

•   “Threshold”: Specify a certain segmentation level to create a high-contrast black-and-
   white image.
   If you enter a higher value here, the image becomes darker.

•   To display the original graphic, select “Show original graphic”. Select the button again
   to show the edited graphic.

                    5.   Select “OK” to save your settings and close the “Edit graphic” dialog.
                         A confirmation dialog appears.

                    6.   Select “Yes” to save your graphic settings. To save the graphic file as a new one, select
                         “No”, enter a file name and select “OK”.

                    7.   Select “OK” to close the “Graphic” dialog.


Related topics

Change the preset marking parameters for DXF or HPGL files (page 140)

Set laser correction parameters for a marking object (page 283)


12.12 Change the preset marking parameters for DXF or HPGL files

You can specify further marking parameters for DXF or HPGL files. For HPGL files, you can
only set the marking start position. For DXF files, all parameters are available.

These settings are saved as presets for the graphic file. If you change the presets of a
graphic file, the changes apply to all marking files in which the graphic is used.

For DXF files, you can specify individual marking parameters for each marking file in the
“Marking settings” screen. To do this, set “Adjustment of size and filling” > “ON” in the
“Marking settings” screen.


140                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 141

12.12 Change the preset marking parameters for DXF or HPGL files


                 1.   To edit the parameters of the graphic object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Select the “Change” button next to “Graphic file” to open the “Graphic” dialog.
                 3.   Select the graphic file and select “Edit”.
                      The “Edit graphic” dialog opens.

                 4.   To change the presets of a DXF file, select “ON” for “Graphic presets”.

                 5.   Specify any of the following parameters:
                      •   “Marking start position”: Specify the start position for the marking process of the
                          graphic file. Select one of these options:
                           ‒ “Original graphic drawing order”

                           ‒ “Graphic origin”

                           ‒ “Right of graphic”

                           ‒ “Left of graphic”
                           ‒ “Top of graphic”

                           ‒ “Bottom of graphic”

                      •   “Marking direction”: Select “Horizontal” or “Vertical”.
                          With these settings, you define the direction in which the filling lines are drawn during
                          the marking process.

                      •   “Filling line spacing [mm]”: Specify the distance between the filling lines.


                                    (1)                               (2)

                          (1)   Filling line spacing value: 0.2mm
                          (2)   Filling line spacing value: 0.7mm

                      •   “Layer to mark”: Displays all layers of the graphic file. If you deselect a layer, it will
                          not be included in the marking process of the graphic.

                      •   “Font in the graphic”: Select a font from the list box. Text in a graphic file is replaced
                          with a font stored in the laser marking system.

                      •   To display the original graphic, select “Show original graphic”. Select the button again
                          to show the edited graphic.

                 6.   Select “OK” to save your settings and close the “Edit graphic” dialog.
                      A confirmation dialog appears.

                 7.   Select “Yes” to save your graphic settings.
                      To save the graphic file as a new one, select “No”, enter a file name and select “OK”.

                 8.   Select “OK” to close the “Graphic” dialog.


ME-NAVIS2-OP-5                                                                                                     141

---

## หน้า 142

12 Graphic object


Related topics

Change the preset marking parameters for JPEG or BMP files (page 139)

Set laser correction parameters for a marking object (page 283)


12.13 Tips for improving the marking quality of a graphic

To improve the marking quality, you can fine-tune some parameters in Laser Marker NAVI
smart and optimize the original graphic file.

Try either of the following to improve the marking quality of your graphic:

•   Change the value for “Filling line spacing [mm]”.

•   Change the start position for the marking process under “Marking start position”.

•   For “Marking direction”, change the direction of the stroke in which the filling lines are
   drawn.

•   Reduce the lines or points in your original graphic file (VEC, DXF, BMP, JPEG, HPGL).

•   For VEC files, use the Logo Data Editing software to change the style of the filling lines.
   With the optimize tool in the Logo Data Editing software, you can remove redundant
   points and optimize the marking order.
   For details about the operation of the software, refer to the “Logo Data Editing Operation
   Manual”.

•   If your DXF file contains several lines that create one stroke, use AutoCAD or another
   drawing software to redraw the graphic using a polyline to connect the points.

•   If the filling lines in the DXF file are not created properly, deselect the check box “Check
   DXF hatch path” in “System settings” > “Operation/information” > “Advanced system
   settings”.


Related topics

Change the preset marking parameters for JPEG or BMP files (page 139)

Change the preset marking parameters for DXF or HPGL files (page 140)

Configure advanced system settings (page 310)


12.14 Tips for reducing the marking time of a graphic

To reduce the marking time, you can fine-tune some parameters in Laser Marker NAVI smart
and optimize the original graphic file.

Try either of the following to reduce the marking time of your graphic:

•   Specify a larger value for “Filling line spacing [mm]”.


142                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 143

12.15 Supported DXF file formats


•   Change the start position for the marking process under “Marking start position”.

•   Under “Marking direction”, change the direction of the stroke in which the filling lines are
   drawn.

•   Under “System settings” > “Operation/information” > “Advanced system settings”, select
   “Enable graphic cache”.
   This setting reduces the marking time of files containing graphic objects.

•   Reduce the lines or points in your original graphic file (VEC, DXF, BMP, JPEG, HPGL).

•   For VEC files, use the Logo Data Editing software to change the style of the filling lines.
   With the optimize tool in the Logo Data Editing software, you can remove redundant
   points and optimize the marking order.
   For details about the operation of the software, refer to the “Logo Data Editing Operation
   Manual”.

•   If your DXF file contains several lines that create one stroke, use AutoCAD or another
   drawing software to redraw the graphic using a polyline to connect the points.

•   If you use a DXF file and “Adjustment of size and filling” is set to “ON” in the object
   settings, do the following:
   ‒ Go to “Data management” > “Graphic files”.

‒ Select the DXF file in the list and select “Edit graphic file”.

‒ Set “OFF (recommended)” for “Graphic presets”.
   It may decrease the preparation time (time for READY ON status) when changing the
   marking file.


Related topics

Change the preset marking parameters for JPEG or BMP files (page 139)

Change the preset marking parameters for DXF or HPGL files (page 140)

Configure advanced system settings (page 310)


12.15 Supported DXF file formats

You can add a DXF file to use it in your marking files.

The following DXF file formats are supported:

•   If you set “Adjustment of size and filling” to “ON” in the object settings, R12J, R13J, R14,
   2000, 2004, 2007, 2010, 2013, 2018 are available.

•   If you set “Adjustment of size and filling” to “OFF” in the object settings, R12J, R13J, R14
   are available.

•   The maximum DXF file size is 3MB.

If your DXF file contains Latin-1 or Simplified Chinese characters, set “Adjustment of size
and filling” to “ON” in the object settings.


ME-NAVIS2-OP-5                                                                                                 143

---

## หน้า 144

12 Graphic object


To mark AutoCAD LT drawing files with the laser marking system, first convert them into
DXF files. A file with the extension .dxf is a file format developed by Autodesk to interchange
drawing data with other applications. Refer to the AutoCAD LT online help for detailed
information on how to convert an AutoCAD LT drawing file into a DXF file.


Graphic elements applied in AutoCAD LT and corresponding marking objects

•   Depending on the drawing procedures and methods of the DXF data, minor conversion
   errors can occur. As a result, some graphics marked by the laser marking system might
   differ from the original graphics.

•   If you reduce the graphic size, so that it is smaller than the original size, the difference
   between the original graphic data and the marked data will increase. In particular for
   curved lines, the differences will be more clearly visible.

•   If graphic data that contains filling lines cannot properly be converted into marking data,
   save the DXF file in a different file format.

•   Unsupported elements in a DXF file cannot be marked.

The following tables show which elements are available for the marking process.
✓ valid (marking is possible)

DXF versions R12J, R13J, R14

Element                     Graphic name              Validity    Remark

3DFACE                      3D face                      –

3DLINE                      3D line                      –

ARC                         Arc                          ✓

ATTDEF                      Attribute definition         –

ATTRIB                      Attribute                    –

CIRCLE                      Circle                       ✓

DIMENSION                   Dimension                    –

INSERT                      Insert graphic               ✓

LINE                        Line                         ✓

POINT                       Point                        –

POLYLINE                    2D polyline                  ✓        Bold line is not supported.

3D polyline                  –

SEQEND                      Sequence end                 ✓        SEQEND in combination with
   POLYLINE is available.

SHAPE                       Shape                        –


144                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 145

12.15 Supported DXF file formats


DXF versions R12J, R13J, R14

Element             Graphic name               Validity    Remark

SOLID               2D paint                      ✓        The SOLID element is converted
   into outline and filling lines. The
   filling lines are arranged either
   horizontally or vertically.
   If you set “Adjustment of size
   and filling” to “ON” in the object
   settings, you can change the filling
   lines later.

TEXT                Character                     ✓        The font of the TEXT element is
   replaced with the laser marker
   font. In the marking data, the
   TEXT element is disassembled
   and converted into lines.
   You cannot treat it as a character
   object.

TRACE               Bold line                     –

VERTEX              Vertex                        ✓        VERTEX in combination with
   POLYLINE is available.

VIEWPORT            View port                     –


DXF version R13J, R14

Element             Graphic name               Validity    Remark

3DSOLID             3D paint                      –

ACAD_PROXY_ENTITY   Proxy graphic                 –

BODY                Body                          –

ELLIPSE             Ellipse                       ✓

IMAGE               Image                         –

LEADER              Lead line                     –

LWPOLYLINE          Lightweight polyline          ✓        Bold line is not supported.

MLINE               Multi-line                    –

MTEXT               Multi-text                    ✓        The font of the MTEXT element
   is replaced with the laser marker
   font. In the marking data, the
   MTEXT element is disassembled
   and converted into lines.
   You cannot treat it as a character
   object.

OLEFRAME            OLE frame                     –

OLE2FRAME           OLE2 frame                    –

RAY                 Radiation (half line)         ✓


ME-NAVIS2-OP-5                                                                                               145

---

## หน้า 146

12 Graphic object


DXF version R13J, R14

Element          Graphic name              Validity   Remark

REGION           Region                       –

SPLINE           Free curve                   ✓

TOLERANCE        Geometric tolerance          –

XLINE            Line (straight line)         ✓


DXF version R14

Element          Graphic name              Validity   Remark

HATCH            Hatching                             The HATCH element is converted
   into outline and filling lines. The
   filling lines are arranged either
   horizontally or vertically.
   ✓
   If you set “Adjustment of size
   and filling” to “ON” in the object
   settings, you can change the filling
   lines later.

ARCALIGNEDTEXT   Character string on arc      –

RTEXT            Reference character          –
   string

WIPEOUT          Masking graphic              –


146                                                                                       ME-NAVIS2-OP-5

---

## หน้า 147

13.1 Create a line


13     Shape object


13.1   Create a line

You can create different shapes such as a line, circle or an arc.

                 1.   Select the “Graphic” tool in the ribbon.

                 2.   Select “Shapes”.
                      The setting dialog appears.

                 3.   Select “Line” for “Shape type” to create a straight line.

                 4.   To specify the position of the start and end point of the line, enter values for “X-position
                      of start point [mm] ”, “Y-position of start point [mm]”, “X-position of end point [mm] ” and
                      “Y-position of end point [mm] ”.
                      You cannot set the same position for the start and end point.

                                                   (2)
                                                   (X, Y)


                      (1)
                      (X, Y)


                      (1)     Start point (“X-position of start point [mm] ”, “Y-position of start point [mm]”)
                      (2)     End point (“X-position of end point [mm] ”, “Y-position of end point [mm] ”)

                 5.   Select “Dash line” to apply dash settings to the line.
                      Specify values for “Dash length [mm] ” and “Gap length [mm] ”.


                        (1)                                 (2)

                      (1)     “Dash length [mm] ”
                      (2)     “Gap length [mm] ”

                 6.   Select “OK”.
                      The shape object is displayed in the marking image editor and is highlighted in the
                      object list.

                 7.   To edit the parameters of the shape object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.


ME-NAVIS2-OP-5                                                                                                             147

---

## หน้า 148

13 Shape object


Related topics

Create a circle (page 148)

Create an arc (page 149)

Add or delete shapes in an existing shape object (page 151)

Position or rotate a shape object (page 151)

General object/object group parameters (page 101)

Set laser correction parameters for a marking object (page 283)


13.2    Create a circle

You can create different shapes such as a line, circle or an arc.

                  1.   Select the “Graphic” tool in the ribbon.
                  2.   Select “Shapes”.
                       The setting dialog appears.

                  3.   Select “Circle” for “Shape type”.

                  4.   To specify the position of the circle, enter values for “X-position of center [mm] ” and “Y-
                       position of center [mm] ”.

                  5.   Specify the radius of the circle under “Radius [mm]”.


                                         (2)

                                    (1)
                                    (X, Y)


                       (1)     Center of the circle (“X-position of center [mm] ”, “Y-position of center [mm] ”)
                       (2)     “Radius [mm]”

                       The marking of a circle begins at 0 degree on the circle's right side. The circle is marked
                       in a counterclockwise direction.

                  6.   Select “Dash line” to apply dash settings to the circle's stroke.
                       Specify values for “Dash length [mm] ” and “Gap length [mm] ”.


                         (1)                               (2)

                       (1)     “Dash length [mm] ”
                       (2)     “Gap length [mm] ”

                  7.   Select “OK”.
                       The shape object is displayed in the marking image editor and is highlighted in the
                       object list.


148                                                                                                         ME-NAVIS2-OP-5

---

## หน้า 149

13.3 Create an arc


                 8.   To edit the parameters of the shape object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.


Related topics

Create a line (page 147)

Create an arc (page 149)

Add or delete shapes in an existing shape object (page 151)

Position or rotate a shape object (page 151)

General object/object group parameters (page 101)

Set laser correction parameters for a marking object (page 283)


13.3   Create an arc

You can create different shapes such as a line, circle or an arc.

                 1.     Select the “Graphic” tool in the ribbon.

                 2.     Select “Shapes”.
                        The setting dialog appears.

                 3.     Select “Arc” for “Shape type”.

                 4.     To specify the position of the start and end point of the arc, enter values for “X-position
                        of start point [mm] ”, “Y-position of start point [mm]”, “X-position of end point [mm] ”
                        and “Y-position of end point [mm] ”.
                        You cannot set the same position for the start and end point.
                 5.     Specify the radius of the arc under “Radius [mm]”.

                 6.     For “Direction”, set the marking direction of the arc. Select “CCW” (counterclockwise)
                        or “CW” (clockwise).

                 7.     For “Angle”, set the angle of the arc. Select “<180°” or “≥180°”.

The following drawings show how to set the parameters for an arc to achieve different
results.


ME-NAVIS2-OP-5                                                                                                 149

---

## หน้า 150

13 Shape object


   (5)         (1)             (5)                         (2)
   (X, Y)                                      (X, Y)
   (7)
(6)                                                      (3)
   (4)

(3)                                                              (3)

   (3)         (6)
   (7)
(2)                                                 (1)
(X, Y)                                              (X, Y)
   (4)

(1)   Start point (“X-position of start point [mm] ”, “Y-position of start point [mm]”)
(2)   End point (“X-position of end point [mm] ”, “Y-position of end point [mm] ”)
(3)   “Radius [mm]”
(4)   “Direction” > “CCW”
(5)   “Direction” > “CW”
(6)   “Angle” > “<180°”
(7)   “Angle” > “≥180°”

                  8.      Select “Dash line” to apply dash settings to the arc's stroke.
                          Specify values for “Dash length [mm] ” and “Gap length [mm] ”.


                            (1)                                 (2)

                          (1)     “Dash length [mm] ”
                          (2)     “Gap length [mm] ”

                  9.      Select “OK”.
                          The shape object is displayed in the marking image editor and is highlighted in the
                          object list.

                  10.     To edit the parameters of the shape object, select the object in the object list or in the
                          marking image editor.
                          The parameters are displayed in the category below the object list.


Related topics

Create a line (page 147)

Create a circle (page 148)

Add or delete shapes in an existing shape object (page 151)

Position or rotate a shape object (page 151)

General object/object group parameters (page 101)

Set laser correction parameters for a marking object (page 283)


150                                                                                                         ME-NAVIS2-OP-5

---

## หน้า 151

13.4 Add or delete shapes in an existing shape object


13.4   Add or delete shapes in an existing shape object

You can set several lines, circles or arcs in one shape object. A maximum of 32 shapes can
be set for one shape object.

If a shape object consists of two or more shapes, you can correct the position and laser
settings for all shapes at once.

                 1.    To add or delete shapes (line, circle or arc) in the existing shape object, select the object
                       in the object list or in the marking image editor.
                       The parameters are displayed in the category below the object list.
                       In the lower part of the “Object settings” tab, a numbered list is displayed. Each row
                       represents one shape of the shape object.

                 2.    To add, duplicate or delete a shape, do any of the following:
                       •   To add a new shape, select an empty row from the list and select “Edit” to open the
                           dialog. Alternatively, double-click on the row to open the dialog. Specify the desired
                           parameters and select “OK”.

                       •   To duplicate a shape, select the row from the list and select “Copy”. Choose the
                           target row in the list and select “Paste”.

                       •   To delete a shape, select the row from the list and select “Delete”.


Related topics

Position or rotate a shape object (page 151)

Set laser correction parameters for a marking object (page 283)


13.5   Position or rotate a shape object

Set the coordinates to change the position of a shape object. Specify a rotation angle to
rotate a shape object.

The position and rotation settings are applied to all shapes set in the selected shape object.

LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the position values
specified in the object settings define the coordinates on a 3D model (local position).

•    To edit the parameters of the shape object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

•    Specify values for “X-offset [mm]” and “Y-offset [mm]” to change the position of all shapes
   of a shape object.
   Alternatively, you can move the object in the marking image editor. Click near the frame of
   the shape object and drag it to a new location.
   To move only one shape, click on it and drag it to a new location.


ME-NAVIS2-OP-5                                                                                                     151

---

## หน้า 152

13 Shape object


•   Under “Position, rotation”, enter a value for “Rotation angle [°]” to rotate all shapes of a
   shape object. Enter a positive value for counterclockwise rotation and a negative value for
   clockwise rotation.
   Alternatively, rotate the shape object in the marking image editor with the circular arrow
   symbol . Select the object in the marking image editor. Position the pointer over the
   symbol. Click and drag in a circular motion.
   The rotation center is the center of the marking field.


Related topics

Add or delete shapes in an existing shape object (page 151)


152                                                                                             ME-NAVIS2-OP-5

---

## หน้า 153

14.1 Create a point radiation object


14     Point radiation object


14.1   Create a point radiation object

Use a point radiation object if you want to mark the workpiece at a specified coordinate.


During radiation, the laser power is concentrated onto one point. Use caution when setting
long radiation periods. It may cause fire and damage to the workpiece.


                 1.   Select the “Point radiation” tool in the ribbon.

                 2.   In the dialog, configure any of the following settings:
                      •   “X-position [mm]”, “Y-position [mm]”:
                          Enter values to specify the position of the point.

                      •   “Radiation time”:
                          Set the duration of the laser radiation.

                      •   “Time unit”:
                          Specify your preferred time unit (millisecond, second, minute or hour).

                      •   “Laser power correction [%]”:
                          To correct the laser power of the point, enter a value in the text box.
                          The laser power is set by multiplying the laser power correction ratio set for the point
                          and the laser power value set in “Laser settings”.
                          Marking is not possible if the laser power correction value is 0.

                 3.   Select “OK”.
                      The point radiation object represented by a + symbol is displayed in the marking image
                      editor and is highlighted in the object list.

                 4.   To edit the parameters of the point radiation object, select the object in the object list or
                      in the marking image editor.
                      The parameters are displayed in the category below the object list.


Related topics

General object/object group parameters (page 101)

Edit, add or delete a point in an existing point radiation object (page 154)

Position or rotate a point radiation object (page 155)

Set laser correction parameters for a marking object (page 283)


ME-NAVIS2-OP-5                                                                                                     153

---

## หน้า 154

14 Point radiation object


14.2     Edit, add or delete a point in an existing point radiation object

You can set several points in one point radiation object. A maximum of 50 points can be set
for one point radiation object.

If a point radiation object consists of two or more points, you can correct the position and
laser settings for all points at once. If necessary, you can specify and edit the parameters for
each point individually. In the marking image editor, a point is represented by a + symbol.

•   To edit the parameters of the point radiation object, select the object in the object list or in
   the marking image editor.
   The parameters are displayed in the category below the object list.

•   In the lower part of the “Object settings” tab, a numbered list is displayed. Each row
   represents one point of the point radiation object. If you specify the parameters for one
   point, the setting values are displayed in the row.

Specify parameters for a point:

•   To edit a point, select a row from the list.
   Alternatively, select a point in the marking image editor. The corresponding row is
   highlighted in the list.

•   Select “Edit” to open the dialog. Alternatively, double-click on the row to open the dialog.

•   In the dialog, adjust the following parameters for the point:
   “X-position [mm]”, “Y-position [mm]”, “Radiation time”, “Time unit”, “Laser power
   correction [%]”

•   Select “OK” to save the settings.

Add a new point:

•   Select an empty row.

•   Select “Edit” to open the dialog. Alternatively, double-click on the row to open the dialog.

•   Specify the desired parameters and select “OK”.

Duplicate a point:

•   Select a row from the list.
   Alternatively, select a point in the marking image editor. The corresponding row is
   highlighted in the list.

•   To copy the row, select “Copy”.

•   Choose the target row in the list and select “Paste”.
   The setting values of the point are displayed in the row.

Delete a point:

•   Select a row from the list.
   Alternatively, select a point in the marking image editor. The corresponding row is
   highlighted in the list.

•   To delete the point, select “Delete”.


154                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 155

14.3 Position or rotate a point radiation object


Related topics

Position or rotate a point radiation object (page 155)

Set laser correction parameters for a marking object (page 283)


14.3   Position or rotate a point radiation object

Set the coordinates to change the position of a point radiation object. Specify a rotation
angle to rotate a point radiation object.

The position and rotation settings are applied to all points set in the selected point radiation
object.

LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the position values
specified in the object settings define the coordinates on a 3D model (local position).

•   To edit the parameters of the point radiation object, select the object in the object list or in
   the marking image editor.
   The parameters are displayed in the category below the object list.

•   Specify values for “X-offset [mm]” and “Y-offset [mm]” to change the position of all points
   of a point radiation object.
   Alternatively, you can move the object by dragging it to a new location in the marking
   image editor.

•   Under “Position, rotation”, enter a value for “Rotation angle [°]” to rotate all points of a
   point radiation object. Enter a positive value for counterclockwise rotation and a negative
   value for clockwise rotation.
   The rotation center is the center of the marking field.


Related topics

Edit, add or delete a point in an existing point radiation object (page 154)


ME-NAVIS2-OP-5                                                                                                   155

---

## หน้า 156

15 Bar code object


15       Bar code object


15.1     Bar code types

Choose from different bar code types to encode your text data. Each bar code type can
include a specified character set, a maximum number of characters and other specific
features.


CODE39

CODE39 can contain an optional check digit. The check digit calculation is based on modulo
43.

This bar code supports the following characters:

•   0–9, A–Z, space character, symbols - + / $ % .

Number of characters: Max. 62


ITF

ITF can contain an optional check digit. The check digit calculation is based on modulo 10/
weight 3/1.

The ITF bar code data must contain an even number of digits. A leading zero will be added
to the front of the bar code data, in either of the following situations:

•   The bar code data to be encoded contains an odd number of digits and the check digit is
   not in use.

•   The bar code data to be encoded contains an even number of digits and the check digit is
   in use.

This bar code supports all numeric digits (0–9).

Number of digits: Max. 62


NW-7 (CODABAR)

NW-7 (CODABAR) can contain an optional check digit. The check digit calculation is based
on modulo 16.

This bar code supports the following characters:

•   0–9, symbols - $ : / . +

Number of characters: Max. 62


156                                                                                             ME-NAVIS2-OP-5

---

## หน้า 157

15.1 Bar code types


CODE93

The check digit is appended automatically next to the last character of the code data. The
human readable text does not comprise the check digit.

This bar code supports the following characters:

•   Any single-byte ASCII code from 00h to 7Fh: 0–9, A–Z, a–z, symbols, control characters

Number of characters: Max. 62


EAN/UPC/JAN

EAN/UPC/JAN contains a check digit. The check digit is calculated and appended
automatically next to the last character of the code data.

This bar code supports all numeric digits (0–9).

Number of digits:

•   EAN/JAN-13: 12 digits plus check digit

•   EAN/JAN-8: 7 digits plus check digit

•   UPC-A: 11 digits plus check digit

•   UPC-E: 6 digits plus check digit


CODE128

CODE128 contains the start code A, B or C. It is selected automatically depending on the
character composition of subsequent characters. The check digit is appended automatically
next to the last character of the code data. The human readable text does not comprise the
check digit.

This bar code supports the following characters:

•   Any single-byte ASCII code from 00h to 7Fh: 0–9, A–Z, a–z, symbols, control characters

•   Function 1 Symbol Character (FNC1)

Number of characters: Max. 62


GS1-128

GS1-128 (known also as UCC/EAN-128) consists of the basic CODE128 format with
Application Identifiers (AI) added to the code data. Function 1 Symbol Character (FNC1)
is available at the beginning of the code data to maintain compatibility. If you want to use
GS1-128, select “Bar code” > “CODE128 (GS1-128)” > “GS1-128”.

For GS1-128, when you insert the AI prefix code “01” and a 13 digit number, the check digit
is automatically appended next to the last character of the code data. Modulo 10 /weight 3 is
used to calculate the check digit.

This bar code supports the following characters:


ME-NAVIS2-OP-5                                                                                                  157

---

## หน้า 158

15 Bar code object


•   0–9, A–Z, a–z, space character, control characters, symbols ! " % & ' ( ) * + , - . / : ; < =
   >?_

•   Function 1 Symbol Character (FNC1)

Number of characters: Max. 48


GS1 DataBar

GS1 DataBar Limited created by our laser marking system conforms to the ISO/IEC
24724:2011 standard.

This bar code supports all numeric digits (0–9).

Number of digits:

•   13 digits plus check digit

•   For Expanded, Expanded Stacked: Max. 73 digits (AI(01) plus numeric data without
   check digits)
   In other cases, the maximum number of characters is reduced.

LP-RH, LP-ZV (controller version 3.2 or later): The following options are available: GS1
DataBar Omnidirectional, GS1 DataBar Limited, GS1 DataBar Stacked, GS1 DataBar
Stacked Omnidirectional, GS1 DataBar Expanded, GS1 DataBar Expanded Stacked


Composite codes

Composite codes consist of a 1D (linear) part beneath the 2D part (CC-A, CC-B, CC-C) and
a separator between them.

AI prefix codes can be used in the code data. They define the meaning and the format of the
data that follows.

LP-GS, LP-RC, LP-RF, LP-RV: The following options are available: GS1 DataBar Stacked
CC-A/CC-B, GS1 DataBar Limited CC-A/CC-B (LP-GS, LP-RC, LP-RF, LP-RV support the
CC-A range.)

LP-RH, LP-ZV (controller version 3.2 or later): The following options are available: GS1
DataBar Omnidirectional CC-A/CC-B, GS1 DataBar Limited CC-A/CC-B, GS1 DataBar
Stacked CC-A/CC-B, GS1 DataBar Stacked Omnidirectional CC-A/CC-B, GS1 DataBar
Expanded CC-A/CC-B, GS1 DataBar Expanded Stacked CC-A/CC-B, EAN/UPC/JAN CC-A/
CC-B, GS1-128 CC-A/CC-B, GS1-128 CC-C

The 2D part (CC-A, CC-B, CC-C) supports the following characters:

•   0–9, A–Z, a–z, space character, symbols ! " % & ' ( ) * + , - . / : ; < = > ? _

•   Function 1 Symbol Character (FNC1)

Number of characters for the 2D part:

•   CC-A: Max. 56

•   CC-B, CC-C: Max. 299


158                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 159

15.2 Create a bar code object


Related topics

Create a bar code object (page 159)

Set bar code parameters (page 164)

Set parameters for GS1 DataBar (page 165)

Set parameters for composite codes (page 167)

About Application Identifiers (page 203)

AI prefix codes (page 204)


15.2   Create a bar code object

To create a bar code object, use the “Bar code” tool in the ribbon.

LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), bar code/2D code
objects are not available under the following conditions:

•    The 3D shape “Vertical cone” or “Sphere” is used.

•    The 3D shape “Cylinder” or “Horizontal cone” is used, and in the 3D model settings
   “Projection” is set for “Data mapping”.

                 1.    In the “Marking settings” screen, select “Bar code”.

                 2.    Select one of the following bar code types from the menu: “CODE128 (GS1-128)”,
                       “CODE93”, “CODE39”, “ITF”, “EAN/UPC/JAN”, “NW-7 (CODABAR)”, “GS1 DataBar”.
                       For “GS1 DataBar”, select one of the following bar code types from the submenu:
                       GS1 DataBar Limited, GS1 DataBar Limited CC-A/CC-B, GS1 DataBar Stacked, GS1
                       DataBar Stacked CC-A/CC-B.
                       GS1 DataBar Limited CC-B and GS1 DataBar Stacked CC-B are not available for LP-
                       GS, LP-RC, LP-RF, LP-RV.

                       LP-RH, LP-ZV (controller version 3.2 or later):
                       •   For “CODE128 (GS1-128)”, select one of the following bar code types from the
                           submenu: Code128, GS1-128, GS1-128 CC-A/CC-B, GS1-128 CC-C.

                       •   For “EAN/UPC/JAN”, select one of the following bar code types from the submenu:
                           EAN/UPC/JAN, EAN/UPC/JAN CC-A/CC-B.

                       •   For “GS1 DataBar”, select one of the following bar code types from the submenu:
                           GS1 DataBar Omnidirectional, GS1 DataBar Omnidirectional CC-A/CC-B, GS1
                           DataBar Limited, GS1 DataBar Limited CC-A/CC-B, GS1 DataBar Stacked, GS1
                           DataBar Stacked CC-A/CC-B, GS1 DataBar Stacked Omnidirectional, GS1 DataBar
                           Stacked Omnidirectional CC-A/CC-B, GS1 DataBar Expanded, GS1 DataBar
                           Expanded CC-A/CC-B, GS1 DataBar Expanded Stacked, GS1 DataBar Expanded
                           Stacked CC-A/CC-B.

                       The “Code data” dialog opens.


ME-NAVIS2-OP-5                                                                                             159

---

## หน้า 160

15 Bar code object


                     3.   Input the characters that you want to encode.
                          •   Application Identifiers (AI) can be used for GS1-128, GS1 DataBar Expanded, GS1
                              DataBar Expanded Stacked and for the 2D part of composite codes.

                          •   Composite codes: Input the data for the 1D part in the “Character input (1D)” tab and
                              for the 2D part in the “Character input (2D)” tab.

                          •   To input FNC1 and other control characters, select “Control code”. In the dialog,
                              select the character F1 to insert the Function 1 Symbol Character FNC1 in your code
                              data.

                          •   The input characters may be restricted to either single-byte characters or double-
                              byte characters depending on the code type. In this case, the input characters are
                              automatically converted to the accepted type.

                          •   For EAN/UPC/JAN, GS1 DataBar Omnidirectional, GS1 DataBar Stacked, GS1
                              DataBar Stacked Omnidirectional, and GS1 DataBar Limited, you cannot use line
                              feed.

                          •   For CODE128, GS1-128, CODE93, CODE39, ITF, NW-7 (CODABAR), GS1 DataBar
                              Expanded, and GS1 DataBar Expanded Stacked, you can use line feed. It cannot be
                              applied to the human readable text.

                          •   For the 2D part of composite codes, you can use line feed, and it can be applied to
                              the human readable text.

                          •   For CODE128, GS1-128, CODE93, CODE39, ITF, NW-7 (CODABAR), GS1 DataBar
                              Expanded, GS1 DataBar Expanded Stacked, and for the 2D part of composite
                              codes, you can set the code data on multiple lines. The line feed does not affect the
                              code data and cannot be applied to the human readable text.

                          •   For GS1 DataBar Omnidirectional, GS1 DataBar Stacked, GS1 DataBar Stacked
                              Omnidirectional, GS1 DataBar Limited (including the 1D part of composite codes)
                              enter a 13-digit number. The Application Identifier “01” is added automatically at the
                              beginning of the bar code data. The check digit is appended automatically next to the
                              last digit of the bar code data. “(01)” and the check digit are displayed in the human
                              readable text.

                          •   Depending on the code type, the number of characters is limited.

                     4.   If required, select “Functional characters”. In the dialog, specify functional characters
                          such as date, time, counter, etc.
                          Check the functional characters in “Preview for functional characters”.

                     5.   Select “OK”.
                          The bar code object is displayed in the marking image editor and is highlighted in the
                          object list.

                     6.   To edit the parameters of the bar code object, select the object in the object list or in the
                          marking image editor.
                          The parameters are displayed in the category below the object list.


160                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 161

15.3 Invert a bar code object


Related topics

Bar code types (page 156)

General object/object group parameters (page 101)

Set bar code parameters (page 164)

Set parameters for GS1 DataBar (page 165)

Set parameters for composite codes (page 167)

About Application Identifiers (page 203)

AI prefix codes (page 204)

Set laser correction parameters for a marking object (page 283)

Use functional characters (page 241)


15.3   Invert a bar code object

The “Invert” setting inverts the colors of a bar code (white spaces become black, and black
bars become white).

                 1.   To edit the parameters of the bar code object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   To invert the bar code, select “Invert” under “Module”.
                      When the check box is selected, the spaces between bars are marked. Depending
                      on the bar code type, the quiet zone or the space elements of the left and right guard
                      pattern are also marked.


                      Example of a normal bar code


                      Example of an inverted bar code


ME-NAVIS2-OP-5                                                                                                  161

---

## หน้า 162

15 Bar code object


15.4     Set the marking direction for a bar code object

With these settings, you define the direction in which the filling lines are drawn during the
marking process.

LP-ZV: If “LP-M/S/Z compatible” is set for “Compatible mode” on the “System settings”,
specify the code marking direction under “File settings” > “Compatibility with former
models” > “Code marking direction”.

                     1.   To edit the parameters of the bar code object, select the object in the object list or in the
                          marking image editor.
                          The parameters are displayed in the category below the object list.

                     2.   For “Code marking direction”, select one of these options: “One direction” or “Alternate”.
                          The alternate direction setting reduces the marking time compared to the one direction
                          setting.


                                (1)                           (2)

                          (1)   One direction setting
                          (2)   Alternate direction setting


Related topics

Set bar code parameters (page 164)


15.5     Amend bar code data

In the “Object settings” tab, you can change the characters of a bar code object.

                     1.   To edit the parameters of the bar code object, select the object in the object list or in the
                          marking image editor.
                          The parameters are displayed in the category below the object list.

                     2.   Select “Change” next to the “Code data” or “Code data (2D)” text box. The “Code data
                          (2D)” text box is available for composite codes.
                          If you set the code data on multiple lines, the first 5 rows are displayed in the text box.
                          Alternatively, double-click on the bar code object in the marking image editor.

                     3.   In the dialog, change the characters that you want to encode.
                          To input FNC1 and other control characters, select “Control code”. In the dialog, select
                          the character F1 to insert the Function 1 Symbol Character FNC1 in your code data.


162                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 163

15.6 Specify the position of a bar code object


                 4.   Select “OK”.
                      The dialog closes.


Related topics

Create a bar code object (page 159)


15.6   Specify the position of a bar code object

To position your bar code object, specify the coordinates of the reference point, the object's
center. Alternatively, move the bar code object by dragging it to a new location.

LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the position values
specified in the object settings define the coordinates on a 3D model (local position).

                 1.   To edit the parameters of the bar code object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Under “Position, rotation”, enter values for “X-position [mm]” and “Y-position [mm]” to
                      move the bar code object to a new location in the marking image editor.
                      Alternatively, select the bar code object in the marking image editor and drag it to a new
                      location.


Related topics

Move, modify or align objects (page 93)


15.7   Rotate a bar code object

To rotate a bar code object, specify a rotation angle. Alternatively, use the circular arrow
symbol in the marking image editor.

The rotation center is the center of the bar code object.

                 1.   To edit the parameters of the bar code object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   Under “Position, rotation”, enter a value for “Rotation angle [°]” to rotate a bar code
                      object. Enter a positive value for counterclockwise rotation and a negative value for
                      clockwise rotation.
                      To rotate a bar code object with the circular arrow symbol      , select the object in the
                      marking image editor.
                      Position the pointer over the symbol. Click and drag in a circular motion.


ME-NAVIS2-OP-5                                                                                                     163

---

## หน้า 164

15 Bar code object


Related topics

Move, modify or align objects (page 93)


15.8     Set bar code parameters

Specify the parameters for CODE39, CODE93, ITF, NW-7 (CODABAR), EAN/UPC/JAN,
CODE128 and GS1-128.

•   To edit the parameters of the bar code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Under “Code”, specify any of the following parameters:

•   “Check character” (CODE39, ITF, NW-7 (CODABAR)):
   Select the check box to enable the check digit function. A check digit is a numeric value
   calculated to check for read error. It is placed next to the last character of the bar code
   data.

•   “Start/stop character” (NW-7 (CODABAR)):
   Select a start and stop character. There are four start and stop characters, which are
   represented by the letters A, B, C, and D. The start and stop characters indicate the start
   or end of the bar code data.

•   “Bar code height [mm]”:
   Enter a numeric value to specify the height of a bar code.
   The human readable text is not included in the bar code height.
   EAN/UPC/JAN: Some bars have an extended part which is not included in the bar code
   height.

•   “Narrow element width [mm]”:
   Enter a numeric value to specify the narrow element width.
   Specify a value larger than the line width under “Line width (calculation value) [mm]” in
   the “Object group” settings.

•   “Quiet/narrow ratio”:
   Set the ratio of quiet zone width to narrow element width.
   The quiet zones are the right and left margins of a bar code symbol.

•   “Wide/narrow ratio” (CODE39, ITF, NW-7 (CODABAR)):
   Set the ratio of wide element width to narrow element width.

•   “Total width [mm]”, “Total height [mm]”:
   Displays the entire width and height of the bar code. If two values are shown for “Total
   width [mm]”, the first is the width excluding the quiet zone (margin area), while the value
   enclosed in parentheses indicates the width including the quiet zone.

Filling line spacing:

•   To set the distance between the marking lines, enter a value for “Bar code filling line
   spacing [mm]” in the “Object group” settings.


164                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 165

15.9 Set parameters for GS1 DataBar


Related topics

Bar code types (page 156)

Create a bar code object (page 159)

Invert a bar code object (page 161)

Set the marking direction for a bar code object (page 162)

Specify the position of a bar code object (page 163)

Rotate a bar code object (page 163)

Set laser correction parameters for a marking object (page 283)

Human readable text parameters (page 199)

Set object group parameters (page 209)


15.9   Set parameters for GS1 DataBar

In the “Object settings” tab, you can specify parameters for bar code type GS1 DataBar.

•   To edit the parameters of the bar code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Under “Code”, specify any of the following parameters:

•   “Module width [mm]”:
   To specify the width of the narrowest element of the bar code, enter a numeric value in
   the text box.
   Specify a value larger than the line width under “Line width (calculation value) [mm]” in
   the “Object group” settings.

•   “Segments per row” (Expanded Stacked, Expanded Stacked CC-A/CC-B):
   Specify the number of data segments per row.

•   “Bar code height to module width ratio” (Omnidirectional, Limited, Expanded,
   Omnidirectional CC-A/CC-B, Limited CC-A/CC-B, Expanded CC-A/CC-B):
   Set the ratio of code height to module width.

•   “Lower bar code height to module width ratio” (Stacked, Stacked CC-A/CC-B):
   Set the ratio of lower code height to module width.

•   “Bar code row height to module width ratio” (Stacked Omnidirectional, Expanded
   Stacked, Stacked Omnidirectional CC-A/CC-B, Expanded Stacked CC-A/CC-B):
   Set the ratio of bar code row height to module width for a multirow bar code.

•   “Separator height to module width ratio” (Stacked, Stacked Omnidirectional, Expanded
   Stacked, Stacked CC-A/CC-B, Stacked Omnidirectional CC-A/CC-B, Expanded Stacked
   CC-A/CC-B):
   Set the ratio of separator height to module width. The separator is located between the
   two rows of the bar code.


ME-NAVIS2-OP-5                                                                                                  165

---

## หน้า 166

15 Bar code object


•   “Total width [mm]”, “Total height [mm]”:
   Displays the entire width and height of the bar code, including the guard pattern and quiet
   zone.

Under “Module”, specify any of the following parameters:

•   “Left guard width to module width ratio”/“Right guard width to module width ratio”:
   Set the ratio of left guard or right guard width to module width.
   According to the requirements defined in the ISO/IEC 24724:2011 standard for Limited,
   the ratio of right guard width to module width should be more than 5.0.
   The left and right guard pattern consists of a narrow space and a narrow bar. For bar
   code type GS1 DataBar Limited the right guard pattern consists of a narrow space, a
   narrow bar and a wide space.
   The space elements of the left and right guard pattern blend into the background of the
   bar code if the background is the same color as the spaces in the bar code (e.g. white). If
   you invert the bar code, all spaces in the bar code including the space elements of the left
   and right guard pattern are marked.

Filling line spacing:

•   To set the distance between the marking lines, enter a value for “Bar code filling line
   spacing [mm]” in the “Object group” settings.


Related topics

Bar code types (page 156)

Create a bar code object (page 159)

Invert a bar code object (page 161)

Automatically optimize GS1 DataBar parameters (page 167)

Set parameters for composite codes (page 167)

Set the marking direction for a bar code object (page 162)

Specify the position of a bar code object (page 163)

Rotate a bar code object (page 163)

Human readable text parameters (page 199)

Set laser correction parameters for a marking object (page 283)

Set object group parameters (page 209)


166                                                                                                ME-NAVIS2-OP-5

---

## หน้า 167

15.10 Automatically optimize GS1 DataBar parameters


15.10 Automatically optimize GS1 DataBar parameters

If you select “Optimal setting”, the values of specific parameters will be automatically
adjusted based on the value under “Module width [mm]”.

                 1.    To edit the parameters of the bar code object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    To open the “Optimal setting” dialog, select “Optimal setting”.

                 3.    In the dialog, do any of the following:
                       •   For “Module width [mm]”, you can input a new value.

                       •   Select “Details” to display the list of parameters that will automatically be optimized.
                           To return to the “Optimal setting” dialog, select “OK”.

                 4.    If you want to optimize the parameters, confirm the “Optimal setting” dialog with “OK”.
                       The optimal values for the parameters are determined. A dialog appears that shows a
                       list of parameters that will be optimized.

                 5.    To close the dialog, select “OK”.


Related topics

Set parameters for GS1 DataBar (page 165)


15.11 Set parameters for composite codes

A composite code is a code symbol consisting of a 1D part (bar code GS1 DataBar, EAN/
UPC/JAN, GS1-128) and a 2D part (CC-A, CC-B, CC-C). You can set the 1D and the 2D part
of the composite code.

In the “Object settings” tab, you can specify parameters for composite codes.

•    To edit the parameters of a composite code, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Under “Code”, specify any of the following parameters:

•    “GS1 DataBar type” (GS1 DataBar):
   To specify the composite code, select a code type that includes "CC-A/CC-B" from the
   list.

•    “Composite symbology” (EAN/UPC/JAN, GS1-128):
   To specify the composite code, select “CC-A/CC-B”. “CC-C” is available for GS1-128.


ME-NAVIS2-OP-5                                                                                                     167

---

## หน้า 168

15 Bar code object


•   “Code data”:
   Select “Change” next to the “Code data” text box and input the characters that you want
   to encode.
   For details on the character set and the maximum number of characters for each bar
   code type, refer to Bar code types (page 156).

•   “Code data (2D)”:
   Select “Change” next to the “Code data (2D)” text box and input the characters that you
   want to encode.
   For details on the character set and the maximum number of characters for each bar
   code type, refer to Bar code types (page 156).

Under “Code settings (2D)”, specify any of the following parameters for the 2D part of
composite codes:

•   “Row height to module width ratio”:
   Set the ratio of row height to module width. This parameter specifies the row height of the
   2D part.
•   “Number of columns” (GS1-128, CC-C):
   Set the number of columns of the 2D part. “Auto” sets the minimum allowed value
   depending on the code type.

•   “Minimize number of rows” (GS1-128, CC-C):
   Select this check box to reduce the number of rows.

•   “Number of rows”:
   Set the number of rows of the 2D part. “Auto” sets the minimum allowed value depending
   on the code type.

•   “Error correction level” (GS1-128, CC-C):
   Select one of the nine available error correction levels (0 to 8). Selecting "8" (equivalent
   to error correction level 9) sets the recommended value as specified in the specifications.

•   “Horizontal quiet zone to module width ratio”:
   Set the ratio of quiet zone width to module width. This parameter specifies the quiet zone
   width of the 2D part.

•   “Vertical quiet zone to module width ratio” (GS1-128, CC-C):
   Set the ratio of quiet zone height to module width.

•   “Separator height to module width ratio”:
   Set the ratio of separator height to module width. The separator is located between the
   1D and the 2D part.


Related topics

For details on the 1D part settings, refer to Create a bar code object (page 159) and Set
bar code parameters (page 164).

For details on the human readable text, refer to Set parameters for the human readable text
(page 199).


168                                                                                                ME-NAVIS2-OP-5

---

## หน้า 169

16.1 2D code types


16     2D code object


16.1   2D code types

Choose from different 2D code types to encode your text data. Each 2D code type can
include a specified character set, a maximum number of characters and other specific
features.


QR Code, Micro QR Code

This 2D code supports the following characters and modes:

•   “Numeric” mode:
   0–9
•   “Alphanumeric” mode:
   0–9, A–Z, space character, symbols $ % * + - . / :

•   “Byte” mode:
   Any single-byte ASCII code from 00h to 7Fh
   (0–9, A–Z, a–z, symbols, control characters)

•   “Kanji” mode (ISO/IEC 18004):
   Any JIS code (JIS level 1 and JIS level 2) from 2121h to 7426h
   (alphanumeric characters, symbols, Hiragana, Katakana, Kanji)

•   “Kanji” mode (GB/T 18284):
   Any GB 2312 code (GB 2312 level 1 and GB 2312 level 2) from A1A1h to F7FEh
   (alphanumeric characters, symbols, Simplified Chinese characters)

•   “Auto” mode (ISO/IEC 18004):
   Any single-byte ASCII code from 00h to 7Fh
   Any JIS code (JIS level 1 and JIS level 2) from 2121h to 7426h
   (0–9, A–Z, a–z, symbols, control characters, Hiragana, Katakana, Kanji)

•   “Auto” mode (GB/T 18284) :
   Any single-byte ASCII code from 00h to 7Fh
   Any GB 2312 code (GB 2312 level 1 and GB 2312 level 2) from A1A1h to F7FEh
   (0–9, A–Z, a–z, symbols, control characters, Simplified Chinese characters)

Micro QR Code: “Kanji” (GB/T 18284) and “Auto” (GB/T 18284) mode are not available.

Number of characters: Max. 299


ME-NAVIS2-OP-5                                                                                          169

---

## หน้า 170

16 2D code object


iQR Code

iQR Code supports both square and rectangular dimensions. The quiet zone that surrounds
the code must be at least one module wide.

This 2D code supports the following characters and modes:

•   “Numeric” mode:
   0–9

•   “Text” mode:
   0–9, A–Z, a–z, space character, symbols! " # $ % & ' ( ) * , + - . / : ;< = > ? @ [ \ ] ^ _ ` { | }
   ~, control characters NUL, STX, ETX, EOT, HT, LF, CR, FS, GS, RS, US, DEL

•   “Byte” mode:
   Any single-byte ASCII code from 00h to 7Fh
   (0–9, A–Z, a–z, symbols, control characters)

•   “Kanji” mode:
   Any JIS code (JIS level 1 and JIS level 2) from 2121h to 7426h
   (alphanumeric characters, symbols, Hiragana, Katakana, Kanji)

Number of characters: Max. 299


Data Matrix

The supported Data Matrix version is ECC200. Format 05 and 06 defined in ISO/IEC 15434
are supported (Data Matrix macro 05 and 06).

This 2D code supports the following characters and modes:

•   “Alphanumeric” character input mode:
   Any single-byte ASCII code from 00h to 7Fh
   (0–9, A–Z, a–z, symbols, control characters)

•   “Kanji” character input mode:
   Any JIS code (JIS level 1 and JIS level 2) from 2121h to 7426h
   (alphanumeric characters, symbols, Hiragana, Katakana, Kanji)

Number of characters: Max. 299


GS1 DataMatrix

The Function 1 Symbol Character FNC1 is automatically added to the front of the code data.

FNC1 is also used as a separator character between element strings (AI data). When the
element string is of predefined length, no separator character is required when another
element string is added to it. When the element string is not of predefined length, you must
use FNC1 as a separator character when another element string is added to it.

AI prefix codes can be used in the code data. They define the meaning and the format of the
data that follows.


170                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 171

16.1 2D code types


If you insert the AI prefix code “01” followed by 13 numeric digits, the check digit is appended
automatically next to the 13th digit. Modulo 10/weight 3 is used to calculate the check digit.
This 2D code supports the following characters:

•   0–9, A–Z, a–z, symbols ! " % & ' ( ) * + , - . / : ; < = > ? _, FNC1

Number of characters: Max. 299


PDF417

This 2D code supports different character types in the following compaction modes:

•   “Text”:
   Any single-byte ASCII code from 20h to 7Eh
   (0–9, A–Z, a–z, control characters HT, LF, CR)

•   “Byte”:
   Any single-byte ASCII code from 00h to 7Fh
   (0–9, A–Z, a–z, symbols, control characters)
•   “Numeric”:
   0–9

•   “Auto”:
   The compaction mode is set automatically according to the character type of the code
   data.

Number of characters: Max. 299


Related topics

Create a 2D code object (page 181)

Structure of a QR Code (page 172)

Structure of a Data Matrix code (page 173)

QR Code Model 1 versions and data capacity (page 173)

QR Code Model 2 versions and data capacity (page 176)

Micro QR Code versions and data capacity (page 179)

Data Matrix symbol sizes and data capacity (page 179)

Set parameters for QR Code, Micro QR Code, iQR Code (page 182)

Set parameters for Data Matrix and GS1 DataMatrix (page 184)

About Application Identifiers (page 203)

AI prefix codes (page 204)


ME-NAVIS2-OP-5                                                                                               171

---

## หน้า 172

16 2D code object


16.2    Structure of a QR Code

A QR Code consists of the following basic code elements: a quiet zone, a finder pattern, a
timing pattern, an alignment pattern and the data area.

The structure of a QR Code and Micro QR Code is depicted in the following illustration:

QR Code                                            Micro QR Code
   (1)
   (3)
   (2)

(3)                                            (4)
   (4)
   (3)

(5)


(1)    Quiet zone
(2)    Finder pattern
(3)    Timing pattern
(4)    Data area
(5)    Alignment pattern


Remarks

•     For QR Code, the minimum quiet zone on all sides is four modules.
   Micro QR Code requires a quiet zone on all sides that is at least two modules wide.
   iQR Code requires a quiet zone on all sides that is at least one module wide.

•     The finder patterns are placed in the top left, top right, and bottom left corners of the QR
   Code. Micro QR Code has one finder pattern.

•     The data area consists of square dark (black) and light (white) data modules.

•     The alignment pattern is applied to QR Code Model 2.


Related topics

Create a 2D code object (page 181)

QR Code Model 1 versions and data capacity (page 173)

QR Code Model 2 versions and data capacity (page 176)

Micro QR Code versions and data capacity (page 179)


172                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 173

16.3 Structure of a Data Matrix code


16.3   Structure of a Data Matrix code

A Data Matrix code consists of the following basic code elements: a quiet zone, a timing
pattern, a border and the data area.

The structure of a Data Matrix code is depicted in the following illustration:

(1)


(2)


(4)                 (3)

(1)    Quiet zone
(2)    Timing pattern
(3)    Data area
(4)    Border


Remarks

•     Data Matrix code requires a quiet zone on all sides that is at least one module wide.

•     The data area consists of square dark (black) and light (white) data modules.


Related topics

Create a 2D code object (page 181)

Data Matrix symbol sizes and data capacity (page 179)


16.4   Data capacity information


16.4.1 QR Code Model 1 versions and data capacity


Each QR Code Model 1 version can encode a maximum amount of data (numeric,
alphanumeric, byte, Kanji).

QR Code has error correction capability to restore data if the code is dirty or damaged. Four
selectable levels of error correction are available: L (7%), M (15%), Q (25%) and H (30%).


ME-NAVIS2-OP-5                                                                                                 173

---

## หน้า 174

16 2D code object


This means if for example error correction level H (30%) is selected, the code can be read
even if up to 30% of the code is damaged.

The numbers in the table indicate the maximum number of characters that can be encoded.

The QR Code Model 1 versions that are indicated with 299 characters in the following table,
are capable of storing more characters. However, 299 is the maximum number of characters
that can be entered with the laser marking system.

   Error                                    Mode
Version       correction
   level          Numeric        Alphanumeric           Byte          Kanji

L               40                24                17            10

   1             M               33                20                14            8
(21x21)          Q               25                15                11            6

H               16                10                 7            4

L               81                49                34            20

   2             M               66                40                28            17
(25x25)          Q               52                31                22            13

H               33                20                14            8

L              131                79                55            33

   3             M              100                60                42            25
(29x29)          Q               81                49                34            20

H               52                31                22            13

L              186               113                78            48

   4             M              138                84                58            35
(33x33)          Q              114                69                48            29

H               76                47                32            19

L              253               154                106           65

   5             M              191               116                80            49
(37x37)          Q              157                95                66            40

H              105                63                44            27

L              299               194                134           82

   6             M              249               151                104           64
(41x41)          Q              201               122                84            51

H              133                81                56            34

   L                                244                168          103
   299
   7             M                                188                130           80
(45x45)          Q              253               154                106           65

H              167               101                70            43


174                                                                                              ME-NAVIS2-OP-5

---

## หน้า 175

16.4 Data capacity information


   Error                          Mode
Version   correction
   level      Numeric   Alphanumeric           Byte          Kanji

L                      299                 206          126

  8           M          299         229                 158           97
(49x49)       Q                      183                 126           77

H          203         123                 85            52

L                      299                 244          150

  9           M          299         267                 184          113
(53x53)       Q                      223                 154           94

H          239         145                 100           61

   L                                          287          177
   299
  10          M          299                             219          135
(57x57)       Q                      262                 180          111

H          291         176                 121           74

L                                          299          205

  11          M                      299                 253          156
   299
(61x61)       Q                                          205          126

H                      207                 142           87

L                                          299          234

  12          M                      299                 289          178
   299
(65x65)       Q                                          241          148

H                      236                 162          100

   L                                                       264
   299
  13          M                      299                              202
   299
(69x69)       Q                                          273          168

H                      275                 189          116

L                                                       299

  14          M                                          299          225
   299         299
(73x73)       Q                                                       189

H                                          207          127


ME-NAVIS2-OP-5                                                                               175

---

## หน้า 176

16 2D code object


16.4.2 QR Code Model 2 versions and data capacity


Each QR Code Model 2 version can encode a maximum amount of data (numeric,
alphanumeric, byte, Kanji).

QR Code has error correction capability to restore data if the code is dirty or damaged. Four
selectable levels of error correction are available: L (7%), M (15%), Q (25%) and H (30%).
This means if for example error correction level H (30%) is selected, the code can be read
even if up to 30% of the code is damaged.

The numbers in the table indicate the maximum number of characters that can be encoded.

The QR Code Model 2 versions that are indicated with 299 characters in the following table,
are capable of storing more characters. However, 299 is the maximum number of characters
that can be entered with the laser marking system.

   Error                                     Mode
Version       correction
   level          Numeric         Alphanumeric           Byte          Kanji

L               41                 25                17            10

   1             M               34                 20                14             8
(21x21)          Q               27                 16                11             7

H               17                 10                 7             4

L               77                 47                32            20

   2             M               63                 38                26            16
(25x25)          Q               48                 29                20            12

H               34                 20                14             8

L              127                 77                53            32

   3             M              101                 61                42            26
(29x29)          Q               77                 47                32            20

H               58                 35                24            15

L              187                114                78            48

   4             M              149                 90                62            38
(33x33)          Q               111                67                46            28

H               82                 50                34            21

L              255                154                106           65

   5             M              202                122                84            52
(37x37)          Q              144                 87                60            37

H              106                 64                44            27

   6             L              299                195                134           82
(41x41)          M              255                154                106           65


176                                                                                               ME-NAVIS2-OP-5

---

## หน้า 177

16.4 Data capacity information


   Error                          Mode
Version   correction
   level      Numeric   Alphanumeric           Byte          Kanji

Q          178         108                 74            45

H          139         84                  58            36

L          299         224                 154           95

  7           M          293         178                 122           75
(45x45)       Q          207         125                 86            53

H          154         93                  64            39

   L                      279                 192          118
   299
  8           M                      221                 152           93
(49x49)       Q          259         157                 108           66

H          202         122                 84            52

L                      299                 230          141

  9           M          299         262                 180          111
(53x53)       Q                      189                 130           80

H          235         143                 98            60

   L                                          271          167
   299
  10          M          299                             213          131
(57x57)       Q                      221                 151           93

H          288         174                 119           74

   L                                          299          198
   299
  11          M                                          251          155
   299
(61x61)       Q                      259                 177          109

H                      200                 137           85

   L                                          299          226
   299
  12          M                                          287          177
   299
(65x65)       Q                      296                 203          125

H                      227                 155           96

   L                                                       262
   299
  13          M                      299                              204
   299
(69x69)       Q                                          241          149

H                      259                 177          109

   L                                                       282
   299
  14          M                      299                              223
   299
(73x73)       Q                                          258          159

H                      283                 194          120


ME-NAVIS2-OP-5                                                                               177

---

## หน้า 178

16 2D code object


   Error                          Mode
Version     correction
   level      Numeric   Alphanumeric     Byte      Kanji

   L                                              299
   299
  15           M                                              254
   299         299
(77x77)        Q                                   292        180

H                                   220        136

L                                              299

  16           M                                   299        277
   299         299
(81x81)        Q                                              198

H                                   250        154

   L
   299
  17           M                                   299
   299         299
(85x85)        Q                                              224

H                                   280        173

   L
   299
  18           M
   299         299          299
(89x89)        Q                                              243

H                                              191

   L
   299
  19           M
   299         299          299
(93x93)        Q                                              272

H                                              208

   L
   299
  20           M
   299         299          299
(97x97)        Q                                              297

H                                              235

L

   21           M                                              299
   299         299          299
(101x101)       Q

H                                              248

L

   22           M                                              299
   299         299          299
(105x105)       Q

H                                              270


178                                                                        ME-NAVIS2-OP-5

---

## หน้า 179

16.4 Data capacity information


16.4.3 Micro QR Code versions and data capacity


Each Micro QR Code version can encode a maximum amount of data (numeric,
alphanumeric, byte, Kanji).

Micro QR Code has error correction capability to restore data if the code is dirty or damaged.
For versions M2 and M3, you can select the error correction level L (7%) or M (15%). For the
version M4, you can select L (7%), M (15%) and Q (25%).

The numbers in the table indicate the maximum number of characters that can be encoded.

   Error                                     Mode
Version       correction
   level          Numeric         Alphanumeric           Byte          Kanji

  M1
   –                5                 –                  –             –
(11x11)

  M2             L               10                 6                  –             –
(13x13)          M                8                 5                  –             –

  M3             L               23                 14                 9             6
(15x15)          M               18                 11                 7             4

   L               35                 21                15             9
  M4
   M               30                 18                13             8
(17x17)
   Q               21                 13                 9             5


16.4.4 Data Matrix symbol sizes and data capacity


Each Data Matrix symbol size can encode a maximum amount of data (numeric,
alphanumeric, Kanji).

The maximum data capacity varies with the type of characters used. The numeric capacity
(numbers 0–9 of the “Alphanumeric” character type) is larger than the alphanumeric capacity
(0–9, A–Z, a–z, symbols and control characters of the “Alphanumeric” character type), which
is in turn larger than the Japanese Kanji capacity.

The order and combination of different characters also affects the data capacity
requirements. If the code data consists of numbers (0–9) and capital letters (A–Z), the data
may require more capacity than the maximum allowed number of characters indicated in the
table. For combinations with lowercase letters, symbols or control characters, the data may
require less capacity than the maximum allowed number of characters indicated in the table.

The Data Matrix codes that are indicated with 299 characters in the following table, are
capable of storing more characters. However, 299 is the maximum number of characters that
can be entered with the laser marking system.


ME-NAVIS2-OP-5                                                                                               179

---

## หน้า 180

16 2D code object


Square symbols

   Character type
   Error correction
Symbol size
   overhead [%]
   Numeric   Alphanumeric     Kanji

10x10          6            3           –           62.5

12x12         10            6           1           58.3

14x14         16           10           3           55.6

16x16         24           16           5            50

18x18         36           25           8           43.8

20x20         44           31           10           45

22x22         60           43           14           40

24x24         72           52           17           40

26x26         88           64           21          38.9

32x32         124          91           30          36.7

36x36         172          127          42          32.8

40x40         228          169          56          29.6

44x44         288          214          71           28

48x48                      259          86          28.1

52x52                                  101          29.2

64x64                                  138          28.6
   299
72x72                      299         182          28.1

80x80                                  226          29.6

88x88                                  286           28


Rectangular symbols

   Character type
   Error correction
Symbol size
   overhead [%]
   Numeric   Alphanumeric     Kanji

8x18         10            6           1           58.3

8x32         20           13           4           52.4

12x26         32           22           7           46.7

12x36         44           31           10           45

16x36         64           46           15          42.9

16x48         98           72           23          36.4


180                                                                    ME-NAVIS2-OP-5

---

## หน้า 181

16.5 Create a 2D code object


16.5   Create a 2D code object

To create a 2D code object, use the “2D code” tool in the ribbon.

LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), bar code/2D code
objects are not available under the following conditions:

•    The 3D shape “Vertical cone” or “Sphere” is used.

•    The 3D shape “Cylinder” or “Horizontal cone” is used, and in the 3D model settings
   “Projection” is set for “Data mapping”.

                 1.    Select the “2D code” tool.

                 2.    Select one of the following 2D code types from the menu: “Data Matrix”, “GS1
                       DataMatrix”, “QR Code”, “Micro QR Code”, “iQR Code”, “PDF417”.
                       The “Code data” dialog opens.

                 3.    Input the characters that you want to encode.
                       •   To set the percent sign “%” as a character, input “%%”.

                       •   The input characters may be restricted to either single-byte characters or double-
                           byte characters depending on the code type. In this case, the input characters are
                           automatically converted to the accepted type.

                       •   AI prefix codes can be used for GS1 DataMatrix codes.

                       •   To input FNC1 and other control characters, select “Control code”. In the dialog,
                           select the character F1 to insert the Function 1 Symbol Character FNC1 in your code
                           data.

                       •   You can set the code data on multiple lines. The line feed does not affect the code
                           data, but it can be applied to the human readable text.

                       •   PDF417: The maximum number of characters varies depending on the combination
                           of error correction level and the number of columns and rows.

                 4.    If required, select “Functional characters”. In the dialog, specify functional characters
                       such as date, time, counter, etc.
                       Depending on the code type, the number of characters is limited.
                       Check the functional characters in “Preview for functional characters”.

                 5.    Select “OK”.
                       The 2D code object is displayed in the marking image editor and highlighted in the
                       object list.

                 6.    To edit the parameters of a 2D code object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.


ME-NAVIS2-OP-5                                                                                                     181

---

## หน้า 182

16 2D code object


Related topics

2D code types (page 169)

QR Code Model 1 versions and data capacity (page 173)

QR Code Model 2 versions and data capacity (page 176)

Micro QR Code versions and data capacity (page 179)

Data Matrix symbol sizes and data capacity (page 179)

Use functional characters (page 241)

General object/object group parameters (page 101)

Set parameters for the human readable text (page 199)

About Application Identifiers (page 203)

AI prefix codes (page 204)


16.6    Set parameters for QR Code, Micro QR Code, iQR Code

In the “Object settings” tab, you can specify parameters for QR Code, Micro QR Code and
iQR Code.

•   To edit the parameters of a 2D code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Specify any of the following parameters:

•   “Standard” (QR Code):
   Set the standard for the QR Code. Select “ISO/IEC 18004” (global standard) or “GB/T
   18284” (Chinese standard).
   If the code data contains Simplified Chinese characters, select “GB/T 18284”.
   If you select “ISO/IEC 18004”, you can set Japanese characters.

•   “Model” (QR Code):
   Select the QR Code model (“Model1” or “Model2”). In most cases, “Model2” is used.
   If the standard “GB/T 18284” is selected, the model type is set to “Model2”. In this case,
   “Model” is not displayed.

•   “Mode (QR)” (QR Code, Micro QR Code):
   Select the mode depending on the character type (“Auto”, “Numeric”, “Alphanumeric”,
   “Byte”, “Kanji”).
   If “Auto” is set, the mode is selected automatically depending on the code data.
   If “Auto” is set, and different types of characters are contained in the code data, the data
   is encoded with a mixed data mode.

•   “Mode (iQR)” (iQR Code):
   Select the mode depending on the character type (“Numeric”, “Text”, “Byte”, “Kanji”).


182                                                                                                ME-NAVIS2-OP-5

---

## หน้า 183

16.6 Set parameters for QR Code, Micro QR Code, iQR Code


•   “Error correction level”:
   Select the level of error correction.
   ‒ QR Code: “L” (7%), “M” (15%), “Q” (25%) or “H” (30%).

‒ Micro QR Code: “L” (7%), “M” (15%) or “Q” (25%).
‒ iQR Code: “L” (7%), “M” (15%), “Q” (25%), “H” (30%) or “S” (50%).

•   “Version”:
   Specify the code version. The allowed number of input characters depends on the
   selected version. If “Auto” is set, the version is selected automatically depending on the
   code data.
   ‒ QR Code: Auto, 1–22 (Model 2), 1–14 (Model 1)

‒ Micro QR Code: Auto, M1–M4

‒ iQR Code: 1–31 (square type), R1–R15 (rectangular type)

•   “Number of quiet modules”:
   Specify the width of the quiet zone that surrounds the code.
   Setting range: Auto (n) or 1–9. “(n)” indicates the number of modules.
   If “Auto” is selected, the quiet zone width is set according to the code's requirements for
   the minimum width.
   ‒ QR Code: The quiet zone width is set to four modules.

‒ Micro QR Code: The quiet zone width is set to two modules.

‒ iQR Code: The quiet zone width is set to one module.

•   “Module height [mm]”:
   Enter a numeric value to specify the height of a module.

•   “Module width [mm]”:
   Enter a numeric value to specify the width of a module.

•   “Total width [mm]”, “Total height [mm]”:
   Displays the entire width and height of the code. Two values are displayed: the first
   represents the dimension excluding the quiet zone (margin area), while the value
   enclosed in parentheses indicates the dimension including the quiet zone.


ME-NAVIS2-OP-5                                                                                                183

---

## หน้า 184

16 2D code object


Related topics

2D code types (page 169)

Structure of a QR Code (page 172)

Create a 2D code object (page 181)

QR Code Model 1 versions and data capacity (page 173)

QR Code Model 2 versions and data capacity (page 176)

Micro QR Code versions and data capacity (page 179)

Rotate a 2D code object (page 187)

Specify the position of a 2D code object (page 186)

Set laser correction parameters for a marking object (page 283)


16.7    Set parameters for Data Matrix and GS1 DataMatrix

In the “Object settings” tab, you can specify parameters for Data Matrix and GS1 DataMatrix.

•   To edit the parameters of a Data Matrix or GS1 DataMatrix code, select the object in the
   object list or in the marking image editor.
   The parameters are displayed in the category below the object list.

Specify any of the following parameters:

•   “Character type” (Data Matrix):
   Select the mode depending on the character type (“Alphanumeric” or “Kanji”).

•   “Symbol size”:
   Specify the symbol size (number of modules). The allowed number of input characters
   depends on the selected symbol size. If “Auto” is set, the version is selected automatically
   depending on the code data.

•   “Number of quiet modules”:
   Specify the width of the quiet zone that surrounds the code.
   Setting range: Auto (n) or 1–9. “(n)” indicates the number of modules.
   If “Auto” is selected, the quiet zone width is set according to the code's requirements for
   the minimum width. For Data Matrix and GS1 DataMatrix the quiet zone width is set to
   one module.

•   “Module height [mm]”:
   Enter a numeric value to specify the height of a module.

•   “Module width [mm]”:
   Enter a numeric value to specify the width of a module.


184                                                                                               ME-NAVIS2-OP-5

---

## หน้า 185

16.8 Set the marking direction for QR Code and Data Matrix


•    “Total width [mm]”, “Total height [mm]”:
   Displays the entire width and height of the code. Two values are displayed: the first
   represents the dimension excluding the quiet zone (margin area), while the value
   enclosed in parentheses indicates the dimension including the quiet zone.


Related topics

2D code types (page 169)

Create a 2D code object (page 181)

Structure of a Data Matrix code (page 173)

Data Matrix symbol sizes and data capacity (page 179)

Rotate a 2D code object (page 187)

Specify the position of a 2D code object (page 186)

Set laser correction parameters for a marking object (page 283)


16.8   Set the marking direction for QR Code and Data Matrix

With these settings, you define the direction in which the filling lines are drawn during the
marking process.

                 1.    To edit the parameters of a 2D code object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    For “Code marking direction”, select one of these options: “One direction” or “Alternate”.
                       The alternate direction setting reduces the marking time compared to the one direction
                       setting.


                                  (1)                                  (2)

                       (1)   One direction setting
                       (2)   Alternate direction setting


ME-NAVIS2-OP-5                                                                                                   185

---

## หน้า 186

16 2D code object


16.9    Set the module marking order for QR Code and Data Matrix

You can specify if all code modules are marked consecutively or irregularly by skipping one
or two modules to reduce the heat effect of the laser.

LP-ZV: If “LP-M/S/Z compatible” is set for “Compatible mode” on the “System settings”,
specify the module marking order under “File settings” > “Compatibility with former models” >
“ 2D code skip marking”. If you select “ 2D code skip marking”, the module marking order
corresponds to “Skip one”. If you deselect the check box, the code modules are marked
consecutively (corresponds to “Skip none”).

                    1.   To edit the parameters of a 2D code object, select the object in the object list or in the
                         marking image editor.
                         The parameters are displayed in the category below the object list.

                    2.   For “Module marking order”, select “Skip none”, “Skip one” or “Skip two”.
                         For on-the-fly marking always specify “Skip none”.
                         The module marking order of the three selectable options is shown in the following
                         illustrations.

                          1     2         3   4         1    7     2   8             1    5     9   2
                          5     6         7   8         9    3 10 4                  6 10 3         7
                          9 10 11 12                    5 11 6 12                    11 4       8 12
                                    (1)                          (2)                          (3)

                         (1)   “Skip none”
                         (2)   “Skip one”
                         (3)   “Skip two”


Related topics

On-the-fly marking (page 287)


16.10 Specify the position of a 2D code object

To position your 2D code object, specify the coordinates of the reference point, the object's
center. Alternatively, move the 2D code object by dragging it to a new location.

                    1.   To edit the parameters of a 2D code object, select the object in the object list or in the
                         marking image editor.
                         The parameters are displayed in the category below the object list.

                    2.   Under “Position, rotation”, enter values for “X-position [mm]” and “Y-position [mm]” to
                         move the 2D code object to a new location in the marking image editor.
                         Alternatively, select the 2D code object in the marking image editor and drag it to a new
                         location.


186                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 187

16.11 Rotate a 2D code object


Related topics

Move, modify or align objects (page 93)


16.11 Rotate a 2D code object

To rotate a 2D code object, specify a rotation angle. Alternatively, use the circular arrow
symbol in the marking image editor.

The rotation center is the center of the 2D code object.

                 1.    To edit the parameters of a 2D code object, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    Under “Position, rotation”, enter a value for “Rotation angle [°]” to rotate a 2D code
                       object. Enter a positive value for counterclockwise rotation and a negative value for
                       clockwise rotation.
                       To rotate a 2D code object with the circular arrow symbol           , select the object in the
                       marking image editor.
                       Position the pointer over the symbol. Click and drag in a circular motion.


Related topics

Move, modify or align objects (page 93)


16.12 Specify filling pattern parameters for QR Code and Data Matrix

Set the filling pattern parameters for QR Code, Micro QR Code, iQR Code, Data Matrix and
GS1 DataMatrix.

•    To edit the parameters of a 2D code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

•    For “Filling pattern”, select one of these options:
   “Horizontal line”, “Vertical line”, “Horizontal raster”, “Vertical raster”, “Dot”, “Circle”, “Font”.
   ‒ “Horizontal raster”, “Vertical raster”: If the modules are next to each other, they are
   drawn simultaneously during the marking process.

‒ “Dot”: The filling pattern is marked with one-shot of the laser.

‒ “Font”: Specify a character code from the 2D code pattern font. You can set a
  character code for each code element.


ME-NAVIS2-OP-5                                                                                                          187

---

## หน้า 188

16 2D code object


The illustration shows an enlarged detail of a QR Code and below the corresponding filling patterns
of that detail.


(1)                  (2)        (3)               (4)              (5)               (6)


(1)    “Horizontal line”
(2)    “Vertical line”
(3)    “Horizontal raster”
(4)    “Vertical raster”
(5)    “Dot”
(6)    “Circle”

For “Horizontal line”, “Vertical line”, “Horizontal raster”, “Vertical raster”, the following options
are available:

•   “Filling width per module [mm]”, “Filling height per module [mm]”:
   The actual marking line is shorter than the specified filling value. The reason is that the
   line width value set for “Line width (calculation value) [mm]” in the “Object group” settings
   is subtracted.

•   “Number of filling lines”:
   Specify the number of filling lines per module.

•   “Filling line spacing [mm]”:
   The filling line spacing value is displayed. The value is calculated based on the specified
   number of filling lines and the settings for the module height or module width.

•   “Module marking direction (horizontal)”, “Module marking direction (vertical)”:
   Specify the direction in which the filling lines are drawn during the marking process.
   ‒ If “Horizontal line” or “Horizontal raster” is selected, the following options are
   available: “Left to right”, “Right to left”, “Alternate”.

‒ If “Vertical line” or “Vertical raster” is selected, the following options are available:
  “Top to bottom”, “Bottom to top”, “Alternate”.

For “Dot”, the following option is available:

•   “Radiation period [ms]”:
   Specify the radiation period. The quality of the marked code depends on the specified
   radiation time. Always check the quality and readability of the code after changing this
   parameter.


188                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 189

16.13 2D code pattern font


For “Circle”, the following option is available:

•   “Circle diameter [mm]”:
   Specify the circle's diameter.


Related topics

2D code pattern font (page 189)

Set parameters for code elements (page 191)

Set object group parameters (page 209)


16.13 2D code pattern font

The 2D code pattern font can be selected as filling pattern for code elements such as finder
pattern or quiet zone. The font (2DCODE.fon) is preinstalled in your laser marking system.

The following tables show the font image with the corresponding character code below.

Quiet zone


2230h        2234h          2235h         2236h     2237h        2238h         2239h


Finder pattern


2232h


Alignment pattern


2233h


ME-NAVIS2-OP-5                                                                                               189

---

## หน้า 190

16 2D code object


Module


2231h        8121h       8122h       8123h        8124h   8125h     8126h


8127h        8128h       8129h       812Ah        812Bh   812Ch     812Dh


812Eh         812Fh       8130h       8131h        8132h   8133h     8134h


8135h        8136h       8137h       8138h        8139h   813Ah     813Bh


813Ch         813Dh       813Eh


Border pattern


813Fh        8140h       8141h       8142h        8143h   8144h     8145h


8146h        8147h       8148h       8149h        814Ah   814Bh     814Ch


Related topics

Set parameters for code elements (page 191)

About font files (page 71)

Add font files (page 73)


190                                                                                   ME-NAVIS2-OP-5

---

## หน้า 191

16.14 Code element parameters for QR Code and Data Matrix


16.14 Code element parameters for QR Code and Data Matrix


16.14.1 Invert a QR Code or Data Matrix code


Use the “Marking ON/OFF” setting for the dark and light modules to invert the colors of a QR
Code or Data Matrix code (white modules become black, and black modules become white).

                 1.   To edit the parameters of a 2D code object, select the object in the object list or in the
                      marking image editor.
                      The parameters are displayed in the category below the object list.

                 2.   To invert a QR Code or Data Matrix, make the following settings for “Marking ON/OFF”
                      under “Dark module” and “Light module”:
                      •     “Marking ON/OFF” > “OFF” for “Dark module”

                      •     “Marking ON/OFF” > “ON” for “Light module”

                      As a result, the QR Code or Data Matrix code is inverted. The light modules and quiet
                      zone are filled, and the dark modules are not filled during marking.


                                 (1)                             (2)

                      (1)    Example of a normal QR Code
                      (2)    Example of an inverted QR Code


Related topics

Structure of a QR Code (page 172)

Structure of a Data Matrix code (page 173)

Set parameters for code elements (page 191)


16.14.2 Set parameters for code elements


You can set various parameters for a code element, for example if the filling pattern “Font” is
selected, you can set a character code for each code element.

For QR Code, you can specify parameters for the following code elements: “Quiet zone
outline”, “Dark module”, “Light module”, “Alignment pattern”, “Finder pattern”.


ME-NAVIS2-OP-5                                                                                                 191

---

## หน้า 192

16 2D code object


The parameters for “Alignment pattern” and “Finder pattern” are available if “Font” is set for
“Filling pattern”.

For Data Matrix, you can specify parameters for the following code elements: “Quiet zone
outline”, “Dark module”, “Light module”, “Border”.

The parameters for “Border” are available if “Font” is set for “Filling pattern”.

•   To edit the parameters of a 2D code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

“Dark module”, “Light module”, “Quiet zone outline”:

•   “Marking ON/OFF”:
   Select “ON” to specify that the code element is marked. If you select “OFF” the code
   element is not marked.
   “Light module”: If you select “ON” for “Marking ON/OFF” the parameters for “Quiet zone
   fill” become available.

•   “Character code”:
   This parameter becomes available if “Font” is set for “Filling pattern”.
   Select “Change” next to “Character code” to open the “Select 2D pattern code” dialog.
   The pattern and character code of the 2D code pattern font is displayed.
   ‒ To select a pattern, click on it.
   If 0 (None) is set, the code element is not marked.

‒ Select “OK” to save your settings and close the dialog.

‒ To exit the dialog without changes, select “Cancel” or “X”.

“Alignment pattern”, “Finder pattern”, “Border”:

•   “Custom pattern”:
   If “OFF” is set, the filling pattern of the dark or light modules is applied.
   Select “ON” to select a filling pattern for the respective code element.

Example

The following drawings show two settings for the code element “Border” of a Data Matrix
code.


(1)                                   (2)

(1)   “Custom pattern” > “OFF”
(2)   “Custom pattern” > “ON”

•   “Character code”:
   This parameter becomes available if “Font” is set for “Filling pattern”.


192                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 193

16.14 Code element parameters for QR Code and Data Matrix


Select “Change” next to “Character code” to open the “Select 2D pattern code” dialog.
The pattern and character code of the 2D code pattern font is displayed.
 ‒ To select a pattern, click on it.
   If 0 (None) is set, the code element is not marked.
 ‒ Select “OK” to save your settings and close the dialog.

‒ To exit the dialog without changes, select “Cancel” or “X”.


Related topics

Structure of a QR Code (page 172)

Structure of a Data Matrix code (page 173)

Specify quiet zone filling parameters for QR Code and Data Matrix (page 194)

Set laser correction parameters for code elements (page 193)


16.14.3 Set laser correction parameters for code elements


You can set the laser correction parameters and the number of overwritings for each code
element of QR Code and Data Matrix.

The laser correction parameters and the number of overwritings for a code element are
available if “Marking ON/OFF” or “Custom pattern” is set to “ON”.

For QR Code, specify the laser correction parameters and the number of overwriting for the
following code elements: “Quiet zone outline”, “Dark module”, “Light module”, “Alignment
pattern”, “Finder pattern”.

For Data Matrix, specify the laser correction parameters and the number of overwriting for
the following code elements: “Quiet zone outline”, “Dark module”, “Light module”, “Border”.

•   To edit the parameters of a 2D code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.
Specify any of the following parameters:

•   “Laser power correction [%]”:
   To correct the laser power, enter a value in the text box.
   Marking is not possible if the laser power correction value is 0.

•   “Scan speed correction [%]”:
   To correct the scan speed, enter a value in the text box.

•   “Pulse cycle correction [%]” (LP-RF, LP-RV, LP-ZV):
   To correct the pulse cycle, enter a value in the text box.

If the corrected value exceeds the allowable limit, the marking is performed with the
maximum or minimum parameter value. The correction ratio is calculated based on the value
set as 100% in “Laser settings”.


ME-NAVIS2-OP-5                                                                                                    193

---

## หน้า 194

16 2D code object


For bar code or 2D code objects, you can fine-tune the time until the laser starts radiating at
the start or end point in “Laser settings” under “Customize starting/ending point by object”.

•   “Number of overwritings”:
   Specify how many times the selected code element is marked with one single trigger.
   For example, if you want to mark selected code elements, e.g. dark modules and light
   modules, with individual values, specify “Number of overwritings” for each code element.
   To set how many times the whole 2D code is marked, specify a value for “Number of
   overwritings” in the “Object group” settings.


Related topics

Structure of a QR Code (page 172)

Structure of a Data Matrix code (page 173)

Set parameters for code elements (page 191)

Set laser parameters (page 273)

Fine-tune the laser settings (page 274)

Set object group parameters (page 209)


16.15 Specify quiet zone filling parameters for QR Code and Data Matrix

You can set parameters for the quiet zone, for example set a filling pattern, specify details for
the filling lines and correct laser parameters.

The parameters under “Quiet zone fill” become available if “Marking ON/OFF” > “ON” is set
for “Light module”.

To determine the optimal filling pattern for the quiet zone, check the marking time and the
marking quality of the code's corners.

•   To edit the parameters of a 2D code object, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Specify any of the following parameters:

•   “Filling pattern”:
   Specify a filling pattern for the quiet zone.
   ‒ “Marking OFF”: The quiet zone is not marked.

‒ “Light modules”: The quiet zone is filled with the filling pattern set for “Light module”.

‒ “Pattern 1”: The quiet zone is filled with pattern 1.

‒ “Pattern 2”: The quiet zone is filled with pattern 2.

‒ “Pattern 3”: The quiet zone is filled with pattern 3.


194                                                                                                ME-NAVIS2-OP-5

---

## หน้า 195

16.15 Specify quiet zone filling parameters for QR Code and Data Matrix


(1)                     (2)                    (3)

(1)   “Pattern 1”
(2)   “Pattern 2”
(3)   “Pattern 3”

•   “Filling lines per module”:
   Specify the number of filling lines per module.
   The total number of filling lines of the quiet zone is the result of multiplying the value of
   “Number of quiet modules” by the value of “Filling lines per module”.

•   “Filling line spacing (horizontal) [mm]”, “Filling line spacing (vertical) [mm]”:
   Displays the horizontal and vertical filling line spacing values.
   The values are calculated based on the number of filling lines per module and on the
   module height or module width.

The laser correction parameters for the quiet zone filling are available if “Filling pattern” is set
to “Pattern 1”, “Pattern 2” or “Pattern 3”.
Specify any of the following parameters:

•   “Laser power correction [%]”:
   To correct the laser power, enter a value in the text box.
   Marking is not possible if the laser power correction value is 0.

•   “Scan speed correction [%]”:
   To correct the scan speed, enter a value in the text box.

•   “Pulse cycle correction [%]” (LP-RF, LP-RV, LP-ZV):
   To correct the pulse cycle, enter a value in the text box.

If the corrected value exceeds the allowable limit, the marking is performed with the
maximum or minimum parameter value. The correction ratio is calculated based on the value
set as 100% in “Laser settings”.

For bar code or 2D code objects, you can fine-tune the time until the laser starts radiating at
the start or end point in “Laser settings” under “Customize starting/ending point by object”.


Related topics

Set parameters for code elements (page 191)

Fine-tune the laser settings (page 274)

Set laser parameters (page 273)


ME-NAVIS2-OP-5                                                                                                   195

---

## หน้า 196

16 2D code object


16.16 PDF417 code parameters


16.16.1 Set parameters for PDF417


In the “Object settings” tab, you can configure the parameters for PDF417.

•   To edit the parameters of the PDF417 code, select the object in the object list or in the
   marking image editor.
   The parameters are displayed in the category below the object list.

Specify any of the following parameters:

•   “Compaction mode”:
   Specify the mode according to the character type of the code data.
   Select one of these options: “Text”, “Byte”, “Numeric”, “Auto”.
   If you select “Auto”, the compaction mode is set automatically according to the character
   type of the code data.

•   “Module width [mm]”:
   Enter a numeric value to specify the width of the narrowest element.
   Specify a value larger than the line width under “Line width (calculation value) [mm]” in
   the “Object group” settings.

•   “Row height to module width ratio”:
   Set the ratio of row height to module width.

•   “Number of columns”:
   Specify a column number. A column refers to a set of data codewords vertically. It does
   not include start pattern, stop pattern, right and left row indicators.
   The result of multiplying the value of “Number of columns” by the value of “Number of
   rows” must not exceed 928.

•   “Minimize number of rows”:
   Select this check box to set the minimum allowed value depending on the code data and
   the settings for “Number of columns”.
•   “Number of rows”:
   Specify a row number.
   If “Minimize number of rows” is selected, the automatically calculated number of rows is
   displayed in the text box.

•   “Horizontal quiet zone to module width ratio”:
   Set the ratio of quiet zone width to module width.

•   “Vertical quiet zone to module width ratio”:
   Set the ratio of quiet zone height to module width.

•   “Error correction level”:
   PDF417 has error correction capability to restore data if the code is dirty or damaged.
   Select one of nine error correction levels.


196                                                                                               ME-NAVIS2-OP-5

---

## หน้า 197

16.16 PDF417 code parameters


If “Auto” is selected, the optimal error correction level is set automatically depending on
the code data and the settings for compaction mode.

•    “Total width [mm]”, “Total height [mm]”:
   Displays the entire width and height of the PDF417 code. Two values are displayed: the
   first represents the dimension excluding the quiet zone (margin area), while the value
   enclosed in parentheses indicates the dimension including the quiet zone.

Filling line spacing:

•    To set the distance between the marking lines, enter a value for “Bar code filling line
   spacing [mm]” in the “Object group” settings.


Related topics

Create a 2D code object (page 181)

2D code types (page 169)

Rotate a 2D code object (page 187)

Specify the position of a 2D code object (page 186)

Set laser correction parameters for a marking object (page 283)

Set object group parameters (page 209)


16.16.2 Invert a PDF417 code


The “Invert” setting inverts the colors of a PDF417 code (white spaces become black, and
black bars become white).

                 1.    To edit the parameters of the PDF417 code, select the object in the object list or in the
                       marking image editor.
                       The parameters are displayed in the category below the object list.

                 2.    To invert the PDF417 code, select “Invert” under “Module”.
                       When the check box is selected, the spaces between bars, and the quiet zone are
                       marked.


                       Example of a normal PDF417 code


                       Example of an inverted PDF417 code


ME-NAVIS2-OP-5                                                                                                  197

---

## หน้า 198

16 2D code object


16.16.3 Set the marking direction for PDF417


With these settings, you define the direction in which the filling lines are drawn during the
marking process.

                    1.   To edit the parameters of the PDF417 code, select the object in the object list or in the
                         marking image editor.
                         The parameters are displayed in the category below the object list.
                    2.   For “Code marking direction”, select one of these options: “One direction” or “Alternate”.
                         The alternate direction setting reduces the marking time compared to the one direction
                         setting.


                               (1)                           (2)

                         (1)   One direction setting
                         (2)   Alternate direction setting


198                                                                                               ME-NAVIS2-OP-5

---

## หน้า 199

17.1 Set parameters for the human readable text


17     Human readable text parameters


17.1   Set parameters for the human readable text

The human readable text refers to the characters printed below, beside or above a bar code
or 2D code. You can specify parameters such as position or character spacing.

For composite codes, the settings are applied for both, the 1D and the 2D part, except of the
position parameters.

For GS1 DataBar, you can use the “Optimal setting” function to adjust the following
parameters automatically: “Relative X-position [mm]”, “Relative Y-position [mm]”, “Character
height [mm]”, “Character width [mm]”, “Character spacing [mm]”, “Linefeed spacing [mm]”.

•   To edit the parameters of the bar code or 2D code object, select the object in the object
   list or in the marking image editor.
   The parameters are displayed in the category below the object list.

•   Select “ON” for “Human readable text” to enable the human readable text function.
   For composite code, the human readable text function of the 1D part can be enabled
   independently from the 2D part.

Specify any of the following parameters:

•   “Font”:
   Select a font for the alphanumeric characters from the list box.
   For the human readable text of bar code or 2D code objects, you can set a default font
   under “System settings” > “Operation/information” > “Advanced system settings” >
   “Default font for bar code/2D code objects”.
   To display Japanese or Simplified Chinese characters in the human readable text, select
   the desired character set under “East Asian characters” in “File settings”.

•   “Auto-positioning”:
   Select the check box to position the human readable text automatically.

•   “Relative X-position [mm]”, “Relative Y-position [mm]”:
   Specify values to position the human readable text relative to the code's center. To
   change the values, deselect “Auto-positioning”.
   ‒ For composite codes, the human readable text of the 1D part can be positioned
   independently from the position of the 2D part.

‒ The position parameters are not available for EAN/UPC/JAN.


ME-NAVIS2-OP-5                                                                                               199

---

## หน้า 200

17 Human readable text parameters


Example


(1)                                         (2)

(1)   “Relative X-position [mm]”: -8.15mm, “Relative Y-position [mm]”: -3.1mm
(2)   “Relative X-position [mm]”: -6mm, “Relative Y-position [mm]”: 2mm

•   “Character height [mm]”, “Character width [mm]”:
   To specify the height or width of a character, enter numeric values in the text boxes.
   These parameters are not available for EAN/UPC/JAN.

•   “Character spacing [mm]”:
   Enter a numeric value to set the spacing between characters.
   This parameter is not available for EAN/UPC/JAN.

•   “Bold line width [mm]”:
   Enter a numeric value to set a bold type style.

•   “Linefeed”:
   This parameter is only available for 2D codes and the 2D part of composite codes.
   To enable the line feed function for the human readable text, select “ON” and set the code
   data on multiple lines.
   For GS1 DataMatrix, GS1 DataBar and GS1-128 codes, input the AI prefix code at the
   beginning of each line followed by the data field.

Example

The following drawing illustrates a GS1 DataMatrix code with 3 lines.


•   “Linefeed spacing [mm]”:
   The parameter becomes available if “Linefeed” is set to “ON”. If the human readable text
   is set in several lines, you can specify the spacing between the lines.
   This parameter is only available for 2D codes and the 2D part of composite codes.


200                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 201

17.1 Set parameters for the human readable text


Example

The following drawings illustrate a GS1 DataMatrix code with two different settings for the line
spacing.


(1)                                                   (2)

(1)   “Linefeed spacing [mm]”: 1.5mm (“Character height [mm]”: 1.0mm)
(2)   “Linefeed spacing [mm]”: 2.0mm (“Character height [mm]”: 1.0mm)


Note

•   Control characters are not shown in the human readable text.

•   CODE39, NW-7: The start and stop characters are included in the human readable text.
   For CODE39 the start/stop character is an asterisk (*).

•   EAN/UPC/JAN, CODE39, ITF, NW-7: The check character or check digit is included in
   the human readable text.

•   If Application Identifier “01” is used, the check digit is included in the human readable text.
   This applies to the following codes:
   GS1 DataMatrix, GS1-128 (UCC/EAN-128), GS1 DataBar Limited, GS1 DataBar Limited
   CC-A/CC-B, GS1 DataBar Stacked, GS1 DataBar Stacked CC-A/CC-B


Related topics

Automatically optimize GS1 DataBar parameters (page 167)

About font files (page 71)

About Application Identifiers (page 203)

AI prefix codes (page 204)

Set laser correction parameters for the human readable text (page 202)

Specify the East Asian character set (page 265)

Configure advanced system settings (page 310)


ME-NAVIS2-OP-5                                                                                                          201

---

## หน้า 202

17 Human readable text parameters


17.2    Set laser correction parameters for the human readable text

Specify laser correction parameters for the human readable text of a bar code or 2D code
object.

•   To edit the parameters of the bar code or 2D code object, select the object in the object
   list or in the marking image editor.
   The parameters are displayed in the category below the object list.

•   Under “Human readable text”, set the laser correction parameters.

Specify any of the following parameters:

•   “Laser power correction [%]”:
   To correct the laser power, enter a value in the text box.
   Marking is not possible if the laser power correction value is 0.

•   “Scan speed correction [%]”:
   To correct the scan speed, enter a value in the text box.

•   “Pulse cycle correction [%]” (LP-RF, LP-RV, LP-ZV):
   To correct the pulse cycle, enter a value in the text box.

If the corrected value exceeds the allowable limit, the marking is performed with the
maximum or minimum parameter value. The correction ratio is calculated based on the value
set as 100% in “Laser settings”.


Related topics

Set laser parameters (page 273)

Set parameters for the human readable text (page 199)


202                                                                                           ME-NAVIS2-OP-5

---

## หน้า 203

18.1 About Application Identifiers


18     Application Identifier (AI)


18.1   About Application Identifiers

Application Identifiers (AI) are prefix codes used in bar codes or 2D codes to define the
meaning and format of the data that follows it (data field).

There are AI prefix codes for identification, traceability, dates, quantity, measurements,
locations, and many other types of information.

The combination of an AI prefix code and a data field is an element string. Element strings
can be carried by the following bar codes or 2D codes:

•   GS1-128 (UCC/EAN-128)

•   GS1 DataBar Limited, GS1 DataBar Stacked (AI prefix code “01” only)
•   GS1 DataBar Limited CC-A/CC-B, GS1 DataBar Stacked CC-A/CC-B

•   GS1 DataMatrix

FNC1 is used as a separator character between element strings (AI data). When the element
string is of predefined length, no separator character is required when another element string
is added to it. When the element string is not of predefined length, you must use FNC1 as a
separator character when another element string is added to it.

When using communication commands, you can either use the ASCII control character
GS (1Dh) or the alternative code to input the separator FNC1. For more details, refer to the
“Serial Communication Command Guide”.

Input AI prefix codes without parentheses. In the human readable text, AI prefix codes are
automatically placed in parentheses.

If you set the code data on multiple lines, input the AI prefix code at the beginning of each
line followed by the data field.


Examples

•   GS1 DataMatrix
   Code data: 011234567890123
   Human readable text: (01) 12345678901231


•   GS1 DataBar Limited CC-A/CC-B


ME-NAVIS2-OP-5                                                                                                203

---

## หน้า 204

18 Application Identifier (AI)


2D part
   ‒ Code data: 1720123130123456 [F1] 10123456
   Human readable text: (17) 201231 (30) 123456 (10) 123456

1D part
   ‒ Code data: 1234567890123
   Human readable text: (01) 12345678901231


Related topics

Bar code types (page 156)

2D code types (page 169)

AI prefix codes (page 204)

Set parameters for the human readable text (page 199)

Specify the command format (page 323)


18.2      AI prefix codes

AI prefix codes can be used in the code data. They define the meaning and the format of the
data that follows.

For example, the AI for batch number is “10”, and the batch number AI is always followed by
an alphanumeric batch code not to exceed 20 characters.

AI prefix code “01”:

•     “01” is placed at the beginning of the code data, except when used in the code data of
   GS1-128. For this bar code, “01” is placed after FNC1.

•     GS1-128, GS1 DataBar Limited, GS1 DataBar Stacked, GS1 DataMatrix:
   The AI prefix code “01” is followed by 13 numeric digits. The check digit is appended
   automatically next to the 13th digit.

The most commonly used AI prefix codes are listed in the following table.


AI
                          1)       Data content                     Data format                 FNC1 required
                                                                                                                2)


00            Serial Shipping Container Code   18 numeric digits
   –
   (SSCC)

01            Global Trade Item Number         14 numeric digits
   –
   (GTIN)


204                                                                                               ME-NAVIS2-OP-5

---

## หน้า 205

18.2 AI prefix codes


AI
                      1)     Data content                         Data format                         FNC1 required
                                                                                                                      2)


10          Batch or lot number                  Max. 20 alphanumeric
   ✓
   characters, symbols

11          Production date (YYMMDD)             6 numeric digits                              –

13          Packaging date (YYMMDD)              6 numeric digits                              –

15          Best before date (YYMMDD)            6 numeric digits                              –

17          Expiration date (YYMMDD)             6 numeric digits                              –

21          Serial number                        Max. 20 alphanumeric
   ✓
   characters, symbols

30          Variable count of items              Max. 8 numeric digits                         ✓

310X        Net weight, kilograms                6 numeric digits                              –

320X        Net weight, pounds                   6 numeric digits                              –

392X        Applicable amount payable,           Max. 15 numeric digits
   ✓
   single monetary area

393X        Applicable amount payable with       3 numeric digits plus max. 15
   ✓
   ISO currency code                    numeric digits

7003        Expiration date and time             10 numeric digits                             ✓

710         National Healthcare                  Max. 20 alphanumeric
   Reimbursement Number –               characters, symbols                           ✓
   Germany

711         National Healthcare                  Max. 20 alphanumeric
   Reimbursement Number –               characters, symbols                           ✓
   France

712         National Healthcare                  Max. 20 alphanumeric
   ✓
   Reimbursement Number – Spain         characters, symbols

713         National Healthcare                  Max. 20 alphanumeric
   ✓
   Reimbursement Number – Brazil        characters, symbols

714         National Healthcare                  Max. 20 alphanumeric
   Reimbursement Number –               characters, symbols                           ✓
   Portugal

8004        Global Individual Asset Identifier   Max. 30 alphanumeric
   ✓
   (GIAI)                               characters, symbols

8008        Date and time of production          8–12 numeric digits                           ✓

90          Information mutually agreed          Max. 30 alphanumeric
   ✓
   between trading partners             characters, symbols

91–99       Company internal information         Max. 90 alphanumeric
   ✓
   characters, symbols

                 1)        “X” indicates the number of decimal places.
                 2)        ✓ = required
                           FNC1 is required after the element string if another element string is added to it. FNC1 is not
                           necessary if the element string is the last one in the code data.


ME-NAVIS2-OP-5                                                                                                             205

---

## หน้า 206

18 Application Identifier (AI)


Related topics

Bar code types (page 156)

2D code types (page 169)

About Application Identifiers (page 203)


206                                                            ME-NAVIS2-OP-5

---

## หน้า 207

19.1 Create, duplicate or delete an object group


19     Object group settings


19.1   Create, duplicate or delete an object group

You can use object groups to manage the marking objects in your marking file.

•   To display the object list, select “Object settings” on the “Marking settings” screen.

Create a new object group:

•   Select the “Group” icon     in the ribbon and select “OK” in the confirmation dialog. The
   new object group is added at the end of the object list.

•   You can change the number and name of the object group if required.

Delete an object group:

•   Deleting an object group also deletes all marking objects that are in the group.

•   Select the object group you want to delete in the object list.

•   Select the “Delete” icon or press <Del>.

Duplicate an object group:

•   Duplicating an object group also duplicates all marking objects that are in the group.

•   Select the object group you want to duplicate in the object list.

•   Select the “Copy” icon or press <Ctrl>+<C>.

•   Select the “Paste” icon or press <Ctrl>+<V>.
   The object group is inserted and displayed in the object list.


Related topics

Editing tools overview (page 91)

General object/object group parameters (page 101)


19.2   Position and rotate an object group

Set the position of all marking data in the object group along the x-, y- and z-axis (LP-ZV,
LP-GS except LP-GS051-L). Specify a rotation angle, to rotate all marking data in the object
group.

•   To edit the parameters of an object group, select the object group in the object list. The
   parameters are displayed in the category below the object list.


ME-NAVIS2-OP-5                                                                                                207

---

## หน้า 208

19 Object group settings


•   You can specify different parameters to correct the marking position.
   The following figure shows these parameters.
   (3)


+Z
   (2)


-X


   +
   Y
(5) +                                     - (4)
   -Y


   +
   X
   (1)
-Z


(1)   X-movement
(2)   Y-movement
(3)   Z-movement
(4)   Rotation (-)
(5)   Rotation (+)

‒ “ X-movement [mm]”, “Y-movement [mm]”:
   Enter a value to move all marking data in the object group along the x-axis and y-
   axis. The orientation of the x- and y-axis is defined by the head direction setting.
   The reference point of the movement is the center of the marking field.
   LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the reference
   point of the movement is the center of a 3D model.

‒ “ Z-movement [mm]” (LP-ZV, LP-GS except LP-GS051-L):
   Enter a value to position all marking data in the object group along the z-axis.
   LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), “ Z-movement
   [mm]” cannot be specified.

‒ “Rotation movement [°]”:
   Specify an angle to rotate all marking data in the object group. The rotation center is
   the center of the marking field. Enter a positive value for counterclockwise rotation
   and a negative value for clockwise rotation.
   LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), the rotation
   center is the center of a 3D model.


Related topics

Set the laser head direction (page 315)

General object/object group parameters (page 101)


208                                                                                              ME-NAVIS2-OP-5

---

## หน้า 209

19.3 Set object group parameters


19.3   Set object group parameters

Specify parameters for the object group. The settings apply to all marking data in the
selected object group.

•   To edit the parameters of an object group, select the object group in the object list.
   The parameters are displayed in the category below the object list.

Specify any of the following parameters:

•   “Step & repeat”:
   Select “ON” to use the Step & repeat function.

•   “Number of overwritings”:
   Specify how many times the object group is marked with one single trigger.

•   “Overwriting interval [s]”:
   Set the interval period at overwriting.
   If on-the-fly marking is set, specify "0".

•   “Defocusing [mm]” (LP-ZV):
   To perform marking with a larger laser beam diameter, specify the defocusing distance.
   If “0” is set, marking is performed with the optimized laser beam diameter at the focal
   point. If you enter a positive value, the defocused beam diameter corresponds to the
   beam diameter at the shorter work distance. If you enter a negative value, the defocused
   beam diameter corresponds to the beam diameter at the longer work distance.


+25mm

0mm

-25mm

If you set a value other than 0mm for Z-position or Z-movement, or activate “Uniform spot
mode”, the total value of these settings should be in the range from -25mm to +25mm. If
the total value exceeds ±25mm, an error occurs.
When the uniform spot mode is activated, only the negative value range (from 0mm to
-25mm) of the “Defocusing [mm]” setting is available. Setting a value in the positive range
(from 0mm to +25mm) has no effect.
If you do not use this function, specify "0".
If on-the-fly marking is set, specify "0".

•   “Line width (calculation value) [mm]”:
   The line width is defined as the laser line width for calculation. It is the distance between
   the start points of the filling lines at the intersection point for example in a character.


ME-NAVIS2-OP-5                                                                                                 209

---

## หน้า 210

19 Object group settings


(1)                              (2)                                 (3)


(1)   Line width too large
(2)   Optimal line width
(3)   Line width too small

The line width is initially set to the calculated spot size value of the connected laser
marking system model. To specify the line width accurately, measure the actual size of a
marked line, and adjust the value.
Initial setting: 0.110mm (LP-GS051), 0.060mm (LP-GS052), 0.245mm (LP-RC350S),
0.060mm (LP-RF200P), 0.180mm (LP-RH100, LP-RH200, LP-RH300), 0.110mm (LP-
RH101, LP-RH301), 0.260mm (LP-RH305), 0.050mm (LP-RV200P), 0.060mm (LP-
ZV200P, LP-ZV500P), 0.080mm (LP-ZV205P, LP-ZV505P), 0.110mm (LP-ZV206P, LP-
ZV506P)
 ‒ Character objects: The line width correction applies only if you specify the property
   “1” or “2” for the lines of a character with the Font Maker or Logo Data Editing
   software.

‒ TrueType and graphic objects (except VEC files): The line width correction applies to
  the closing point of a drawing. The closing point is the point where the start point and
  end point are in the same position.

‒ VEC files: The line width correction applies only if you specify the line property “1” or
  “2” with the Logo Data Editing software.

‒ Changing the value for “Line width (calculation value) [mm]” does not affect the actual
  marking line width. To set bold lines, change the value for “Bold line width [mm]” in
  the character object settings.

‒ A smaller line width value may increase the marking time.

•   “Bold filling line spacing [mm]”: Specify the distance between the filling lines of bold
   characters.
   “Bar code filling line spacing [mm]”: Specify the distance between the filling lines of bar
   codes and PDF417 codes.
   Initial setting: 0.055mm (LP-GS051), 0.030mm (LP-GS052), 0.122mm (LP-RC350S),
   0.030mm (LP-RF200P), 0.090mm (LP-RH100, LP-RH200, LP-RH300), 0.055mm (LP-
   RH101, LP-RH301), 0.130mm (LP-RH305), 0.025mm (LP-RV200P), 0.030mm (LP-
   ZV200P, LP-ZV500P), 0.040mm (LP-ZV205P, LP-ZV505P), 0.055mm (LP-ZV206P, LP-
   ZV506P)
   Recommended setting for the filling line spacing:
   ‒ Specify an integer multiple of half of the actual marked line width.

‒ If the actual distance between the marked filling lines on the workpiece is too large,
  set a smaller value.


210                                                                                               ME-NAVIS2-OP-5

---

## หน้า 211

19.4 Use the step & repeat function


(1)
   (1)


(2)                             (2)

(1)   Filling line spacing
(2)   PDF417 and bar code objects: “Module width [mm]” parameter
   Character object: “Bold line width [mm]” parameter


Related topics

General object/object group parameters (page 101)

Use the step & repeat function (page 211)

Change the basic parameters of a character object (page 107)


19.4   Use the step & repeat function

Step & repeat is a function to mark a tray or array of workpieces. With the step & repeat
settings, you can copy marking objects multiple times and arrange them in rows and
columns in the marking field.

LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”) and the step &
repeat function is used, the marking objects are arranged on one 3D model. The number of
the 3D models remains unchanged.

•   To edit the parameters of an object group, select the object group in the object list.
   The parameters are displayed in the category below the object list.

•   Select “ON” for “Step & repeat”.

Specify any of the following parameters:

•   “Number of rows”, “Number of columns”:
   Specify the number of steps in y- and in x-direction.
   A maximum of 10000 steps can be set in one object group.

•   “Row step [mm]”, “Column step [mm]”:
   Set the distance between steps in y- and in x-direction.

•   “Base position”:
   Select the position of the first row and first column (“Top left”, “Top right”, “Bottom left”,
   “Bottom right”).


ME-NAVIS2-OP-5                                                                                                        211

---

## หน้า 212

19 Object group settings


Example
   (2)

3           2         1

1                                            (3)

   2
(1)
   3
   (4)
   4

(5)

(1)    “Number of rows”: 4
(2)    “Number of columns”: 3
(3)    “Base position”: “Top right”
(4)    “Row step [mm]”: 5 mm
(5)    “Column step [mm]”: 10 mm


19.5     Configure counter parameters for a step & repeat object

If you use a counter in your step & repeat object, you can configure parameters for the
counter. The settings apply to the counters used in the selected object group.

To use a counter, first configure the parameters for the counter in the “Function settings” tab.
Then you must insert the functional character of your specified counter in the text of your
marking object (character object or bar code/2D code object).

•     To edit the parameters of an object group, select the object group in the object list.
   The parameters are displayed in the category below the object list.

•     “Count individually”:
   Select “ON” to specify that the counter value is updated for each individual step.
   If you set “OFF”, the steps are not counted individually. All steps have the same counter
   value as shown in the illustration.
   1       1        1        2    2       2               3   3   3        4      4       4
   1       1        1        2    2       2               3   3   3        4      4       4

The following parameters become available if “ON” is set for “Count individually”.

•     “Count “Marking OFF””:
   Select the check box to set that the counter value is updated for steps that are to be
   skipped. If you deselect the check box, the counter value is not updated (not counted) for
   steps that are to be skipped.
   In the “Step & repeat fine adjustment” dialog, you can set “Marking OFF” for “Item” to skip
   the marking of a single step, row, column or a range of steps.

Example


212                                                                                                ME-NAVIS2-OP-5

---

## หน้า 213

19.5 Configure counter parameters for a step & repeat object


The illustrations show a step & repeat object with three rows and three columns. “Marking
OFF” is set for the step in the second row and second column (dashed rectangle).
“Counter starting position” is set to “Top left”. “Count direction” is set to “Horizontal”.

1         2         3                    1        2        3
4                   6                    4                 5
7         8         9                    6        7        8
   (1)                                    (2)

(1)   “Count “Marking OFF”” is selected (The counter value for the skipped step is updated.)
(2)   “Count “Marking OFF”” is not selected (The counter value for the skipped step is not updated.)

•       “Counter starting position”:
   Specify the starting position of the counting (“Base position”, “Top left”, “Top right”,
   “Bottom left”, “Bottom right”).

•       “Count direction”:
   Specify the counting direction (“Horizontal”, “Vertical”).

Example

The illustrations show a step & repeat object with three rows and three columns. “1” indicates
the counter starting position. The settings for “Counter starting position” and “Count direction”
determine the counter order and the marking order. “Count direction” is set to “Horizontal”.

1          2          3        3         2      1            7   8       9          9       8       7
4          5          6        6         5      4            4   5       6          6       5       4
7          8          9        9         8      7            1   2       3          3       2       1

(1)                           (2)                      (3)                       (4)

(1)      “Count direction”: “Top left”
(2)      “Count direction”: “Top right”
(3)      “Count direction”: “Bottom left”
(4)      “Count direction”: “Bottom right”


Related topics

Use functional characters (page 241)

Functional characters for counters (page 245)

Configure parameters for the counter function (page 252)

Specify parameters for an element of a step & repeat object (page 214)


ME-NAVIS2-OP-5                                                                                                           213

---

## หน้า 214

19 Object group settings


19.6     Specify parameters for an element of a step & repeat object

You can specify a set of parameters for selected elements of your step & repeat object. An
element can be a single step, a row, a column or a range of steps.

•   To edit the parameters of an object group, select the object group in the object list.
   The parameters are displayed in the category below the object list.

•   Under “Step & repeat”, select “Fine adjustment”.

In the dialog, you can add, edit or delete a set of parameters.

•   To add a new set of parameters, select “Add”.
   Specify the parameters in the dialog.

•   To edit a set of parameters, select it in the list and select “Edit”.
   Alternatively double-click on the row to open the dialog.

•   To delete a set of parameters, select it in the list and select “Delete”.

In the dialog, configure any of the following settings:

•   “Adjustment No.”:
   Change the number if required. The number is referred to when using communication
   commands to control the laser marking system.
   Max. 1000 sets of parameters (No. 0 to 999) can be specified in one marking file.

•   “Item”:
   Set “Position/Power” to specify parameters for position and laser power of the selected
   element.
   Select “Marking OFF” to skip the marking of the element. If “Marking OFF” is set for an
   element, this element is not displayed in the marking image editor.

•   “Element”:
   Select an element of the step & repeat object. The parameters for position and laser
   power apply to the selected element.
   Select “Single step”, “Row”, “Column” or “Rectangle range” (a range of steps).

•   Depending on your selection for “Element”, specify the row and column of the target
   element.
   Enter values for “Start row”, “Last row”, “Start column” and “Last column”.
   The setting for “Base position”, specifies the first row and the first column.


214                                                                                               ME-NAVIS2-OP-5

---

## หน้า 215

19.6 Specify parameters for an element of a step & repeat object


Example

The illustration shows a step & repeat object with 8 rows and 9 columns. “Base position” is set to
“Top left”.

   1 2 3 4 5 6 7 8 9
1
   (4)
2
3
4
5                                         (3)
6
7
8

(1)              (2)

(1)    “Column”, “Start column”: 2, “Last column”: 4
(2)    “Single step”, “Start row”: 8, “Start column”: 8
(3)    “Row”, “Start row”: 4, “Last row”: 6
(4)    “Rectangle range”, “Start row”: 1, “Last row”: 2, “Start column”: 6, “Last column”: 9

You can specify different parameters to correct the marking position.
The following figure shows these parameters.
   (3)


   +Z
   (2)
-X


+
  Y


(5) +                                                 - (4)
   -Y


+
 X


   (1)
-Z


(1)       X-movement
(2)       Y-movement
(3)       Z-movement
(4)       Rotation (-)
(5)       Rotation (+)

•     “ X-movement [mm]”, “Y-movement [mm]”:
   Enter a value to move the selected element of the step & repeat object along the x-axis
   and y-axis.

•     “ Z-movement [mm]” (LP-ZV, LP-GS except LP-GS051-L):
   Enter a value to position the selected element of the step & repeat object along the z-
   axis.
   LP-ZV: For 3D marking (“File settings” > “3D marking” is set to “ON”), “ Z-movement
   [mm]” cannot be specified.

•     “Rotation movement [°]”:
   Specify an angle to rotate the selected element of the step & repeat object.
   The rotation center is the reference point of the marking object.


ME-NAVIS2-OP-5                                                                                                          215

---

## หน้า 216

19 Object group settings


Correct the laser power:

•   “Laser power correction [+/-%]”:
   To correct the laser power of the selected element, enter a value in the text box. You can
   enter a correction value between -50% and +50%.
   The value set for “Laser power correction [+/-%]” is applied to the laser power of the step
   & repeat object. The laser power of the step & repeat object is the same as the laser
   power of the marking object for which the step & repeat function is applied.
   In case that you corrected the laser power of the marking object under “Object settings” >
   “Laser power correction [%]”, the value set for “Laser power correction [+/-%]” in “Step &
   repeat fine adjustment” is applied to the corrected laser power result.

Examples

‒ The laser power is set to “50” in the “Laser settings” tab and “100” is set under
  “Object settings” > “Laser power correction [%]”. The laser power of the step & repeat
  object is the result of the following calculation: 50 x 100% = 50 .
   To correct the laser power of an element (e.g. “Single step”), select “Fine adjustment”
   and “Add”. In the dialog, enter “20” for “Laser power correction [+/-%]”.
   The corrected laser power of the element (e.g. “Single step”) is the result of the
   following calculation: 50 x 120% = 60

‒ You can specify several sets of parameters in the “Step & repeat fine adjustment”
  dialog. In the following example, there are two sets of parameters, one for the
  first column and another one for the first row. For the first column, specify a laser
  correction value of “10”. For the first row, specify a laser correction value of “20”.
   The following drawing shows that for the step which is at first position in the first
   row and column, the specified parameter sets overlap. In this case, the laser power
   correction value is the result of adding up the values specified for each parameter
   set. The following calculation is used: 100 + 20 + 10 = 130 [%]
   (1)

A A A A A A A A A A                (3)

 A
 A
 A
 A
(2)

(1)   “Base position”: “Top left”
(2)   First column: “Laser power correction [+/-%]”: +10%
(3)   First row: “Laser power correction [+/-%]”: +20%


216                                                                                              ME-NAVIS2-OP-5

---

## หน้า 217

20.1 Introduction to 3D marking


20     3D marking function


20.1   Introduction to 3D marking

The LP-ZV is equipped with 3D functionality and is particularly suitable for marking of
complex surfaces, such as cylinders or inclined planes.

In Laser Marker NAVI smart, marking data (e.g. characters or bar codes) is transformed and
mapped to a 3D model.

The 3D marking function allows you to do the following:

•   Create a 3D model (plane, cylinder, cone, sphere).

•   Set the size and position of a 3D model.

•   Assign an object group containing the marking objects to a 3D model.


Note

•   External offset function via I/O connector and 3D marking cannot be set together in one
   file.

•   If “Data mapping” is set to “Projection”, bar code or 2D code objects are not available for
   marking.

•   Marking objects on a 3D model are not shown in the 3D viewer of Laser Marker NAVI
   smart. Instead, symbols representing the marking objects are displayed.


Coordinate systems

You can change the position of a 3D model (e.g. plane) or the position of an object group by
specifying the coordinates.

There are two types of coordinate systems:

•   In the global coordinate system, the coordinate origin corresponds to the center of the
   marking field. The center position of a 3D model is determined with respect to the global
   coordinate origin.

•   In the local coordinate system, the coordinate origin is the center of a 3D model. The
   marking position of an object group is determined with respect to the local coordinate
   origin.

Example

In this example the 3D model “Plane” and a character object are used to demonstrate the
position in the global and local coordinate system.

The plane and the character object have the following settings:

•   “Plane”:


ME-NAVIS2-OP-5                                                                                                217

---

## หน้า 218

20 3D marking function


   “Center X-position [mm]”: 10mm, “Center Y-position [mm]”: 10mm, “Center Z-position
   [mm]”: 8mm, “X-rotation angle [°]”: 45°
   The 3D model is positioned in the global coordinate system with respect to the global
   coordinate origin. The coordinate origin is the center of the marking field.
•     Character object:
   “Text”: ABCD, “X-position [mm]”: -4mm, “Y-position [mm]”: -1mm
   The character object is positioned in the local coordinate system with respect to the local
   coordinate origin. The coordinate origin is the center of the assigned 3D model.

The following illustration shows the position of the 3D model “Plane” in the global coordinate
system (left), and the position of the character object in the local coordinate system (right).

(3)
   (4)                              (4)
   Y                                              Y
   (5)

(1)        Z’
   (2)
   45°    -1mm         ABCD         X
   X
                            - +             Y’     8mm                       +                       -4mm
                                  -                                Z                           (6)
                                      +
                                       +
                                      - X’
                                                         Y


10mm                         10mm
   X


(1)    Global coordinate origin (center of a marking field)
(2)    Rotation direction
   A positive value rotates the 3D model in counterclockwise direction around the axis.
(3)    3D model “Plane”
(4)    Local coordinate origin (center of the 3D model)
(5)    “X-rotation angle [°]”: 45°
(6)    Reference point position (X, Y) of the character object
   (“X-position [mm]”: -4mm, “Y-position [mm]”: -1mm)


3D model types

You can create the following three-dimensional (3D) model types: “Plane”, “Cylinder”,
“Horizontal cone”, “Vertical cone”, and “Sphere”.


Plane

“Data mapping” is set to “Labeling” (fixed).


218                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 219

20.1 Introduction to 3D marking


Cylinder: Set “Convex” (left) or “Concave” (right).

Set “Labeling” or “Projection” for “Data mapping”. Bar code or 2D code objects are not available if
“Projection” is set.


Horizontal cone: Set “Convex” (left) or “Concave” (right).

Set “Labeling” or “Projection” for “Data mapping”. Bar code or 2D code objects are not available if
“Projection” is set.


Vertical cone: Set “Convex” (left) or “Concave” (right).

“Data mapping” is set to “Projection” (fixed). Bar code or 2D code objects are not available.


Sphere: Set “Convex” (left) or “Concave” (right).

“Data mapping” is set to “Projection” (fixed). Bar code or 2D code objects are not available.


3D data mapping

For “Data mapping”, you can set “Labeling” or “Projection”. These are methods for mapping
marking data on the surface of a 3D model.


“Labeling”

With this method, the surface of a workpiece is marked in a similar way as a label is affixed
to a surface.

“Labeling” can be set for the following 3D models: plane, cylinder (convex, concave),
horizontal cone (convex, concave).


ME-NAVIS2-OP-5                                                                                                         219

---

## หน้า 220

20 3D marking function


ABCDEFGH
   DEFG
  BC     H
A


(1)                                                          DEFG
   BC     H
   A


(2)                                           (3)

(1)    Reference point position (X, Y) of the marking object
(2)    Marking image on the convex surface of a cylinder
(3)    Labeling image


Note

•     For a cylinder or cone, measure the round surface length and set the X-/Y-position of the
   marking data.

•     If the marking data cannot be accommodated within a 3D model, an error occurs, and
   marking cannot be performed.

•     If the position of the marking data mapped to a 3D model is out of range, an error occurs,
   and marking cannot be performed.

The illustration shows marking data that protrudes from the 3D model. In this case, marking cannot be
performed.


“Projection”

With this method, marking data is projected so that it appears without any distortion when the
3D model is viewed from directly above.

“Projection” can be set for the following 3D models: vertical cone (convex, concave), sphere
(convex, concave).


220                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 221

20.1 Introduction to 3D marking


ABCDEFGH


(1)
   DEFG
   BC      H
   A
   (2)                                           (3)

(1)    Reference point position (X, Y) of the marking object
(2)    Marking image on the convex surface of a sphere
(3)    Projection image


Note

•     For a cylinder or sphere, measure the round surface length and set the X-/Y-position of
   the marking data.

•     If the marking data cannot be accommodated within a 3D model, an error occurs, and
   marking cannot be performed.

•     If the position of the marking data mapped to a 3D model is out of range, an error occurs,
   and marking cannot be performed.

The illustration shows marking data that protrudes from the 3D model. In this case, marking cannot be
performed.


ME-NAVIS2-OP-5                                                                                                     221

---

## หน้า 222

20 3D marking function


20.2     3D viewer


20.2.1 User interface overview


To open the 3D viewer, select “3D” in the ribbon on the “Marking settings” screen. You can
create a 3D model with the tools in the ribbon or change the size and position of the 3D
model.

8        76


1


   6
4


2


3                                                              5


(1)    Ribbon
   Contains tools to manage files and create or edit 3D models.
(2)    3D marking image editor
   The 3D marking image editor consists of the 3D image view and the toolbar.
(3)    3D image view
   Displays 3D models and the assigned object groups. Symbols represent the marking objects on
   the 3D model. You can zoom in or out or rotate the 3D model to check the marking layout.
   If on-the-fly-marking is enabled, symbols for the workpiece reference boundary and the moving
   direction are displayed.
(4)    Toolbar
   This toolbar offers various tools e.g. for viewing the 3D model and for customizing the 3D image
   view.
(5)    Parameter area
   Select a 3D model or object group to display the settings in this area.
(6)    Object list
   Shows a list with the 3D models and assigned object groups.
(7)    Tabs for the 3D model settings
   The following tabs are available: “3D models”, “File settings”
(8)    View filter
   Select a 3D model that you want to show in the 3D image view and in the object list.


3D image view

The 3D image view is a virtual three-dimensional space to view the 3D models.


222                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 223

20.2 3D viewer


   (1)
   Z
   Y
X


(5)

(2)
(3)

(6)
   (4)


(1)    X-, y-, and z-axis of the global coordinate system
(2)    Object group (with marking objects)
   In the 3D image view, marking objects on a 3D model are replaced with symbols.
(3)    3D model
   A graphic representation of a physical object.
(4)    XY plane
   A virtual XY horizontal plane representing the marking field.
(5)    Ruler
   Rulers are displayed on the x-, y-, and z-axis.
(6)    Grid


Note

If marking objects belong to an object group that is set to “Marking ON/OFF” > “OFF”, they
are not displayed in the 3D image view.


Toolbar

The tools in the toolbar let you perform various tasks, such as zoom, pan or rotate a 3D
model.


ME-NAVIS2-OP-5                                                                                                     223

---

## หน้า 224

20 3D marking function


(1)
   (7)
(2)                         (8)
(3)                         (9)
(4)                         (10)
(5)                         (11)
(6)                         (12)


(1)      “Zoom in” / “Zoom out”
   To enlarge or reduce a 3D model in the 3D image view, select “+” or “-”.
(2)      “Full field view”
   Zooms out so that the entire marking field is visible on the screen.
(3)      “Scale to fit model”
   Zooms in on the 3D model.
(4)      “XY-plane”
   Displays a view of the XY plane with the x-axis to the right and y-axis up (top view).
(5)      “YZ-plane”
   Displays a view of the YZ plane with the y-axis to the right and z-axis up (right side view).
(6)      “XZ-plane”
   Displays a view of the XZ plane with the x-axis to the right and z-axis up (front view).
(7)      “Pan 3D image”
   Position the pointer in the 3D image view. Click and drag to move the 3D image.
(8)      “Rotate”
   Position the pointer in the 3D image view. Click and drag to rotate the 3D image view.
(9)      “Grid”
   Select to show or hide the grid on the XY plane.
(10)     “Ruler on axes”
   Select to show or hide the rulers on the x-, y-, and z-axis.
(11)     Zoom level indication
   Shows the current magnification of the 3D image view.
(12)     Laser head direction
   The icon shows the direction of the laser head. “F” indicates the front of the laser head.


20.2.2 Editing tools overview


Use the editing tools in the ribbon, to create and edit a 3D model.


Create 3D models

Select one of the following icons to create a 3D model.


(1)        (2)      (3)     (4)      (5)

(1)    “Plane”
(2)    “Cylinder”
(3)    “Horizontal cone”
(4)    “Vertical cone”
(5)    “Sphere”


224                                                                                                       ME-NAVIS2-OP-5

---

## หน้า 225

20.3 Create marking data for 3D marking


Undo/Redo


(1)         (2)

(1)    To revert the most recent operation, select the “Undo” icon or press <Ctrl>+<Z>.
(2)    To redo the most recent undo operation, select the “Redo” icon or press <Ctrl>+<Y>.


Close 3D viewer

When you have finished working on your 3D marking data, select the “Close 3D viewer” icon.
The display switches to the “Marking settings” screen.


“Close 3D viewer”


20.3   Create marking data for 3D marking

If you would like to mark on a three-dimensional surface, create one or more 3D models and
the desired marking objects.

In the follwing example procedure, we start with the creation of the marking objects. You can
also start to create the 3D model first before creating the desired marking objects.

                  1.     Create an object group with marking objects.
                         a.   Go to the “Marking settings” screen and create the desired marking objects in
                              advance.

                         b.   Then, create an object group and assign the marking objects to the object group. If
                              you want to mark multiple 3D models, you have to create an object group for every
                              3D model.

                  2.     Create a 3D model (page 225)
                         Open the 3D viewer and create a 3D model.

                  3.     Assign an object group (page 227)
                         The object group is automatically assigned to the first 3D model (#1) in the object list. If
                         you have created multiple 3D models, you can reassign the object group to another 3D
                         model.


20.3.1 Create a 3D model


In the 3D viewer, you can create a 3D model such as a cylinder, cone, or sphere. Create an
object group with marking objects in advance.

                  1.     Select “3D” in the ribbon of the “Marking settings” screen to open the 3D viewer.


ME-NAVIS2-OP-5                                                                                                    225

---

## หน้า 226

20 3D marking function


                  2.     If a confirmation dialog appears, select “OK”.
                         The display switches to the 3D viewer.

                  3.     Select an icon in the ribbon to create one of the following 3D model types: “Plane”,
                         “Cylinder”, “Horizontal cone”, “Vertical cone”, or “Sphere”.
                         The “3D model settings” dialog is displayed.

                  4.     In the dialog, configure any of the following settings:
                         •   “3D model No.”:
                             The 3D model No. is useful to identify a 3D model within a marking file.

                         •   “Shape”:
                             Select one of the following shapes: “Plane”, “Cylinder”, “Horizontal cone”, “Vertical
                             cone”, or “Sphere”.

                         •   “Surface”:
                             Select “Convex” or “Concave” to set the marking surface. This parameter is available
                             for “Cylinder”, “Horizontal cone”, “Vertical cone”, and “Sphere”.

                         •   “Data mapping”:
                             For “Cylinder” and “Horizontal cone”, select “Labeling” or “Projection”. These are
                             methods for mapping marking data on the surface of the 3D model.
                             For “Plane”, “Data mapping” is set to “Labeling” (fixed).
                             For “Vertical cone” and “Sphere”, “Data mapping” is set to “Projection” (fixed).

                         •   “Length [mm]”, “Width [mm]”:
                             Specify the length and width of a 3D model. These parameters are available for
                             “Plane”, “Cylinder”, “Horizontal cone”, and “Vertical cone”.

                         •   “Height [mm]”:
                             Specify the height for “Vertical cone”.

                         •   “Top diameter [mm]”, “Bottom diameter [mm]”:
                             For “Horizontal cone” and “Vertical cone”, specify the top and bottom diameter. For
                             “Vertical cone”, set the bottom diameter to a value greater than the top diameter.

                         •   “Diameter [mm]”:
                             Specify the diameter for “Cylinder” and “Sphere”.

                         •   “X-rotation angle [°]”, “Y-rotation angle [°]”, “Z-rotation angle [°]”:
                             Set the angle for the rotation of the 3D model around the x-, y- and z-axis.

                  5.     Select “OK”.
                         The 3D model is created, and an existing object group is assigned to the 3D model.


226                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 227

20.3 Create marking data for 3D marking


Note

•    After you have created the 3D model, you can still change the parameters. Select the 3D
   model in the object list and change the parameters in the parameter area displayed below
   the object list.

•    To specify a name for the 3D model, select the 3D model in the object list. Select
   “Change” next to “3D model name”, enter a name (max. 64 characters) and confirm with
   “OK”.

•    Select the “Close 3D viewer” icon to switch to the standard view of the “Marking settings”
   screen showing the marking image editor.

•    If the object group protrudes from the 3D model, an error symbol appears in the object
   list. Adjust the size and marking position of the object group.

•    To deactivate the 3D marking settings, set “OFF” for “File settings” > “3D marking” in the
   “Marking settings” screen.


Related topics

Create marking data for 3D marking (page 225)


20.3.2 Assign an object group


In the object list, you can assign an object group to a 3D model.

The object group is automatically assigned to the first 3D model (#1) in the object list. This
is the default setting. If there are multiple 3D models, you can reassign the object group to
another 3D model.

                 1.    Go to the “3D models” tab.

                 2.    Select the desired object group in the object list.

                 3.    To reassign the selected object group, drag and drop it to another 3D model.


Note

•    You can assign multiple object groups to one 3D model.

•    If there are multiple 3D models and you delete a 3D model with an assigned object group,
   “3D model unassigned” is displayed in the object list.

•    If there are unassigned object groups, an error occurs, and marking cannot be performed.


Related topics

Create marking data for 3D marking (page 225)


ME-NAVIS2-OP-5                                                                                                227

---

## หน้า 228

20 3D marking function


20.4     Change the position


20.4.1 Change the position of an object group


To change the position and rotation of an object group that is assigned to a 3D model,
specify the x- and y-coordinate and a rotation angle.

The marking position of an object group is determined with respect to the local coordinate
origin. The coordinate origin is the center of the 3D model.

                  1.     Go to the “3D models” tab.

                  2.     Select the desired object group in the object list.
                         The settings of the selected object group are displayed in the parameter area.

                  3.     Specify any of the following parameters:
                         •   “X-movement [mm]”, “Y-movement [mm]”:
                             Enter a value to move the object group along the x- and y-axis with respect to the
                             center position of the 3D model (local coordinate origin).

                         •   “Rotation movement [°]”:
                             To rotate the object group, specify a rotation angle. The rotation center is the center
                             of the object group.

                         The updated position and rotation of the object group on the 3D model is displayed in
                         the 3D image view.


20.4.2 Change the position of a 3D model


To change the position of one 3D model, specify the x-, y- and z-coordinate. In the “File
settings” tab, you can change the position of all 3D models at once.

The 3D model is positioned in the global coordinate system with respect to the global
coordinate origin. The coordinate origin is the center of the marking field.


Change the position of a selected 3D model

                  1.     Go to the “3D models” tab.

                  2.     Select the desired 3D model in the object list.
                         The settings of the selected 3D model are displayed in the parameter area.

                  3.     Specify any of the following parameters: “Center X-position [mm]”, “Center Y-position
                         [mm]”, “Center Z-position [mm]”.
                         Enter a value to move the 3D model along the x-, y- and z-axis with respect to the center
                         of the marking field.
                         The updated position of the selected 3D model is displayed in the 3D image view.


228                                                                                                ME-NAVIS2-OP-5

---

## หน้า 229

20.5 Basic settings for 3D marking


Change the position of all 3D models in the marking file

                 1.    Select the “File settings” tab.

                 2.    Specify any of the following parameters:
                       •     “X-movement [mm]”, “Y-movement [mm]”, “Z-movement [mm]”:
                             Enter a value to move all 3D models along the x-, y- and z-axis with respect to the
                             center of the marking field.

                       •     “Rotation movement [°]”:
                             Specify an angle to rotate all 3D models around the z-axis with respect to the center
                             of the marking field.

                       The updated position and rotation of all 3D models is displayed in the 3D image view.


20.5    Basic settings for 3D marking


20.5.1 Mark on an inclined surface


For this example, we create a plane and specify the size, position, and rotation angle. We
also create a character object that we want to mark on the plane.


(2)
   (3)

   Y              (4)                     (3)
(1)                                                                             Y
   X       45°
   16mm
   Z
                                                                    +             -2mm         ABCD                X


                                                                                               -8mm
                                                                                         (5)
Y


20mm                  20mm


(1)   Global coordinate origin
(2)   3D model “Plane”
(3)   Local coordinate origin
(4)   “X-rotation angle [°]”
(5)   Reference point position (X, Y) of the character object
   (“X-position [mm]”, “Y-position [mm]”)


                 1.    On the “Marking settings” screen, create the marking object, that you want to mark on
                       the plane.
                       For this example, we create a character object with the following settings:
                             “Text”: ABCD
                             “Character height [mm]”: 4mm


ME-NAVIS2-OP-5                                                                                                 229

---

## หน้า 230

20 3D marking function


“Character width [mm]”: 3mm
“Character spacing [mm]”: 4mm
“X-position [mm]”: -8mm
“Y-position [mm]”: -2mm
                  2.     Select “3D” in the ribbon to open the 3D viewer.

                  3.     Select the “Plane” icon in the ribbon.
                         The “3D model settings” dialog is displayed.

                  4.     Specify the width and length of the plane.
                         “Width [mm]”: 30mm, “Length [mm]”: 10mm


                                   (1)                 (2)


                         (1)    Width
                         (2)    Length

                  5.     Select “OK”.
                         The 3D model is created and the object group with the character object is assigned to
                         the 3D model.

                  6.     Select the plane (“#1 Plane”) in the object list and specify the following parameters.
                               “Center X-position [mm]”: 20mm
                               “Center Y-position [mm]”: 20mm
                               “Center Z-position [mm]”: 16mm
                               “X-rotation angle [°]”: 45°

                  7.     Select the “Rotate” icon on the toolbar.


                         Rotate the 3D image view to check the 3D model and the marking data.


230                                                                                               ME-NAVIS2-OP-5

---

## หน้า 231

20.5 Basic settings for 3D marking


20.5.2 Mark on an uneven surface


For this example, we create two planes and specify the size and position. We also create two
different character objects that we want to mark on the planes.

   (2)
(1) H


   A
   B
   C
   D
(6)                                      (3)
   12


   L2
34


   W                   L1
(5)                            (4)


(1)     Height of plane No. 2: 16mm
(2)     Plane No. 2 with character object
(3)     Length of plane No. 2: 8mm
(4)     Length of plane No. 1: 14mm
(5)     Width: 40mm
(6)     Plane No. 1 with character object


The illustration shows the position of plane No. 1 (“#1 Plane”), and the corresponding marking data.


(2)

(1)                                                                          (2)

   Y
12

Y


   1234
34


   X
24mm
   X


Y


24mm
   X


(1)     Global coordinate origin
(2)     Local coordinate origin


ME-NAVIS2-OP-5                                                                                                      231

---

## หน้า 232

20 3D marking function


The illustration shows the position of plane No. 2 (“#2 Plane”), and the corresponding marking data.


(2)


(2)


   Y
A

   ’
   B
   C
(1)


   D
16mm                                                  Y
   Z’
   ABCD                  X


X
   -2mm


   ’
   -8mm
   35mm                                   (3)
   Y
   ’
24mm
   X
   ’


(1)     Global coordinate origin
(2)     Local coordinate origin
(3)     Reference point position (X, Y) of the character object
   (“X-position [mm]”, “Y-position [mm]”)


                  1.          On the “Marking settings” screen, create the two marking objects, that you want to
                              mark on the planes.
                              •   Settings for character object "1234":
                                      “Text”: 1234
                                      “Character height [mm]”: 4mm
                                      “Character width [mm]”: 3mm
                                      “Character spacing [mm]”: 4mm
                                      “X-position [mm]”: -8mm
                                      “Y-position [mm]”: -2mm

                                  The character object "1234" is assigned to object group No. 0 (“#0 Object group”).

                              •   Settings for character object "ABCD":
                                      “Text”: ABCD
                                      “Character height [mm]”: 4mm
                                      “Character width [mm]”: 3mm
                                      “Character spacing [mm]”: 4mm
                                      “X-position [mm]”: -8mm
                                      “Y-position [mm]”: -2mm

                                  Create a new object group and assign the character object "ABCD" to object group
                                  No. 1 (“#1 Object group”).

                  2.          Select “3D” in the ribbon to open the 3D viewer.

                  3.          Select the “Plane” icon in the ribbon to create plane No. 1.

                  4.          In the dialog, specify the width and length of plane No. 1.
                              “Width [mm]”: 40mm, “Length [mm]”: 14mm

                  5.          Select “OK”.
                              The 3D model is created and both object groups are automatically assigned to “#1
                              Plane”.


232                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 233

20.5 Basic settings for 3D marking


                 6.          Select “#1 Plane” in the object list and specify the following parameters.
                                “Center X-position [mm]”: 24mm
                                “Center Y-position [mm]”: 24mm
                                “Center Z-position [mm]”: 0mm
                 7.          Select the “Plane” icon in the ribbon to create plane No. 2.

                 8.          In the dialog, specify the width and length of plane No. 2.
                             “Width [mm]”: 40mm, “Length [mm]”: 8mm

                 9.          Select “OK”.
                             The 3D model is created and “#2 Plane” is displayed in the object list.

                 10.         Drag and drop the object group No. 1 (“#1 Object group”) to plane No. 2 (“#2 Plane”)
                             in order to assign the character object "ABCD" to plane No. 2.

                 11.         Select “#2 Plane” in the object list and specify the following parameters.
                                “Center X-position [mm]”: 24mm
                                “Center Y-position [mm]”: 35mm
                                “Center Z-position [mm]”: 16mm
                 12.         Select the “Rotate” icon on the toolbar.


                             Rotate the 3D image view to check the 3D models and the marking data.


20.5.3 Mark on a cylinder - Example 1


For this example, we create a cylinder and specify the size and position. We also create a
character object that we want to mark on the cylinder.


   (3)
(2)                                                        (3)
   Y
   Y


(1)                                                             -2mm       ABCD           X
   X


Z               10mm

(4)    -8mm

20mm
   X


Y


18mm


(1)    Global coordinate origin
(2)    Center of the 3D model
(3)    Local coordinate origin
(4)    Reference point position (X, Y) of the character object
   (“X-position [mm]”, “Y-position [mm]”)


ME-NAVIS2-OP-5                                                                                                  233

---

## หน้า 234

20 3D marking function


                  1.     On the “Marking settings” screen, create the marking object, that you want to mark on
                         the cylinder.
                         For this example, we create a character object with the following settings:
                               “Text”: ABCD
                               “Character height [mm]”: 4mm
                               “Character width [mm]”: 3mm
                               “Character spacing [mm]”: 4mm
                               “X-position [mm]”: -8mm
                               “Y-position [mm]”: -2mm

                  2.     Select “3D” in the ribbon to open the 3D viewer.

                  3.     Select the “Cylinder” icon.
                         The “3D model settings” dialog is displayed.

                  4.     Specify the following parameters:
                         “Surface”: “Convex”, “Length [mm]”: 15mm, “Diameter [mm]”: 20mm


                               (1) D
                                               L
                                                (2)

                         (1)    Diameter
                         (2)    Length

                  5.     Select “OK”.
                         The 3D model is created and the object group with the character object is assigned to
                         the 3D model.

                  6.     Select “#1 Cylinder” in the object list and specify the following parameters.
                               “Center X-position [mm]”: 20mm
                               “Center Y-position [mm]”: 18mm
                               “Center Z-position [mm]”: 10mm

                  7.     Select the “Rotate” icon on the toolbar.


                         Rotate the 3D image view to check the 3D model and the marking data.


234                                                                                               ME-NAVIS2-OP-5

---

## หน้า 235

20.5 Basic settings for 3D marking


20.5.4 Mark on a cylinder - Example 2


For this example, we create a cylinder and specify the size, position, and rotation angle. We
also create a character object that we want to mark on the cylinder.


   (3)
(2)
                                                          +                                       (2)
                                                                                                        Y        (5)
                                                                      (4)
(1)


X
   90°


   Y
   X
   Z
   9mm                                        -8mm
X


28mm
   Y


   (6)
18mm                                      2mm


(1)     Global coordinate origin
(2)     Local coordinate origin
(3)     Rotation of the 3D model around the z-axis (“Z-rotation angle [°]”)
(4)     Center of the 3D model
(5)     Rotation angle of the character object (“Rotation angle [°]”)
(6)     Reference point position (X, Y) of the character object
   (“X-position [mm]”, “Y-position [mm]”)


                 1.      On the “Marking settings” screen, create the marking object, that you want to mark on
                         the cylinder.
                         For this example, we create a character object with the following settings:
                              “Text”: ABCD
                              “Character height [mm]”: 4mm
                              “Character width [mm]”: 3mm
                              “Character spacing [mm]”: 4mm
                              “X-position [mm]”: 2mm
                              “Y-position [mm]”: -8mm
                              “Rotation angle [°]”: 90°

                 2.      Select “3D” in the ribbon to open the 3D viewer.

                 3.      Select the “Cylinder” icon.
                         The “3D model settings” dialog is displayed.

                 4.      Specify the following parameters:
                         “Surface”: “Convex”, “Length [mm]”: 24mm, “Diameter [mm]”: 18mm


ME-NAVIS2-OP-5                                                                                                          235

---

## หน้า 236

20 3D marking function


   D
   L                 (2)
(1)

(1)    Length
(2)    Diameter

                  5.     Select “OK”.
                         The 3D model is created and the object group with the character object is assigned to
                         the 3D model.

                  6.     Select “#1 Cylinder” in the object list and specify the following parameters.
                               “Center X-position [mm]”: 28mm
                               “Center Y-position [mm]”: 18mm
                               “Center Z-position [mm]”: 9mm
                               “Z-rotation angle [°]”: -90°

                  7.     Select the “Rotate” icon on the toolbar.


                         Rotate the 3D image view to check the 3D model and the marking data.


20.5.5 Mark on a horizontal cone


For this example, we create a horizontal cone and specify the size and position. We also
create a character object that we want to mark on the horizontal cone.


   (1)
(1)                   (2)                                    Y


   Z
   -8mm
Y


   -2mm                  X
X


Y


   -16mm
X


   (4)
-10mm                                                             -8mm
   (3)

(1)    Local coordinate origin
(2)    Global coordinate origin
(3)    Center of the 3D model
(4)    Reference point position (X, Y) of the character object
   (“X-position [mm]”, “Y-position [mm]”)


236                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 237

20.5 Basic settings for 3D marking


                 1.   On the “Marking settings” screen, create the marking object, that you want to mark on
                      the horizontal cone.
                      For this example, we create a character object with the following settings:
                            “Text”: ABCD
                            “Character height [mm]”: 4mm
                            “Character width [mm]”: 3mm
                            “Character spacing [mm]”: 4mm
                            “X-position [mm]”: -8mm
                            “Y-position [mm]”: -2mm

                 2.   Select “3D” in the ribbon to open the 3D viewer.

                 3.   Select the “Horizontal cone” icon.
                      The “3D model settings” dialog is displayed.

                 4.   Specify the following parameters:
                      “Surface”: “Convex”, “Length [mm]”: 20mm, “Top diameter [mm]”: 10mm, “Bottom
                      diameter [mm]”: 20mm

                                                          (2)
                                                    D1


                              D2
                        (1)
                                                L
                                                    (3)

                      (1)     Bottom diameter
                      (2)     Top diameter
                      (3)     Length

                 5.   Select “OK”.
                      The 3D model is created and the object group with the character object is assigned to
                      the 3D model.

                 6.   Select “#1 Horizontal cone” in the object list and specify the following parameters.
                            “Center X-position [mm]”: -10mm
                            “Center Y-position [mm]”: -16mm
                            “Center Z-position [mm]”: -8mm

                 7.   Select the “Rotate” icon on the toolbar.


                      Rotate the 3D image view to check the 3D model and the marking data.


ME-NAVIS2-OP-5                                                                                               237

---

## หน้า 238

20 3D marking function


20.5.6 Mark on a vertical cone


For this example, we create a vertical cone and specify the size and position. We also create
a character object that we want to mark on the vertical cone.


(1)
   (1)


Y
(2)


4mm                         Z


   X
X
   B          (4)


   4
   A
   CD 2 3
   1
   (6)
Y


   (5)
   30mm
-8mm

(3)

(1)    Local coordinate origin
(2)    Center of the 3D model
(3)    Global coordinate origin
(4)    “Arc radius [mm]”
(5)    “Character spacing angle [°]”
(6)    “Start angle [°]”

                  1.     On the “Marking settings” screen, create the marking object, that you want to mark on
                         the vertical cone.
                         For this example, we create a character object with the following settings:
                            “Text”: ABCD1234
                            “Character arrangement”: “Arc inside, char. spacing by angle”
                            “Character height [mm]”: 4mm
                            “Character width [mm]”: 3mm
                            “Arc radius [mm]”: 12mm
                            “Character spacing angle [°]”: 20°
                            “Start angle [°]”: -160°

                  2.     Select “3D” in the ribbon to open the 3D viewer.

                  3.     Select the “Vertical cone” icon.
                         The “3D model settings” dialog is displayed.

                  4.     Specify the following parameters:
                         “Surface”: “Convex”, “Height [mm]”: 8mm, “Top diameter [mm]”: 10mm, “Bottom
                         diameter [mm]”: 30mm


238                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 239

20.5 Basic settings for 3D marking


   (2)
D1

H (3)


   D2
(1)

(1)    Bottom diameter
(2)    Top diameter
(3)    Height

                 5.     Select “OK”.
                        The 3D model is created and the object group with the character object is assigned to
                        the 3D model.

                 6.     Select “#1 Vertical cone” in the object list and specify the following parameters.
                              “Center X-position [mm]”: -8mm
                              “Center Y-position [mm]”: 30mm
                              “Center Z-position [mm]”: 4mm

                 7.     Select the “Rotate” icon on the toolbar.


                        Rotate the 3D image view to check the 3D model and the marking data.


20.5.7 Mark on a sphere


For this example, we create a sphere and specify the size and position. We also create a
character object that we want to mark on the sphere.


(2)
   (2)
   Y


Y


(1)                                                 (3)
   X


-2mm          ABCD             X


   (4)
X


12mm
   Y


18mm                         -8mm


(1)    Global coordinate origin
(2)    Local coordinate origin
(3)    Center of the 3D model
(4)    Reference point position (X, Y) of the character object
   (“X-position [mm]”, “Y-position [mm]”)


ME-NAVIS2-OP-5                                                                                                  239

---

## หน้า 240

20 3D marking function


                  1.     On the “Marking settings” screen, create the marking object, that you want to mark on
                         the sphere.
                         For this example, we create a character object with the following settings:
                               “Text”: ABCD
                               “Character height [mm]”: 4mm
                               “Character width [mm]”: 3mm
                               “Character spacing [mm]”: 4mm
                               “X-position [mm]”: -8mm
                               “Y-position [mm]”: -2mm

                  2.     Select “3D” in the ribbon to open the 3D viewer.

                  3.     Select the “Sphere” icon.
                         The “3D model settings” dialog is displayed.

                  4.     Specify the following parameters:
                         “Surface”: “Convex”, “Diameter [mm]”: 24mm


                                      D
                                (1)

                         (1)    Diameter

                  5.     Select “OK”.
                         The 3D model is created and the object group with the character object is assigned to
                         the 3D model.

                  6.     Select “#1 Sphere” in the object list and specify the following parameters.
                               “Center X-position [mm]”: 12mm
                               “Center Y-position [mm]”: 18mm
                               “Center Z-position [mm]”: 0mm

                  7.     Select the “Rotate” icon on the toolbar.


                         Rotate the 3D image view to check the 3D model and the marking data.


240                                                                                              ME-NAVIS2-OP-5

---

## หน้า 241

21.1 Use functional characters


21     Functional character settings


21.1   Use functional characters

You can set functional characters such as date, time or counter for character objects, bar
code or 2D code objects. For TrueType objects, you cannot set functional characters.

Before you set a functional character, for instance in your character object, you must
configure its parameters in the “Function settings” tab.

The following procedure describes how to set a functional character for a character object.
The setting procedure of a functional character is the same for bar code or 2D code objects.

                 1.   Select the “Character” tool in the ribbon.

                 2.   Select “Direct input”.
                      The “Character” dialog opens.

                 3.   Select “Functional characters”.

                 4.   In the “Functional characters” dialog, select any of the following tabs to set the functional
                      characters.
                      •   “Date/time”

                      •   “Counter”

                      •   “Lot”

                      •   “Laser, speed” (not available for bar code and 2D code objects)

                      •   “External control”

                 5.   Specify the parameters of the functional character.
                 6.   Select “OK” to close the dialog and return to the “Character” dialog.
                      The functional character is inserted in the character string. Each functional character
                      starts with the single-byte character “%”.
                      To use the character “+” or “/” after a counter, enter “%+” or “%/”.
                      Check the functional characters in the “Preview” window.
                      To delete a functional character, delete the characters that follow the “%” character and
                      the "%" character itself.

                 7.   If required, continue to set more functional characters by selecting “Functional
                      characters”.


ME-NAVIS2-OP-5                                                                                                  241

---

## หน้า 242

21 Functional character settings


Related topics

Create a character object (direct input) (page 104)

Create a bar code object (page 159)

Create a 2D code object (page 181)

Functional characters for date and time (page 242)

Functional characters for counters (page 245)

Functional characters for lot numbers (page 246)

Functional characters for laser settings (page 247)

Functional characters for external control (page 248)


21.2     Functional characters for date and time

Use these functional characters to mark the automatically updated date and time. You can
specify the settings for the current and the expiry date and time.


Functional characters such as current date and time or lot are based on the system clock of the laser
marking system (“System settings” > “System clock configuration”). It may happen that the system
clock deviates from the accurate time due to errors of internal parts or low battery level.
Therefore, check the system clock in the laser marking system regularly to ensure that the date and
time are correct.


If you use the time hold function, the marking data for the functional characters for date/time
and lot are retained (not updated) for the duration of the time hold function. The time hold
function can be activated either by turning on the TIME HOLD IN (No. 22) input of the I/O
connector or by configuring the setting “System settings” > “Operation/information” > “Time
hold control” > “Activate until fixed time”. If the marking results of the functional characters
for date/time or lot indicate an unintended time, verify the settings of “System settings” >
“Operation/information” > “Time hold control” and the status of the TIME HOLD IN (No. 22)
input of the I/O connector. For details about the TIME HOLD IN input, refer to the “Setup and
Maintenance Guide”.


Settings

Specify the settings in the “Date/time” tab of the “Functional characters” dialog.

•   “Date/time”:
   You must specify the parameters for the expiry time in the “Function settings” tab in
   advance before you set the functional character.
   Select the current or the expiry date and time. For the expiry date and time, set the
   number that you configured in the “Function settings” tab. Select the expiry date to mark
   the date with a specified period being added to or subtracted from the current date.


242                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 243

21.2 Functional characters for date and time


Setting range: “Current date/time”, “Expiry time” (numbers “1” to “16”), “Expiry time”
(global numbers “17” to “32”)

•   “Number of characters”:
   Set the number of characters for the display of the date and time values.
   If the character number for the current or expiry date and time value exceeds the value
   set for “Number of characters”, the lower figure is marked. For example, if you set “2” for
   “Number of characters” and the expiry date and time value is 2003, “03” is marked.
   Setting range: “1” to “9”

•   “Date/time type”:
   Set the period type for date and time.
   If “Week” or “Year (Week-based)” is set, you must first specify the settings for “First day of
   the week” and “First week of the year” in the “System settings” screen.
   ‒ “Year”: Based on the Gregorian calendar year (standard).

‒ “Year (Week-based)”: Variation of the Gregorian calendar year that is based on a
  whole number of weeks every year. It may happen that the first week of the year
  contains a few last days of the previous year, or that the last week of the previous
  year contains January 1.

‒ “Month”

‒ “Day”

‒ “Hour (24)”: The time is displayed in 24-hour notation (0 to 23).

‒ “Hour (12)”: The time is displayed in 12-hour notation (0 to 11).

‒ “AM/PM”: The 12-hour system divides the 24 hours of a day into two periods lasting
  12 hours each. The first 12-hour period runs from 0:00:00 (midnight) to 11:59:59
  (noon). The numbers are followed by “AM” (ante meridiem: before noon). The second
  12-hour period covers the 12 hours from 0:00:00 (noon) to 11:59:59 (midnight). The
  numbers are followed by “PM” (post meridiem: after noon).
‒ “Minute”

‒ “Second”

‒ “Week”

‒ “365 days”: Input “1” for January 1, “2” for January 2, “365” for December 31 (for a
  normal year), etc.

•   “Zero indication”:
   Specify if the date and time values are marked with or without zero fill.
   ‒ “Zero fill”: With zero fill, right-aligned

‒ “Left align”: Without zero fill, left-aligned with spaces on the right

‒ “Right align”: Without zero fill, right-aligned with spaces on the left

‒ “No spaces”: Without spaces, left-aligned


Character strings representing the functional characters for date and time

•   Date and time with zero fill: %0N:Xn


ME-NAVIS2-OP-5                                                                                                 243

---

## หน้า 244

21 Functional character settings


•   Date and time without zero fill, right-aligned: %_N:Xn (the underscore (_) represents a
   space)

•   Date and time without zero fill, left-aligned: %N_:Xn (the underscore (_) represents a
   space)
•   Date and time without spaces: %N-:Xn

•   AM (ante meridiem)/PM (post meridiem): %APM:n

Item            Displayed characters          Description

N               “1”–“9”                       Number of characters

X               Unit:

Y                             Year

I                             Year (week-based)

M                             Month

D                             Day

H                             Hour (24 hours)

h                             Hour (12 hours)

m                             Minute

s                             Second

w                             Week

J                             365 days

n               0                             Current date/time

“1”–“9”                       Expiry time numbers “1” to “9”

“A”–“G”                       Expiry time numbers “10” to “16”

“H”–“W”                       Global expiry time numbers “17” to “32”


Related topics

Set the date and time (page 301)

Change calendar settings (page 302)

Configure parameters for the expiry date and time function (page 254)

Use functional characters (page 241)

Use the time hold function (page 306)


244                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 245

21.3 Functional characters for counters


21.3    Functional characters for counters

Use these functional characters to mark consecutive numbers according to the specified
counter configuration.


Settings

Specify the settings in the “Counter” tab of the “Functional characters” dialog.

•   “Counter No.”:
   You must specify the parameters for the counter in the “Function settings” tab in advance,
   before you set the functional character. Select the counter number that you configured in
   the “Function settings” tab.
   Setting range: “0” to “15”, “16 (global)” to “31 (global)”

•   “Number of characters”:
   Set the number of characters for the display of the counter value.
   If the character number for the counter value exceeds the value set for “Number of
   characters”, the lower figure is marked. For example, if you set “2” for “Number of
   characters” and the counter value is 1234, “34” is marked.
   Setting range: “1” to “9”

•   “Counting base”:
   Select the display notation from binary to base 36 system.
   Setting range: “Base 2” to “Base 36 (Z)”

•   “Offset”:
   Specify a counter offset by entering a value in the text box.
   Setting range: “0” to “9”

•   “Zero indication”:
   Specify if the counter values are marked with or without zero fill.
   ‒ “Zero fill”: With zero fill, right-aligned

‒ “Left align”: Without zero fill, left-aligned with spaces on the right

‒ “Right align”: Without zero fill, right-aligned with spaces on the left

‒ “No spaces”: Without spaces, left-aligned


Character strings representing the functional characters for counters

•   Counter with zero fill: %0N:CnY/Z

•   Counter without zero fill, right-aligned: %_N:CnY/Z (the underscore (_) represents a
   space)

•   Counter without zero fill, left-aligned: %N_:CnY/Z (the underscore (_) represents a space)

•   Counter without spaces: %N-:CnY/Z


ME-NAVIS2-OP-5                                                                                                245

---

## หน้า 246

21 Functional character settings


Item            Displayed characters             Description

N               “1”–“9”                          Number of characters

n               “0”–“9”                          Counter No. 0 to 9

“A”–“F”                          Counter No. 10 to 15

“G”–“V”                          Global counter No. 16 to 31

Y               “+1”–“+9”                        Counter offset.
   This character is not used if no offset is set.

Z               “1”–“9”, “A”–“Z”                 Counting base number.
   “1” represents base 2, “2” represents base 3, etc.
   For decimal numbers, the “/Z” part is omitted.


Related topics

Configure parameters for the counter function (page 252)

Use functional characters (page 241)


21.4     Functional characters for lot numbers

Use the lot number function to replace the marking characters of time, date or counter with
your own text.


Functional characters such as current date and time or lot are based on the system clock of the laser
marking system (“System settings” > “System clock configuration”). It may happen that the system
clock deviates from the accurate time due to errors of internal parts or low battery level.
Therefore, check the system clock in the laser marking system regularly to ensure that the date and
time are correct.


If you use the time hold function, the marking data for the functional characters for date/time
and lot are retained (not updated) for the duration of the time hold function. The time hold
function can be activated either by turning on the TIME HOLD IN (No. 22) input of the I/O
connector or by configuring the setting “System settings” > “Operation/information” > “Time
hold control” > “Activate until fixed time”. If the marking results of the functional characters
for date/time or lot indicate an unintended time, verify the settings of “System settings” >
“Operation/information” > “Time hold control” and the status of the TIME HOLD IN (No. 22)
input of the I/O connector. For details about the TIME HOLD IN input, refer to the “Setup and
Maintenance Guide”.


Settings

Specify the settings in the “Lot” tab of the “Functional characters” dialog.


246                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 247

21.5 Functional characters for laser settings


You must specify the parameters for the lot configuration number in the “Function settings”
tab in advance, before you set the functional character. For “Lot configuration No.”, select the
lot configuration number that you configured in the “Function settings” tab.

Setting range: “0” to “15”, “16 (global)” to “31 (global)”


Character string representing the functional characters for lot numbers

Lot configuration number: %SFT:n

Item          Input character string             Description

n             “0”–“9”                            Lot configuration numbers “0” to “9”

“A”–“F”                            Lot configuration numbers “10” to “15”

“G”–“V”                            Global lot configuration numbers “16” to “31”


Related topics

Set the date and time (page 301)

Change calendar settings (page 302)

Configure parameters for the lot number function (page 257)

Use functional characters (page 241)

Use the time hold function (page 306)


21.5    Functional characters for laser settings

Use these functional characters to mark the set values for laser settings such as laser
power or scan speed. This function facilitates checking the marking quality for several laser
settings.

The marked values for laser settings are right-aligned and displayed with five digits including
the decimal point.

To mark the values for laser power and scan speed at once, you must set each functional
character in your object.


Settings

Specify the settings in the “Laser, speed” tab of the “Functional characters” dialog.

For “Laser, speed”, select the value that you want to mark.

•   “Laser power”: Marks the laser power value that is set in the “Laser settings” tab.
   If the laser power of the object is corrected, the calculated result value is marked.

•   “Scan speed”: Marks the scan speed value that is set in the “Laser settings” tab.


ME-NAVIS2-OP-5                                                                                                    247

---

## หน้า 248

21 Functional character settings


If the scan speed of the object is corrected, the calculated result value is marked.

•   “Pulse cycle” (LP-RF, LP-RV, LP-ZV): Marks the pulse cycle value that is set in the “Laser
   settings” tab.
   If the pulse cycle of the object is corrected, the calculated result value is marked.


Character strings representing the functional characters for laser settings

These functional characters cannot be used in the character strings of bar code and 2D code
objects.

•   Laser power: %POWER

•   Scan speed: %SPEED

•   Laser pulse cycle (LP-RF, LP-RV, LP-ZV): %PULSE


Related topics

Use functional characters (page 241)


21.6     Functional characters for external control

Use these functional characters to configure the marking data depending on the control
method (via I/O signals, communication commands or network communication).

The following external input functions cannot be set together in one file:

•   Character entry by SIN command and Register function (registered characters switching
   via I/O connector)

•   Character entry by SIN command and Marking offset via I/O signal

•   Register function (registered characters switching via I/O connector) and Marking offset
   by SEO command

•   LP-ZV: 3D marking and Marking offset via I/O signal


Register function (registered characters switching via I/O connector) and character entry by
SIN command are not available in RUN mode.

Register function (registered characters switching via I/O connector) and character entry by
SIN command are not available for marking at regular intervals and multiple trigger mode.

For details about the character entry by SIN command, refer to the “Serial Communication
Command Guide”.

For details about the register function (registered characters switching via I/O connector),
refer to the “Setup and Maintenance Guide”.


248                                                                                               ME-NAVIS2-OP-5

---

## หน้า 249

21.6 Functional characters for external control


Settings

Specify the settings in the “External control” tab of the “Functional characters” dialog.

•   “Registered characters (via I/O connector)”:
   Select this function to switch character strings using the inputs D0 IN to D15 IN of the I/
   O connector. The character strings must be configured in advance and assigned to the
   numbers that correspond to the inputs D0 IN to D15 IN. The marking data is selected
   from D0 IN to D15 IN using I/O signals.
   ‒ “Registration table No.”:
   Before you set a functional character for registered characters, you must configure
   the parameters of the registration table in the “Function settings” tab.
   Select the table number that you configured in the “Function settings” tab.
   Setting range: Depends on the settings for “Input method” in the “Function settings”
   tab.
   — For “Input method” > “8-bit x 2”: “0 (D0-D7)”, “1 (D8-D15)”

— For “Input method” > “4-bit x 4”: “0 (D0-D3)”, “1 (D4-D7)”, “2 (D8-D11)”, “3 (D12-
  D15)”

•   “Characters specified by SIN command”:
   Select this option to use the character entry by SIN command for character objects and
   bar code/2D code objects. Send the SIN command for each marking process.
   Characters for which the option “Characters specified by SIN command” is used, are
   replaced with “○” when test marking is performed.
   ‒ “Character No.”:
   Select the character string number that is specified in the communication command
   data.
   Setting range: “0” to “15”

‒ “Number of characters”:
   Specify the maximum number of characters per string. This number is used only for
   the display in the marking image editor.
   Setting range: “0” to “99”


Character strings representing the functional characters for the register function (registered
characters switching via I/O connector)

Registration table number: %INP:n

Item          Input character string           Description

n             “0”–“3”                          Registration table numbers “0” to “3”


Character strings representing the functional characters for character entry per trigger (SIN
command)

Maximum number of characters per string and character number: %MM:Sn


ME-NAVIS2-OP-5                                                                                                 249

---

## หน้า 250

21 Functional character settings


Item            Input character string         Description

MM              “00”–“99”                      Maximum number of characters per string

n               “0”–“9”                        Character numbers “0” to “9”

“A”–“F”                        Character numbers “10” to “15”


Related topics

Configure parameters for the register function (registered characters) (page 259)

Use functional characters (page 241)


250                                                                                              ME-NAVIS2-OP-5

---

## หน้า 251

22.1 Functions overview


22     Function settings


22.1   Functions overview

Specify the functions in the “Function settings” tab, before you enter them with a functional
character in a character object or bar code/2D code object.

Under “Function settings” > “Current file”, configure the function which can be applied via
functional characters in the current file.

•   “Counter”

•   “Expiry time”

•   “Lot”

•   “Reference character strings”
•   “Registered characters”

•   “External offset”

Under “Function settings” > “For all files”, configure the function which can be applied via
functional characters in all files. Function settings for all files can only be set in online mode
or when editing a backup file.

•   “Counter”

•   “Expiry time”

•   “Lot”

•   “Reference character strings”


Related topics

Configure parameters for the expiry date and time function (page 254)

Configure parameters for the counter function (page 252)

Configure parameters for the lot number function (page 257)

Configure parameters for the register function (registered characters) (page 259)

Configure parameters for the external offset function (page 261)

Specify reference character strings (page 263)


ME-NAVIS2-OP-5                                                                                                  251

---

## หน้า 252

22 Function settings


22.2     Configure parameters for the counter function

You must configure the parameters for the counter in the “Function settings” tab in advance,
before you set the functional character, for instance in your character object.

Use the counter function to mark consecutive numbers according to the specified counter
configuration.

The counter does only work, if you do the following:

•    First configure the parameters for the counter in the “Function settings” tab.

•    Then you must insert the functional character of your specified counter in the text of your
   marking object (character object or bar code/2D code object).


If the marking of a counter value is interrupted for instance by an alarm, check the counter value in
the marking file before resuming the marking process.


•    The counter value is not updated during test marking.

•    If the counter value is updated in remote mode or RUN mode, the current counter value
   is saved without overwriting the file. To check the current counter value, go to “Marking
   settings” > “Function settings” and select your counter number, e.g. “Counter 1”. The
   current counter value is displayed in the “Current value” text box.


                   1.    Select the “Function settings” tab.

                   2.    Select “Current file” or “For all files”.
                         •   In the “Current file” tab, you can specify counter configurations that can be used in
                             the current file.

                         •   In the “For all files” tab, you can specify counter configurations that can be used in all
                             files. If you want to mark consecutive numbers across the different marking files, use
                             the counter for all files.

                   3.    Select “Counter” and “Add”.

                   4.    In the dialog, specify a number for “Counter No.”.
                         Setting range:
                         •   “Current file”: “0” to “15”

                         •   “For all files”: “16” to “31”

                   5.    Select “OK”.

                   6.    Specify any of the following parameters:
                         •   “Current value”:
                             Specify the first value to be marked. Select a value between the starting value and
                             end value.
                             Setting range: “0” to “999999999”

                         •   “Starting value”, “End value”:


252                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 253

22.2 Configure parameters for the counter function


Specify the starting value and end value of the counter. If the counter value reaches
the specified end value, the marking process continues with the starting value of the
counter.
If the starting value is larger than the end value, the counter acts as a down counter.
Setting range: “0” to “999999999”

•   “Step value”:
   Specify the number of steps per up or down count.
   Setting range: “0” to “999999999”

•   “Count timing”:
   Specify the timing to update the current value.
   ‒ “Trigger signal”:
   The counter value is increased or decreased by each marking trigger signal.
   If on-the-fly marking at regular intervals is set, the counter value is updated with
   every marking process.
   If you use a counter for your step & repeat object and “Count individually” is set
   to “ON”, the counter value is updated for each individual step.

‒ “Counter 0” to “Counter 15”, “Counter (global) 16” to “Counter (global) 31”:
   If the counter value reaches the specified end value, the counter continues to
   count up or down.

Example
You want to mark the same counter value for two or more marking cycles as shown
in the following table.

Marking cycle          Marked counter value

1                      000

2                      000

3                      001

4                      001

5                      002

6                      002

etc.                   etc.


Set 2 counters with the following parameters:
 ‒ Counter 0 (used in your character object): “Starting value”: 0, “End value”: 999,
   “Step value”: 1, “Count timing”: “Counter 1”

‒ Counter 1 (not used in the character object): “Starting value”: 1, “End value”: 2,
  “Step value”: 1, “Count timing”: “Trigger signal”

For “Count timing” of the counter that is used in your character object, you must set
the other counter number.

•   “Reset at date change”:
   If you select this check box, the counter is reset when the date of the system clock is
   changed.


ME-NAVIS2-OP-5                                                                                               253

---

## หน้า 254

22 Function settings


‒ When using the time hold function, the counter value is not reset even after
  0:00 AM while the function is active. The time hold function can be activated
  either by turning on the TIME HOLD IN (No. 22) input of the I/O connector or by
  configuring the setting “System settings” > “Operation/information” > “Time hold
  control” > “Activate until fixed time”.

‒ The counter reset at date change cannot be used with on-the-fly marking at
  regular intervals or on-the-fly marking with multiple triggers.

‒ If the counter is reset at date change during on-the-fly marking in single trigger
  mode, the marking trigger ready status momentarily turns off, and the next
  marking process cannot be executed due to warning E751.

•   Delete a counter configuration:
   Select the counter configuration number under “Counter”, for example “Counter 1”,
   and select “Delete”.


Related topics

Use functional characters (page 241)

Functional characters for counters (page 245)

Use the time hold function (page 306)


22.3     Configure parameters for the expiry date and time function

You must configure the parameters for the expiry time in the “Function settings” tab in
advance, before you set the functional character, for instance in your character object.

The expiry time function is used to mark the date with a specified period being added to or
subtracted from the current date.


Functional characters such as current date and time or lot are based on the system clock of the laser
marking system (“System settings” > “System clock configuration”). It may happen that the system
clock deviates from the accurate time due to errors of internal parts or low battery level.
Therefore, check the system clock in the laser marking system regularly to ensure that the date and
time are correct.


                   1.   Select the “Function settings” tab.

                   2.   Select “Current file” or “For all files”.
                        •   In the “Current file” tab, you can specify the expiry time configurations that can be
                            used in the current file.

                        •   In the “For all files” tab, you can specify the expiry time configurations that can be
                            used in all files.

                   3.   Select “Expiry time” and “Add”.


254                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 255

22.3 Configure parameters for the expiry date and time function


                 4.   In the dialog, specify a number for “Expiry time No.”.
                      Setting range:
                      •   “Current file”: “1” to “16”

                      •   “For all files”: “17” to “32”
                 5.   Select “OK”.

                 6.   “Number of periods”:
                      Specify the number of periods being added to or subtracted from the current date and
                      time. You can input a negative value to set a date and time in the past.
                      Example: If you set “45 days”, and today is January 1st, the date “February 15th” will be
                      marked.
                      Setting range: “-999” to “999”

                 7.   “ Period unit”:
                      Specify the unit of the period being added to or subtracted from the current date and
                      time.
                      Setting range: “Year”, “Month”, “Day”, “Hour”, “Minute”
                      If “Year” or “Month” is set and the calculated expiry day does not exist, the day will be
                      adjusted as shown in the following table.

                      Calculated day                      Adjusted day                                          Remarks

                      January 0th                         December 31st of the last year

                      X “month” 0th                       The last day of (X-1) “month”.                        X = 2 to 12

                      X “month” 31st                      The last day of (X-1) “month”.                        X = 4, 6, 9, 11

                      February 29th to 31st               The last day of February.

                 8.   “Today included”:
                      Specify whether the current day is being included in the base date for addition or
                      subtraction.
                      You can make this setting if “Year” or “Month” is set for “ Period unit”.
                      If “Today included” is not selected, the result of the calculated expiry day is the same
                      day of the year or the month. If “Today included” is enabled, the result of the calculated
                      expiry day is the previous day (or the next day for negative values).
                      Example: If you set “+1 month”, the days in the following table will be marked.

                                                                               Calculated expiry day
                      Today
                                                          Today not included               Today included

                      January 1st                         February 1st                     January 31st

                      January 29th                        February 28th
                                                                          1)               February 28th

January 30th                        February 28th
   1)
   February 28th
   1)


January 31st                        February 28th
   1)
   February 28th
   1)


February 1st                        March 1st                        February 28th
   1)


February 28th                       March 28th                       March 27th

March 1st                           April 1st                        March 31st


ME-NAVIS2-OP-5                                                                                                                255

---

## หน้า 256

22 Function settings


   Calculated expiry day
Today
   Today not included              Today included

March 31st                        April 30th                      April 30th

April 1st                         May 1st                         April 30th

April 30th                        May 30th                        May 29th

May 1st                           June 1st                        May 31st

May 31st                          June 30th                       June 30th

June 1st                          July 1st                        June 30th

June 30th                         July 30th                       July 29th

July 1st                          August 1st                      July 31st

July 31st                         August 31st                     August 30th

August 1st                        September 1st                   August 31st

August 31st                       September 30th                  September 30th

September 1st                     October 1st                     September 30th

September 30th                    October 30th                    October 29th

October 1st                       November 1st                    October 31st

October 31st                      November 30th                   November 30th

November 1st                      December 1st                    November 30th

November 30th                     December 30th                   December 29th

December 1st                      January 1st                     December 31st

December 31st                     January 31st                    January 30th

                        1)      For leap years, the expiry date is “February 29th”.


Delete an expiry time configuration:
•     Select an expiry time configuration number under “Expiry time”, for example “Expiry
   time 1”, and select “Delete”.


Related topics

Use functional characters (page 241)

Functional characters for date and time (page 242)


256                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 257

22.4 Configure parameters for the lot number function


22.4   Configure parameters for the lot number function

You must configure the parameters for the lot number function in the “Function settings” tab
in advance, before you set the functional character, for instance in your character object.

Use the lot number function to replace the marking characters of time, date, or counter with
your own text.


Functional characters such as current date and time or lot are based on the system clock of the laser
marking system (“System settings” > “System clock configuration”). It may happen that the system
clock deviates from the accurate time due to errors of internal parts or low battery level.
Therefore, check the system clock in the laser marking system regularly to ensure that the date and
time are correct.


                 1.    Select the “Function settings” tab.

                 2.    Select “Current file” or “For all files”.
                       •   In the “Current file” tab, you can specify lot configurations that can be used in the
                           current file.

                       •   In the “For all files” tab, you can specify lot configurations that can be used in all
                           files.

                 3.    Select “Lot” and “Add”.

                 4.    In the dialog, specify a number for “Lot configuration No.”.
                       Setting range:
                       •   “Current file”: “0” to “15”

                       •   “For all files”: “16” to “31”

                 5.    Select “OK”.

                 6.    “Lot type”:
                       Set whether the lot number is controlled by the current date or time, an expiry time
                       setting, or a counter.
                       If “Counter” is set for “Lot type”, you can specify a maximum of 60 lot characters.
                       Setting range: “Current date/time”, “Expiry time 1” to “Expiry time 32”, “Counter 0” to
                       “Counter 31”

                 7.    “Lot unit”:
                       Select the unit for the switching of lot numbers.
                       If “Week” or “Year (Week-based)” is set, you must first specify the settings for “First
                       day of the week” and “First week of the year” in the “System settings” screen.
                       The following list shows the maximum number of periods that can be specified for
                       each time unit.
                       •   “Year”, “Year (Week-based)”: max. 60

                       •   “Month”: max. 12

                       •   “Day”: max. 31


ME-NAVIS2-OP-5                                                                                                     257

---

## หน้า 258

22 Function settings


•   “Year/month”: max. 60

•   “Month/day”: max. 20

•   “Day of week”: max. 7
•   “Hour”: max. 24

•   “Minute”: max. 60

•   “Hour/minute”: max. 60

•   “Week”: max. 54

                   8.       Specify when marking of the specified lot character string must start and end. Enter
                            the values in the columns “From” and “To”.
                            The value for the period end (column “To”) must be equal or larger than the period
                            start value (column “From”).
                            If the set start and end values span several intervals, you must split the setting into
                            two or more periods.
                            Examples
                            •   The lot unit is “Hour” and you want to set the period from 22:00 to 3:00 of the next
                                day. The hour interval is defined as a period of 24 hours. In this case you must
                                specify two separate periods. The first period covers the 2 hours from 22:00 to
                                23:59 and the second one runs from 0:00 to 3:00.

                            •   The lot unit is “Day of week” and you want to set the period from Saturday to
                                Sunday. The week interval is defined as a period of 7 days from Sunday (start) to
                                Saturday (end). If you set “From Saturday To Sunday”, the lot function does not
                                work. In this case you must set two separate periods, “From Saturday To Saturday”
                                and “From Sunday To Sunday”.

                   9.       Double-click on the respective row to add or edit the lot character string for a period
                            (max. 9 characters).
                            Setting range: alphanumeric characters, symbols, user-defined characters, Japanese
                            or Simplified Chinese characters
                            •   Select “User-defined characters”, to insert a user-defined character.

                            •   You cannot set functional characters such as date/time or counter in the lot
                                character strings.

                            •   To use Japanese or Simplified Chinese characters, specify the character set under
                                “East Asian characters” in “File settings”.

                   10.      Select “OK” to close the dialog.
                            The specified lot character string is displayed in the column “Lot character”.


Delete a lot configuration:

•     Select the lot configuration number under “Lot”, for example “Lot 1”, and select “Delete”.


Example

Instead of marking the month names, you want to use a three-letter abbreviation for each
month.


258                                                                                                ME-NAVIS2-OP-5

---

## หน้า 259

22.5 Configure parameters for the register function (registered characters)


•   Replace “January” with the lot character “JAN”.

•   Replace “February” with the lot character “FEB”.

•   Replace “March” with the lot character “MAR”.
•   etc.

Set the following parameters:

•   “Lot type”: “Current date/time”

•   “Lot unit”: “Month”

•   Input the period and lot character as shown in the following table.

“From”        “To”           “Lot character”

1             1              JAN

2             2              FEB

3             3              MAR

4             4              APR

5             5              MAY

6             6              JUN

7             7              JUL

8             8              AUG

9             9              SEP

10            10             OCT

11            11             NOV

12            12             DEC


Related topics

Use functional characters (page 241)

Functional characters for lot numbers (page 246)

Set a user-defined character (page 106)

Change calendar settings (page 302)

Specify the East Asian character set (page 265)


22.5   Configure parameters for the register function (registered characters)

Select the register function (registered characters) to switch character strings using the
inputs D0 IN to D15 IN of the I/O connector. The character strings must be configured in
advance and assigned to the numbers that correspond to the inputs D0 IN to D15 IN.

For details about I/O control, refer to the “Setup and Maintenance Guide”.


ME-NAVIS2-OP-5                                                                                                 259

---

## หน้า 260

22 Function settings


The register function (registered characters) cannot be set together with the following
functions in one file:

•    Character entry by SIN command
•    Marking offset by SEO command

•    On-the-fly marking at regular intervals

•    On-the-fly marking with multiple triggers

                   1.    Select the “Function settings” tab.

                   2.    Select “Current file” and “Registered characters”.

                   3.    For “Input method”, specify the method of assignment for the selected record number.
                         •   “8-bit x 2”:
                             Creates 2 tables for the registered characters. 16 bits from D0 IN to D15 IN are
                             divided into two groups, D0 IN to D7 IN and D8 IN to D15 IN. Each group can contain
                             a maximum of 256 registered character strings that are assigned to record numbers
                             0 to 255.
                         •   “4-bit x 4”:
                             Creates 4 tables for the registered characters. 16 bits from D0 IN to D15 IN are
                             divided into four groups, D0 IN to D3 IN, D4 IN to D7 IN, D8 IN to D11 IN and D12 IN
                             to D15 IN. Each group can contain a maximum of 16 registered character strings that
                             are assigned to record numbers 0 to 15.

                   4.    Select a registration table to display the corresponding record numbers and registered
                         character strings.
                         •   There are 2 registration tables if “Input method” > “8-bit x 2” is set.
                             “Registration table 0 (D0-D7)”: Lower 8 bits (D0 IN to D7 IN)
                             “Registration table 1 (D8-D15)”: Higher 8 bits (D8 IN to D15 IN)

                         •   There are 4 registration tables if “Input method” > “4-bit x 4” is set.
                             “Registration table 0 (D0-D3)”: 4 bits (D0 In to D3 IN)
                             “Registration table 1 (D4-D7)”: 4 bits (D4 IN to D7 IN)
                             “Registration table 2 (D8-D11)”: 4 bits (D8 IN to D11)
                             “Registration table 3 (D12-D15)”: 4 bits (D12 IN to D15)

                   5.    To add or edit a registered character string, double-click on a table row.

                   6.    In the dialog, enter the text (max. 9 characters).
                         Setting range: alphanumeric characters, symbols, user-defined characters, Japanese or
                         Simplified Chinese characters
                         •   Select “User-defined characters”, to insert a user-defined character.

                         •   You cannot set functional characters such as date/time or counter in the registered
                             character strings.

                         •   To use Japanese or Simplified Chinese characters, specify the character set under
                             “East Asian characters” in “File settings”.

                   7.    Select “OK” to close the dialog.
                         The specified registered character string is displayed next to the record number.


260                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 261

22.6 Configure parameters for the external offset function


                 8.    Continue to specify registered character strings for other record numbers.
                       Available record numbers:
                       •   “Input method” > “8-bit x 2”: 0 to 255

                       •   “Input method” > “4-bit x 4”: 0 to 15


Related topics

Functional characters for external control (page 248)

Specify the East Asian character set (page 265)

Set a user-defined character (page 106)


22.6   Configure parameters for the external offset function

The external offset function is used to adjust the marking position and laser power for all data
in the marking file.

The external offset function cannot be used with the following functions:

•    On-the-fly marking at regular intervals

•    On-the-fly marking with multiple triggers

The following external input functions cannot be set together in one file:

•    External offset function via I/O connector and character entry by SIN command

•    External offset function by SEO command and the register function (registered characters
   switching via I/O connector)

•    LP-ZV: External offset function via I/O connector and 3D marking

For details about I/O control, refer to the “Setup and Maintenance Guide”.


                 1.    Select the “Function settings” tab.

                 2.    Select “Current file” and “External offset”.

                 3.    For “Input method”, specify the input method (I/O connector or SEO command) for the
                       offset value.
                       •   “OFF”: The external offset function is disabled.

                       •   “Lower 10 bits”: Set a maximum of 1024 offset values (0 to 1023) in one coordinate
                           table using the lower 10 bits (D0 IN to D9 IN).

                       •   “Lower 8 bits”: Set a maximum of 256 offset values (0 to 255) in one coordinate table
                           using the lower 8 bits (D0 IN to D7 IN).

                       •   “Lower 4 bits”: Set a maximum of 16 offset values (0 to 15) in one coordinate table
                           using the lower 4 bits (D0 IN to D3 IN).

                       •   “Using SEO command”: Use this setting to specify the offset values by SEO
                           command.


ME-NAVIS2-OP-5                                                                                                261

---

## หน้า 262

22 Function settings


For details about the marking offset function by SEO command, refer to the “Serial
Communication Command Guide”.

For “Lower 10 bits”, “Lower 8 bits” or “Lower 4 bits”, the table with record numbers and
specified offset values is displayed.
                   4.   Enter a record number for “Offset number displayed in image”.
                        Depending on the specified offset values for the record number, the marking data is
                        positioned in the marking image editor.

                   5.   To add or edit the offset values, double-click on a table row.

                   6.   In the “External offset” dialog, specify any of the following parameters.
                        You can specify different parameters to correct the marking position.
                        The following figure shows these parameters.
                                                 (3)


                                                +Z
                                                           (2)
                                       -X


                                                       +
                                                       Y


                        (5) +                                       - (4)
                                        -Y


                                                       +
                                                         X


                                                           (1)
                                                 -Z


                        (1)    X-movement
                        (2)    Y-movement
                        (3)    Z-movement
                        (4)    Rotation (-)
                        (5)    Rotation (+)

                        •     “X-movement [mm]”, “Y-movement [mm]”:
                              Enter a value to move all marking data in the file along the x-axis and y-axis

                        •     “Z-movement [mm]” (LP-GS except LP-GS051-L):
                              Enter a value to position all marking data in the file along the z-axis.
                              For LP-ZV, it is not possible to specify the Z-movement via I/O connector. To specify
                              the Z-movement externally, use the SEO command.

                        •     “Rotation movement [°]”:
                              Specify an angle to rotate all marking data in the file. The rotation center is the
                              center of the marking field. Enter a positive value for counterclockwise rotation and a
                              negative value for clockwise rotation.

                        Correct the laser power:
                        •     “Laser power correction [%]”:
                              To correct the laser power of all marking data in the file, enter a value in the text box.
                              The correction ratio is calculated based on the value set as 100% in “Laser settings”.

                   7.   Select “OK” to close the dialog.
                        The specified offset values are displayed next to the record number.


262                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 263

22.7 Specify reference character strings


                 8.   Continue to specify offset values for other record numbers.
                      Available record numbers:
                          “Input method” > “Lower 10 bits”: 0 to 1023
                          “Input method” > “Lower 8 bits”: 0 to 255
                          “Input method” > “Lower 4 bits”: 0 to 15


22.7   Specify reference character strings

Specify character strings as reference character strings, which can be commonly used
across character objects in the current file or in all files.

                 1.   Select the “Function settings” tab.

                 2.   Select “Current file” or “For all files”.
                      •   In the “Current file” tab, you can set character strings that can only be used in the
                          current file.

                      •   In the “For all files” tab, you can set character strings that can be used in all files.
                          Reference character strings for all files can only be set in online mode or when
                          editing a backup file.

                 3.   Select “Reference character strings” to display the list with all reference character
                      strings.
                      In the “Current file” tab, the character string numbers from 1 to 100 are displayed.
                      In the “For all files” tab, the character string numbers from 101 to 200 are displayed.

                 4.   To add or edit a reference character string, double-click on a table row.

                 5.   In the dialog, enter a text or change the existing text (max. 99 characters).
                      •   Select “Functional characters”, to specify functional characters such as date or
                          counter.

                      •   Select “User-defined characters”, to insert a user-defined character.

                      •   To set the percent sign “%” as a character, input “%%”.

                      •   To use Japanese or Simplified Chinese characters, specify the character set under
                          “East Asian characters” in “File settings”.

                 6.   Select “OK”.
                      The specified reference character string is displayed in the list.


Related topics

Create a character object (reference list) (page 105)


ME-NAVIS2-OP-5                                                                                                       263

---

## หน้า 264

23 File setting


23        File setting


23.1      Position, rotate and mirror all objects in a file

In the “File settings” tab, you can position, rotate, or mirror all objects in a marking file.

•   Go to the “Marking settings” screen and select “File settings”.

•   You can specify different parameters to correct the marking position.
   The following figure shows these parameters.
   The reference point of the movement is the center of the marking field.
   (3)


   +Z
   (2)
-X


+
 Y


(5) +                                     - (4)
   -Y


+
  X


   (1)
-Z


(1)   X-movement
(2)   Y-movement
(3)   Z-movement
(4)   Rotation (-)
(5)   Rotation (+)

•   “X-movement [mm]”, “Y-movement [mm]”:
   Enter a value to move all marking data in a file along the x-axis and y-axis.
   The orientation of the x- and y-axis is defined by the head direction setting.

•   “Z-movement [mm]” (LP-ZV, LP-GS except LP-GS051-L):
   Enter a value to position all marking data in the file along the z-axis.
   LP-ZV: If you use the autofocus function, the value for “Z-movement [mm]” is added to the
   measured workpiece displacement.

•   “Rotation movement [°]”:
   Specify an angle to rotate all marking data in the file. The rotation center is the center
   of the marking field. Enter a positive value for counterclockwise rotation and a negative
   value for clockwise rotation.

•   “X-axis mirroring”, “Y-axis mirroring”:
   Select the axis across which you want all objects in a file to be mirrored. You can mirror
   the objects across the x-axis, the y-axis or both.


264                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 265

23.2 Specify the East Asian character set


The following drawings illustrate this function.

ABC                         ABC          CBA           ABC                    ABC

ABC                             ABC


(1)                        (2)                       (3)                    (4)

(1)   Marking data without mirroring
(2)   “Y-axis mirroring”: Mirroring across the y-axis
(3)   “X-axis mirroring”: Mirroring across the x-axis
(4)   Mirroring across the x- and y-axis (both check boxes are selected)


Related topics

Set the laser head direction (page 315)


23.2   Specify the East Asian character set

To use East Asian characters in character objects and bar code/2D code objects, specify the
character set in the “File settings” tab.

•   Go to the “Marking settings” screen and select “File settings”.

•   For “East Asian characters”, select “Japanese” (default setting) or “Simplified Chinese”.
   ‒ Japanese and Simplified Chinese characters cannot be used together in one file.

‒ If “Japanese” is set, JIS fonts are used for the non-alphanumeric characters (file
  number J1 and J2).

‒ If “Simplified Chinese” is set, GB fonts are used for the non-alphanumeric characters
  (file number GB1 and GB2).

•   You can change the default setting for East Asian characters under “System settings” >
   “Operation/information” > “Advanced system settings” > “Default setting for East Asian
   characters”.


Related topics

Configure advanced system settings (page 310)


23.3   Configure trigger parameters

Specify the trigger delay and the trigger mode settings for the trigger input TRIGGER IN of
the TERMINAL connector.

•   Go to the “Marking settings” screen and select “File settings”.


ME-NAVIS2-OP-5                                                                                                    265

---

## หน้า 266

23 File setting


Specify any of the following parameters:

•   “Delay time [ms]”:
   Set a delay time from trigger input to starting the marking processing (lasing process).
   ‒ The trigger delay setting is only applied to the selected file. If you use several files,
   set the trigger delay for each file.

‒ If “Image checking before marking” was set in the selected file, control of the image
  processing device starts after the trigger delay. If a TIMING IN signal is used, a delay
  time is not applied before the TIMING IN signal.

‒ The delay setting is not applied to on-the-fly marking, test marking and laser radiation
  for measurement.

•   “Trigger mode”:
   Set the mode of the marking trigger input TRIGGER IN of the TERMINAL connector.
   With “Single trigger” (default setting), one lasing process is executed by each TRIGGER
   IN signal.
   With “Continuous trigger”, the lasing process is repeated while TRIGGER IN is ON.
   ‒ The MRK command cannot be transmitted if “Continuous trigger” is set for “Trigger
   mode”.

‒ The “Trigger mode” settings are only applied to the selected file. If you use several
  files, specify the trigger mode settings for each file.

‒ The “Trigger mode” settings are not applied to on-the-fly marking. Set the trigger
  mode for on-the-fly marking under “Marking settings” > “On-the-fly marking” > “On-
  the-fly settings for all files” > “Trigger mode”.

‒ For details about the timing chart of the TRIGGER IN signal, refer to the “Setup and
  Maintenance Guide” of your laser marking system.

‒ If “Continuous trigger” is set for “Trigger mode”, the “Start marking” button is not
  available in RUN mode.
‒ If “Continuous trigger” is set for “Trigger mode”, you can use the “Seamless loop”
  function to repeat the marking of objects that consist of a closed line.

‒ LP-ZV: If “Continuous trigger” is set for “Trigger mode”, the autofocus function is not
  available.

The following parameters are available if “Continuous trigger” is set for “Trigger mode”:

•   “Allow to stop halfway”:
   If the check box is selected and TRIGGER IN turns off during the marking process, the
   marking process is immediately terminated even if the process is not finished.
   If the check box is not selected and TRIGGER IN turns off during the marking process,
   the marking process is terminated after finishing the current process.

•   “Scan interval [s]”:
   Set the interval period at overwriting.
   There is an interval of around 10ms between each lasing process, even if you set “0” for
   “Scan interval [s]”.

•   “Minimum number of scans”:
   The value of “Minimum number of scans” must be less than or equal to the value of
   “Maximum number of scans”.


266                                                                                               ME-NAVIS2-OP-5

---

## หน้า 267

23.4 Configure imagechecker settings


   If “Trigger mode” is set to “Continuous trigger”, the setting value of “Minimum number of
   scans” is used for the test marking.
   The warning E630 is output if TRIGGER IN turns off before the minimum number of
   scans is reached.
•   “Maximum number of scans”:
   This parameter becomes available if you select “Limit number of scans”.
   The warning E631 is output and the lasing process stops if the TRIGGER IN signal
   remains on even after the maximum number of scans is reached.


Related topics

On-the-fly marking settings for all files (page 288)

Fine-tune the laser settings (page 274)

Warning messages (E600–E799) (page 401)

Start laser radiation with the “Start marking” button (page 48)


23.4   Configure imagechecker settings

When linking the laser marking system with an imagechecker, you can specify parameters
for marking position correction or checking the marking result.

The following functions are not available if you use the link function with imagecheckers:

•   On-the-fly-marking

•   “Trigger mode” > “Continuous trigger”

For details about connecting image processing devices, refer to the “Setup and Maintenance
Guide” of your laser marking system.

•   Establish an online connection between your PC and the laser marking system.

•   Go to the “Marking settings” screen and select “File settings”.

Specify any of the following parameters:

•   “Image checking before marking” / “Image checking after marking”:
   To use the link function with imagecheckers and display the settings, select “ON”. Select
   “OFF” to disable the function.

•   “Model”:
   Select the used imagechecker model.
   “Image checking before marking”: PV230/PV200 can be used for marking position
   correction (fixed).
   “Image checking after marking”: PV230/PV200, DataMan or LP-ABR11/LP-ABR12 can
   be used for checking the marking result. (Only LP-GS, LP-RC, LP-RF and LP-RV can be
   connected to LP-ABR11/LP-ABR12.)


ME-NAVIS2-OP-5                                                                                                267

---

## หน้า 268

23 File setting


•   “Type No. set on PV”:
   Specify this parameter if PV230/PV200 is set for “Model” under “Image checking after
   marking”.
   Enter the same type number (0–255) as specified on PV230/PV200. If there is no
   matching type number on the imagechecker, the function cannot be performed.
   If PV230/PV200 is set for “Model” under “Image checking before marking”, specify the
   type number by an external control device such as a PLC.

•   “Response timeout [s]”:
   Set the time until the response is returned from the imagechecker.
   If the imagechecker does not respond within the set time, the warning E625 is output.

•   “TIMING IN signal input”:
   If required, select “Enabled” to activate the timing input.
   Use the TIMING IN input if you need to trigger operations of the laser marking system
   and the imagechecker or code reader separately. This is necessary, for instance, when
   the camera's or the code reader's field of view is distant from the marking position.

•   “Application”:
   Select the desired application. Depending on the linked imagechecker, the application is
   fixed.
   “Image checking before marking”: “Marking position correction” (fixed)
   “Image checking after marking”: “Code checking (PV230)”, “Character checking (PV230)”,
   “Image capturing and inspection”
   ‒ DataMan, LP-ABR11/LP-ABR12: Under “Image checking after marking”, “Code
   checking” is set for “Application”.

‒ PV200: Under “Image checking after marking”, you must select “Image capturing and
  inspection” for “Application”.

‒ PV230: Under “Image checking after marking”, you can set “Code checking
  (PV230)”, “Character checking (PV230)” or “Image capturing and inspection”. If
  you set “Code checking (PV230)” for “Application”, you can specify that the human
  readable text is checked at the same time as the code symbol.

•   “Object No. to check”:
   Enter the same object number as specified in “Object settings” for the marking object (bar
   code, 2D code or character object).
   This parameter is available if “Code checking (PV230)” or “Character checking (PV230)”
   is set for “Application” under “Image checking after marking”. Specify the object number
   of the target object that should be checked.

If PV230/PV200 is set for “Model”, the following parameters are available:

•   “CDR checker No. set on PV”:
   Enter the same number as specified on PV230 (“Checker No.” for code reader).
   The parameter is available if “Code checking (PV230)” is set for “Application” under
   “Image checking after marking”.

•   “Check human readable text”:
   Set “ON” to check the code symbol and the human readable text of a bar code or 2D
   code object at the same time.


268                                                                                            ME-NAVIS2-OP-5

---

## หน้า 269

23.5 Specify parameters under “Compatibility with former models”


The parameter is available if “Code checking (PV230)” is set for “Application” under
“Image checking after marking”.

•   “OCR checker No. set on PV”:
   Enter the same number as specified on PV230 (“Checker No.” for optical character
   recognition).
   The parameter is available if “Code checking (PV230)” or “Character checking (PV230)”
   is set for “Application” under “Image checking after marking”.
   If “Application” > “Code checking (PV230)” is set: To check the code symbol and the
   human readable text at the same time, specify “CDR checker No. set on PV” for the code
   symbol and “OCR checker No. set on PV” for the human readable text.

•   “Check human readable text of composite code 2D part”:
   Set “ON” to check the human readable text of the composite code's 2D part.
   The parameter is available if “Code checking (PV230)” is set for “Application” and “Check
   human readable text” is set to “ON”.

•   “OCR checker No. set on PV (2D)”:
   Enter the same number as specified on PV230 (“Checker No.” for optical character
   recognition).
   The parameter is available if “Check human readable text of composite code 2D part” is
   set to “ON”.

•   To save your marking file on the laser marking system, select “Save” > “To laser marking
   system”.


Related topics

Make imagechecker communication settings (page 325)


23.5   Specify parameters under “Compatibility with former models”

The settings are available if “Compatible mode” on the “System settings” screen is set to
“LP-400/V compatible” or “LP-M/S/Z compatible”.

•   Go to the “Marking settings” screen and select “File settings”.

Under “Compatibility with former models”, specify any of the following parameters:

•   “ Apply former offset order”:
   The setting is applicable when using the external offset function or 3D marking. When the
   offset function in the “File settings” tab is set alongside these functions, choose the offset
   order. Select the check box to set the same offset sequence as used by LP-400/LP-V or
   LP-M/LP-S/LP-Z. If the check box is not selected, compatibility with marking files from
   previous models may be compromised, resulting in changes to the marking layout.

•   “Proportional type”:
   If “Compatible mode” on the “System settings” screen is set to “LP-400/V compatible”
   or “LP-M/S/Z compatible”, you cannot select the proportional settings (“Proportional


ME-NAVIS2-OP-5                                                                                                 269

---

## หน้า 270

23 File setting


1”, “Proportional 2”, “Proportional 3”) from the “Character spacing type” list box in the
character object settings.
Set “Character spacing type” > “Proportional” in the character object settings. Then go to
“File settings” > “Compatibility with former models” and select a proportional setting from
the “Proportional type” list box.
Select “Proportional 1”, “Proportional 2” or “Proportional 3” from the list box. “Proportional
1” specifies the smallest spacing between the characters, “Proportional 3” the largest.
The setting applies to all character objects in the file.

•   “Code marking direction” (LP-ZV):
   Specify this parameter if “Compatible mode” on the “System settings” screen is set to
   “LP-M/S/Z compatible”. This setting applies to all bar code objects including composite
   codes. If the bar code object is not used, setting this parameter is not necessary.
   Select one of these options: “One direction” or “Alternate”. The alternate direction setting
   reduces the marking time compared to the one direction setting.


(1)                           (2)

(1)   One direction setting
(2)   Alternate direction setting

•   “ 2D code skip marking” (LP-ZV):
   Specify this parameter if “Compatible mode” on the “System settings” screen is set to
   “LP-M/S/Z compatible”. If the 2D code object is not used, setting this parameter is not
   necessary.
   You can specify if all code modules are marked consecutively or irregularly by skipping
   one module to reduce the heat effect of the laser. Select the check box to set the marking
   order “Skip one”. If the check box is not selected, “Skip none” is applied.
   The module marking order is shown in the following illustrations.

1     2         3   4              1    7     2   8
5     6         7   8              9    3 10 4
9 10 11 12                         5 11 6 12
   (1)                               (2)

(1)   “Skip none”
(2)   “Skip one”


Related topics

Select compatible mode (page 308)

Set the character spacing of a character object along a straight line (page 112)

Set the character spacing by specifying an angle (page 115)


270                                                                                              ME-NAVIS2-OP-5

---

## หน้า 271

23.6 Use the autofocus function


23.6   Use the autofocus function

Use the autofocus function if you want to mark workpieces of varying height. This setting is
available for the LP-ZV series.

When you use the autofocus function, the work distance is adjusted automatically depending
on the height of the workpiece. To obtain the height of the workpiece, the workpiece
displacement is measured by the external displacement sensor.

•   Use an external displacement sensor to measure the workpiece displacement.
   The autofocus function is available if the optional expansion board is installed in the
   controller.
   Connect a displacement sensor with analog current output signals (4mA to 20mA) to
   the laser marking system. The value measured by the displacement sensor is converted
   into the workpiece displacement and applied to the marking process. The laser marking
   system must receive the signal from the displacement sensor before the input of the
   marking start signal (trigger).
   Before you use the external displacement sensor, specify all settings in advance under
   “System settings” > “Linked device” > “Displacement sensor”.

•   With the autofocus function, the work distance can be adjusted automatically in the range
   from -25mm to 25mm.

•   The work distance is adjusted based on the measured workpiece displacement. The
   workpiece displacement is 0mm if the laser head is installed at base position (LP-
   ZV200P/LP-ZV500P: 190mm, LP-ZV205P/LP-ZV505P: 220mm, LP-ZV206P/LP-ZV506P:
   330mm).


(1)


(2)         (5)
   +25
   0
(3)
   -25
   (4)
   [mm]

(1)   Laser head
(2)   Work distance (base position)
(3)   Workpiece displacement
(4)   Workpiece
(5)   Correction range of the workpiece displacement

•   During remote or RUN mode, you can check the measured workpiece displacement on
   the “Monitor” screen under “Real-time data” > “Last marking results”.

•   To check the workpiece displacement in advance, you can measure it in the “Test
   marking/guide laser” dialog on the “Marking settings” screen.


ME-NAVIS2-OP-5                                                                                                 271

---

## หน้า 272

23 File setting


•    The autofocus function cannot be used in combination with the following functions:
   ‒ On-the-fly-marking

   ‒ “Trigger mode” > “Continuous trigger”
•    For details about the installation method when using the autofocus function and control
   method of the external displacement sensor, refer to the “Setup and Maintenance Guide”.

To set the autofocus function in Laser Marker NAVI smart, do the following:

                  1.    Go to the “Marking settings” screen and select “File settings”.

                  2.    For “Autofocus”, select “ON”. “ON” can be selected if the optional expansion board is
                        installed in the controller.

                  3.    You can set “Upper limit of work displacement [mm]” and “Lower limit of work
                        displacement [mm]” if necessary.
                        If you specify these settings, an error occurs when a value outside the specified limits
                        is measured, for example when the workpiece is not in its position or is placed in the
                        wrong position. This will prevent that an incorrect work distance is set for marking.
                        “Upper limit of work displacement [mm]”: Specify an upper limit for the workpiece
                        displacement. If the measured workpiece displacement exceeds the specified limit, an
                        error occurs, and you cannot start marking. Set “Upper limit of work displacement [mm]”
                        to a value greater than “Lower limit of work displacement [mm]”.
                        “Lower limit of work displacement [mm]”: Specify a lower limit for the workpiece
                        displacement. If the measured workpiece displacement is below the specified value, an
                        error occurs, and you cannot start marking.


Related topics

Specify settings for an external displacement sensor (page 327)

Check the workpiece displacement (page 61)


272                                                                                             ME-NAVIS2-OP-5

---

## หน้า 273

24.1 Set laser parameters


24     Laser settings


24.1   Set laser parameters

Specify laser parameters that apply to all objects in the marking file, such as laser power and
scan speed.


If you set a high laser power or a slow scan speed, the workpiece may catch fire or burn
depending on the material.
For test marking, it is recommended to set a lower laser power value and a rather fast scan
speed. Check the marking quality and adjust the parameters gradually until the marking
result meets your expectations.


You can specify values for laser power, scan speed, pulse cycle (LP-RF, LP-RV, LP-ZV) or
pulse duration (LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P). The values will be transferred
to the “Test marking/guide laser” dialog.

•   Go to the “Marking settings” screen and select “Laser settings”.

Specify any of the following parameters:

•   “Laser power”:
   Set the power level according to your actual requirements.
   The laser power gradually decreases due to the degradation of the laser source. Due to
   that fact, it is recommended to set a value below the preset value of 100.

•   “Scan speed [mm/s]”:
   Specify the speed at which the laser beam moves while marking the workpiece.

•   “Laser frequency [kHz]” (LP-GS, LP-RC, LP-RH):
   For LP-RC, the laser frequency is predefined to 40kHz and cannot be changed. For LP-
   GS and LP-RH, you can adjust the laser frequency.
   Changing the frequency results in different marking effects. For example, a lower
   frequency and a higher scan speed will generate a dotted line. It means that the laser is
   not generated quickly enough to mark a continuous line.

•   “Pulse duration [ns]” (LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P):
   Specify the laser pulse duration.
   By entering a value, the value for the pulse cycle is automatically adjusted to the optimal
   value. If required, you can specify another value than the optimal value.
   A shorter pulse duration reduces the thermal effect on the workpiece. Adjust the pulse
   duration according to your desired marking quality and the material of the workpiece. The
   following values are reference settings for different materials:
   ‒ Plastic: 4ns or 8ns

‒ Metal: 16ns or 30ns


ME-NAVIS2-OP-5                                                                                                     273

---

## หน้า 274

24 Laser settings


‒ For shallow marking on metal: 120ns or 200ns

   The setting range of the laser pulse cycle varies depending on the specified value of the
   pulse duration. If you change the pulse duration, adjust the laser pulse cycle.
•   “Pulse cycle [μs]” (LP-RF, LP-RV, LP-ZV):
   Specify the time from beginning of one pulse to the next pulse.
   A longer pulse cycle and a high scan speed will generate a dotted line.
   ‒ LP-RF, LP-ZV500P, LP-ZV505P, LP-ZV506P: If you specify a long pulse cycle, the
   pulse energy increases. A short pulse cycle setting results in a low pulse energy.
   Setting range: 5.0 to 50.0μs (LP-RF), 2.0 to 20.0μs (LP-ZV500P, LP-ZV505P, LP-
   ZV506P)

‒ LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P: The setting range and optimal value of
  the pulse cycle depends on the value of the pulse duration.

Pulse duration                                 Pulse cycle

Setting range                        Optimal value

1ns                 0.5 to 5.0μs                         0.5μs

4ns                 0.5 to 16.6μs                        1.6μs

8ns                 0.5 to 33.3μs                        3.3μs

16ns                0.7 to 62.5μs                        6.2μs

30ns                1.2 to 111.1μs                       11.3μs

50ns (LP-ZV only)   1.7 to 166.6μs                       16.6μs

120ns               3.0 to 333.3μs                       29.4μs

200ns               5.0 to 500.0μs                       50μs


The optimal value of the pulse cycle yields the largest average laser power and the
largest pulse energy at the selected pulse duration.
If you specify a pulse cycle that is longer than the optimal value, the average laser
power decreases. A pulse cycle setting that is shorter than the optimal value results
in a lower pulse energy.


Related topics

Perform test marking (page 54)

Fine-tune the laser settings (page 274)


24.2     Fine-tune the laser settings

To achieve an optimal marking quality, specify more laser setting parameters under “Fine
adjustment”.

•   Go to the “Marking settings” screen and select “Laser settings”.


274                                                                                               ME-NAVIS2-OP-5

---

## หน้า 275

24.2 Fine-tune the laser settings


Specify any of the following parameters:

•   “Seamless loop”:
   The check box becomes available if “Continuous trigger” is set for “Trigger mode” in “File
   settings”. Select the check box to improve the marking quality. With this function, the laser
   radiates continuously without break at the position where the start and end points overlap.
   To use the seamless loop function, set only one object with a closed line in one marking
   file. You cannot use this function if the marking file contains two or more objects. To
   create a closed line set the start and end points to the same position.
   The seamless loop function cannot be applied, if the following functions are set in the
   marking file:
   ‒ Multiple objects

‒ Objects consisting of unclosed lines

‒ Point radiation

‒ “Step & repeat” function

‒ “File settings” > “Trigger settings” > “Scan interval [s]”
‒ LP-GS (except LP-GS051-L): “Function settings” > “External offset” > “Z-movement
  [mm]”

•   “Starting point”, “Ending point”:
   Specify these parameters to fine-tune the time until the laser starts or ends radiating at
   the start or end point. With a larger value you can achieve a darker (deeper) marking
   result at the start and end point.
   The settings apply to all objects in the marking file. For the start and end point of bar code
   and 2D code objects, you can specify other values under “Customize starting/ending
   point by object”.
   (1)                            (2)                                (3)


(4)                                                   (5)

(1)   Light (shallow marking)
(2)   Optimal
(3)   Dark (deep marking)
(4)   Small value
(5)   Large value


Small setting values impact the marking result. The marked characters may be partially chipped.

•   “Waiting time”:
   With this parameter, you can adjust the time until the laser starts radiating at the start
   point of each line. The setting applies to all line segments.

ME-NAVIS2-OP-5                                                                                                    275

---

## หน้า 276

24 Laser settings


To improve the marking quality set a larger value for this parameter. A larger value results
in a longer marking time.

•   “Corners”:
   Set an adequate value to optimize the appearance at the corners of a character.
   If you set a smaller value, the corners of a character are rounded off. A smaller value
   reduces the marking time.
   If you set a larger value, it will cause burn-ins at each vector point.


(2)              (3)              (4)

(1)                                                                                (5)

(1)   Small value
(2)   Round corners
(3)   Optimal
(4)   Dark (deep) corners
(5)   Large value

•   “Curve”:
   With this parameter, you can optimize the shape of curved line segments.
   If you set a smaller value, the curved line segments are deformed. A smaller value
   reduces the marking time. A larger value results in darker lines.


(2)              (3)               (4)

(1)                                                                                (5)

(1)   Small value
(2)   Curved line segments are deformed
(3)   Optimal
(4)   Dark (deep) line
(5)   Large value

•   “Jump”:
   With this parameter, you can adjust the time until the laser starts radiating at the start
   point of the line. The setting applies only if the distance to the next line is too large. The
   scanner requires a certain time to reach the set position.
   To improve the marking quality set a larger value for this parameter. A larger value results
   in a longer marking time.

•   “Pre-scan time [ms]”:
   Set this parameter to improve the marking result by correcting the deformation or
   reducing deep marking at the start and end points. A larger value results in a longer
   marking time.


276                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 277

24.2 Fine-tune the laser settings


Even when adjusting the “Pre-scan time [ms]” setting, if you find that the marking quality
does not improve (e.g. the corners of characters are not sharp), reduce the value of “Pre-
scan optimization level” under “System settings” > “Operation/information” > “Advanced
system settings”.

•   “First shot tuning” (LP-RC):
   Specify the laser power at the start point. If you set a large value, the start point becomes
   wider or darker.
   Initial setting: 0
   (1)                            (2)                               (3)


(4)                                                              (5)

(1)   Narrow (light)
(2)   Optimal
(3)   Wide (dark)
(4)   Small value
(5)   Large value


Small setting values impact the marking result. Short lines of the marked characters may be partially
chipped.

•   “Align the first shot position” (LP-RF, LP-RV, LP-ZV):
   Select the check box to improve the marking quality of the filling lines. With this function,
   the start positions of the filling lines are organized.
   Enabling this function results in a longer marking time.

•   “Uniform spot mode” (LP-ZV):
   Normally, the farther away from the center of the marking field, the larger the spot size,
   and the thickness and depth of the marking line may differ depending on the coordinate
   position. If you want to improve this situation, activate “Uniform spot mode”.
   When you activate “Uniform spot mode”, the laser beam diameter will remain the same
   in the area between the near field (1) and the selected field. The spot size is adjusted to
   its largest size in the target field, and the laser beam diameter increases in the following
   order: “Near field alignment”, “Base field alignment”, “Far field alignment”.
   Select one of the following options as the reference field for the adjustment of the spot
   size:
   ‒ “OFF”: The uniform spot mode is disabled. The spot size is adjusted for each
   coordinate. If you want to perform laser engraving, or require a larger laser power
   density, select “OFF”.

‒ “Near field alignment”: This setting maintains a uniform laser beam diameter within
  the marking field on the near field (1) plane (at the shortest work distance).

‒ “Base field alignment”: This setting adjusts the laser beam diameter to the base field
  (2) plane (at base position of the work distance). The laser beam diameter remains
  the same in the area between the near field (1) and the base field (2) plane.


ME-NAVIS2-OP-5                                                                                                      277

---

## หน้า 278

24 Laser settings


‒ “Far field alignment”: This setting adjusts the laser beam diameter to the far field (3)
  plane (at the longest work distance). The laser beam diameter remains the same in
  the area between the near field (1) and the far field (3) plane.


(1)
(2)
(3)


(1)   Near field
   LP-ZV200P, LP-ZV500P: 165mm
   LP-ZV205P, LP-ZV505P: 195mm
   LP-ZV206P, LP-ZV506P: 305mm
(2)   Base field
   LP-ZV200P, LP-ZV500P: 190mm
   LP-ZV205P, LP-ZV505P: 220mm
   LP-ZV206P, LP-ZV506P: 330mm
(3)   Far field
   LP-ZV200P, LP-ZV500P: 215mm
   LP-ZV205P, LP-ZV505P: 245mm
   LP-ZV206P, LP-ZV506P: 355mm

Remark
When the uniform spot mode is activated, only the negative value range (from 0mm to
-25mm) of the “Defocusing [mm]” setting is available. Setting a value in the positive range
(from 0mm to +25mm) has no effect.

Settings for bar code and 2D code objects:

•   “Customize to bar code/2D code”:
   Select this check box to be able to specify different values for the start and end point of
   bar code or 2D code objects. The setting does not apply to the human readable text.

•   “Starting point (bar code/2D code)”, “Ending point (bar code/2D code)”:
   Specify this parameter to fine-tune the time until the laser starts or ends radiating at the
   start or end point. With a larger value you can achieve a darker (deeper) marking result at
   the start and end point.


Related topics

Set laser parameters (page 273)

Configure advanced system settings (page 310)


278                                                                                                ME-NAVIS2-OP-5

---

## หน้า 279

24.3 Specify smart setting parameters


24.3   Specify smart setting parameters

In the “Smart settings” dialog, specify adequate values for laser power and scan speed
depending on the marking or processing application.

This function is not available for LP-ZV506P.

•   Go to the “Marking settings” screen and select “Laser settings”.

•   Select “Smart settings” to open the dialog.

In the dialog, configure any of the following settings:

•   “Application”:
   The list box items vary depending on the connected laser marking system.
   ‒ LP-GS (marking): “PCB (Faint marking)”, “PCB (Deep marking)” (LP-GS051, LP-
   GS051-L), “Epoxy coated component”, “Resin (Black)”, “Paper (layer removal)”,
   “Paper (dark marking)” (LP-GS051, LP-GS051-L),

‒ LP-RC (marking): “Paper (layer removal)”

‒ LP-RH (marking): “PCB (Deep marking)” (LP-RH100), “LCP (Black)” (LP-RH101),
  “PET” (LP-RH200), “Paper (layer removal)” (LP-RH300), “Acrylonitrile butadiene
  styrene (Black)” (except LP-RH200), “Acrylonitrile butadiene styrene (White)” (except
  LP-RH200)

LP-RF, LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P, LP-ZV500P, LP-ZV505P: For
“Application”, select “Marking” or “Processing”. Then select the marking or processing
application from the list box.
 ‒ LP-RF (marking): “Aluminum (shallow engraving)”, “Aluminum (deep engraving)”,
   “Iron/Stainless steel (shallow engraving)”, “Iron/Stainless steel (deep engraving)”,
   “Acrylonitrile butadiene styrene (Black)”, “Acrylonitrile butadiene styrene (White)”,
   “Polybutylene terephthalate (Black)”, “Polybutylene terephthalate (White)”,
   “Polyoxymethylene (Black)”, “Polyoxymethylene (White)”, “Polypropylene (Black)”,
   “Polypropylene (White)”, “Polycarbonate (Black)”, “Polycarbonate (White)”

‒ LP-RV, LP-ZV200P, LP-ZV205P (marking): “Aluminum (shallow engraving)”,
  “Aluminum (deep engraving)”, “Iron/Stainless steel (shallow engraving)”, “Iron/
  Stainless steel (deep engraving)”, “Acrylonitrile butadiene styrene (Black)”,
  “Acrylonitrile butadiene styrene (White)”, “Polybutylene terephthalate (Black)”,
  “Polybutylene terephthalate (White)”, “Polyoxymethylene (Black)”, “Polyoxymethylene
  (White)”, “Polypropylene (Black)”, “Polypropylene (White)”, “Polycarbonate (Black)”,
  “Polycarbonate (White)”, “Epoxy coated component”

‒ LP-ZV206P (marking): “Acrylonitrile butadiene styrene (Black)”, “Acrylonitrile
  butadiene styrene (White)”, “Polybutylene terephthalate (Black)”, “Polybutylene
  terephthalate (White)”, “Polyoxymethylene (Black)”, “Polyoxymethylene (White)”,
  “Polypropylene (Black)”, “Polypropylene (White)”, “Polycarbonate (Black)”,
  “Polycarbonate (White)”, “Epoxy coated component”

‒ LP-ZV500P, LP-ZV505P (marking): “Aluminum (shallow engraving)”, “Aluminum
  (deep engraving)”, “Iron/Stainless steel (shallow engraving)”, “Iron/Stainless steel
  (deep engraving)”


ME-NAVIS2-OP-5                                                                                                 279

---

## หน้า 280

24 Laser settings


‒ LP-RF, LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P, LP-ZV500P, LP-ZV505P
  (processing): “Surface removal”, “Cutting of cable shield”

•   “Contrast (marking time)”: The parameter is available for marking applications.
   Use the slider to adjust the marking contrast. Set a low contrast by moving the slider to
   the left in the direction of “Low (short)”. To set a high contrast, move the slider to the right
   in the direction of “High (long)”. The higher the contrast the longer marking takes.


(1)                              (2)                               (3)

(1)   “Low (short)”
(2)   “Base”
(3)   “High (long)”

•   “Laser power (marking depth)”:
   The parameter is available for marking applications. Use the slider to adjust the laser
   power. Set a high laser power by moving the slider to the right in the direction of “High
   (deep)”. A higher laser power results in a deeper marking. To set a low laser power, move
   the slider to the left in the direction of “Low (shallow)”.

•   “Number of overwritings” (LP-RF, LP-RV, LP-ZV):
   The parameter is available for processing applications.
   Specify how many times the setting data is processed with one single trigger. The larger
   the specified number the longer the processing takes.

•   “Scan speed [mm/s]” (LP-RF, LP-RV, LP-ZV):
   The parameter is available for processing applications.
   Specify the speed at which the laser beam moves while processing. Use the slider to
   adjust the speed. A high speed decreases the energy and shortens the processing time.
   A low speed increases the energy and the processing time.

•   “Measure workpiece displacement when marking starts” (LP-ZV):
   In the “Smart settings” dialog, the “Measure workpiece displacement when marking
   starts” check box is displayed if “Autofocus” is set to “ON”. If the check box is selected,
   the workpiece displacement is automatically measured and applied when you start test
   marking.

•   “Guide laser ON”:
   Select “Guide laser ON” to start radiating the guide laser.
   Select “Guide laser OFF” to stop the radiation of the guide laser.

•   “Start marking”:
   Select “Start marking” to trigger the laser radiation. Perform the test marking process to
   check the marking quality with the specified smart settings.

•   “Estimated marking time” / “Estimated processing time”:
   Displays the calculated time based on the input data that the marking or processing is
   expected to take. To obtain a more precise result, perform marking time measurement.

•   Select “Apply” to transfer the specified settings to the following parameters in the file:
   ‒ “Laser settings” > “Laser power”


280                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 281

24.4 Configure smart settings for marking applications


‒ “Laser settings” > “Scan speed”

‒ “Laser settings” > “Laser frequency [kHz]” (LP-GS, LP-RH)

‒ “Laser settings” > “Pulse cycle [μs]” (LP-RF, LP-RV, LP-ZV)
‒ “Laser settings” > “Pulse duration [ns]” (LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P)

‒ For processing applications: “Object group” > “Number of overwritings” (LP-RF, LP-
  RV, LP-ZV)

•    To close the dialog, select “Close”.


Related topics

Guide laser (page 56)

Perform test marking (page 54)

Configure smart settings for marking applications (page 281)

Configure smart settings for processing applications (page 282)


24.4   Configure smart settings for marking applications

With smart settings, you can select one of the predefined marking applications and if
necessary, fine-tune the contrast and laser power.

This function is not available for LP-ZV506P.

                 1.      Go to the “Marking settings” screen.

                 2.      Create the marking object and specify the desired layout.

                 3.      Turn laser pumping on to enable the lasing process.
                 4.      Select “Laser settings”.

                 5.      Select “Smart settings” to open the dialog.

                 6.      For “Application” select the marking application.

                 7.      Use the guide laser to visually check the marking position and adjust the work
                         distance.

                 8.      Perform the test marking process to check the marking quality.
                         If the test marking result does not meet your quality requirements, adjust the contrast
                         and the laser power. Always perform test marking to check if the marking result is as
                         intended.
                         The “Test marking result” dialog appears as soon as test marking is completed.
                         LP-ZV: The following parameters are displayed: “Marking time”, “Marking energy”,
                         “Workpiece displacement” (if autofocus function is used)
                         “Marking energy” is available for LP-ZV500P and LP-ZV505P.


ME-NAVIS2-OP-5                                                                                                 281

---

## หน้า 282

24 Laser settings


                    9.    Use the slider to adjust the marking contrast.
                          Also check the estimated marking time. The higher the contrast the longer marking
                          takes.

                    10.   Perform the test marking process and check the marking quality on the workpiece.
                    11.   Use the slider to adjust the laser power.

                    12.   When you are satisfied with the marking result, select “Apply” to transfer the specified
                          settings to the corresponding parameters in the marking file.

                    13.   Select “Close”.


Related topics

Check the marking position using the guide laser (page 59)

Turn laser pumping on or off (page 47)

Perform test marking (page 54)

Specify smart setting parameters (page 279)


24.5     Configure smart settings for processing applications

You can select a predefined processing application and if necessary, fine-tune the scan
speed and set how many times the marking data is processed with one single trigger.

This function is not available for LP-ZV506P.

                    1.    Go to the “Marking settings” screen.

                    2.    Create the object for processing and specify the desired layout.

                    3.    Turn laser pumping on to enable the lasing process.
                    4.    Select “Laser settings”.

                    5.    Select “Smart settings” to open the dialog.

                    6.    For “Application” select the processing application.

                    7.    Use the guide laser to visually check the processing position.

                    8.    Perform the test marking process to check the processing quality.
                          If the test marking result does not meet your quality requirements, adjust the values
                          for “Number of overwritings” and “Scan speed [mm/s]”. Always perform test marking to
                          check if the processing result is as intended.

                    9.    Specify how many times the setting data is processed with one single trigger
                          (“Number of overwritings”).

                    10.   Perform the test marking process and check the processing quality on the workpiece.

                    11.   Use the slider to adjust the scan speed.
                          Also check the estimated processing time. A low speed increases the processing
                          time.


282                                                                                             ME-NAVIS2-OP-5

---

## หน้า 283

24.6 Set laser correction parameters for a marking object


                 12.      When you are satisfied with the processing result, select “Apply” to transfer the
                          specified settings to the corresponding parameters in the file.

                 13.      Select “Close”.


Related topics

Check the marking position using the guide laser (page 59)

Turn laser pumping on or off (page 47)

Perform test marking (page 54)

Specify smart setting parameters (page 279)


24.6   Set laser correction parameters for a marking object

You can specify individual laser correction parameters for each marking object.

The laser correction parameters are available for character objects, TrueType objects,
graphic objects, shape objects, bar code objects, 2D code object (PDF417) and point
radiation objects.

QR Code, Micro QR Code, iQR Code, GS1 DataMatrix, Data Matrix: You can specify laser
correction parameters for individual code elements.

•     To edit the parameters of an object, select the object in the object list or in the marking
   image editor.
   The parameters are displayed in the category below the object list.

•     Set the laser correction parameters under “Laser correction”.

Specify any of the following parameters:

•     “Laser power correction [%]”:
   To correct the laser power, enter a value in the text box.
   ‒ Point radiation objects: Specify a correction value that applies to all points in the
   selected object. If the point radiation object consists of several points, you can also
   set a correction value for each point.
   “Laser power correction [%]” for all points: The laser power is set by multiplying the
   laser power correction ratio set for the object, the laser power correction ratio set for
   each point and the laser power value set in “Laser settings”.
   “Laser power correction [%]” for one point: The laser power is set by multiplying the
   laser power correction ratio set for the point and the laser power value set in “Laser
   settings”.

‒ Composite codes: Specify the laser power for the 1D part of the code.

•     “Scan speed correction [%]”:
   To correct the scan speed, enter a value in the text box.
   ‒ Composite codes: Specify the scan speed for the 1D part of the code.


ME-NAVIS2-OP-5                                                                                                   283

---

## หน้า 284

24 Laser settings


•   “Pulse cycle correction [%]” (LP-RF, LP-RV, LP-ZV):
   To correct the pulse cycle, enter a value in the text box.
   ‒ Point radiation objects: The pulse cycle of all points in the selected object is adjusted.

   ‒ Composite codes: Specify the pulse cycle for the 1D part of the code.
Composite codes: Under “Laser correction (2D)”, specify laser correction parameters for the
2D part of the code and the separator between the 1D and 2D part.

•   For the 2D part of the code, you can specify values for “Laser power correction [%]”,
   “Scan speed correction [%]” and “Pulse cycle correction [%]” (LP-RF, LP-RV, LP-ZV).

•   For the separator, you can set values for “Laser power correction (separator) [%]”, “Scan
   speed correction (separator) [%]” and “Pulse cycle correction (separator) [%]” (LP-RF, LP-
   RV, LP-ZV).


Note

•   Marking is not possible if the laser power correction value is 0.

•   If the corrected value exceeds the allowable limit, the marking is performed with the
   maximum or minimum parameter value. The correction ratio is calculated based on the
   value set as 100% in “Laser settings”.

•   For bar code or 2D code objects, you can fine-tune the time until the laser starts radiating
   at the start or end point in “Laser settings” under “Customize starting/ending point by
   object”.


Related topics

Set laser correction parameters for code elements (page 193)

Set laser parameters (page 273)

Fine-tune the laser settings (page 274)


24.7     Specify limits for the marking energy

For LP-ZV, the marking energy is automatically measured for every marking process. Specify
an upper and lower limit for the marking energy, within which the marking result is of good
quality. The function is useful to monitor the marking quality.

This function is available for the following models: LP-ZV500P, LP-ZV505P, LP-ZV506P.

If you set the limit values, the result of the marking energy check is indicated by the following
methods:

•   The result is displayed in “Real-time data” > “Last marking results” on the “Monitor”
   screen.

•   The result is indicated by the outputs CHECK OK OUT (No. 34) or CHECK NG OUT (No.
                        35) of the I/O connector.


284                                                                                               ME-NAVIS2-OP-5

---

## หน้า 285

24.7 Specify limits for the marking energy


•    The result is transmitted by the Marking end verification (MST) command.

Take note of these points when using the marking energy to monitor the marking quality:

•    With the marking energy measurement, you can monitor the marking energy. This
   function cannot be used to check other marking issues caused by wrong installation,
   incorrect workpiece position or system problems.

•    The uncertainty of the marking energy measurement might be ±5% .

•    If the marking energy is lower than 100mJ or the marking time is less than 0.4s, the
   measurement of the marking energy may be inaccurate.

•    The marking energy can be measured for a marking process with a marking time of up to
   60 minutes. If the marking time is longer than 60 minutes, the displayed marking energy
   is for the first 60 minutes of the marking time.

•    Changing the marking data or laser settings, changes the measurement value of the
   marking energy. If you use the marking energy limit values, adjust the upper and lower
   limit according to the changed measurement value of the marking energy.

•    If you use functions that change the marking data for every marking process such as the
   expiry date and time function or counter function, the measurement value of the marking
   energy also changes.

•    If the laser marking system is moved or the fiber unit is removed and re-installed, the
   measurement value of the marking energy may change.

Perform the following steps to set the upper and lower limit for the marking energy
measurement:

                 1.      Go to the “Marking settings” screen.

                 2.      Turn laser pumping on.

                 3.      Select “Laser settings”.

                 4.      To set the limits for the marking energy, select “Change” for “Limit values”.
                         The “Marking energy” dialog appears.

                 5.      Select an option for “Limit values”:
                         •   “OFF”: The function is off.

                         •   “Upper limit”: Configure this setting to detect when a marking energy measurement
                             exceeds the specified upper limit.

                         •   “Lower limit”: Configure this setting to detect when a marking energy measurement
                             falls below the specified lower limit.

                         •   “Upper/lower limit”: Set an upper and lower limit to detect when the marking energy
                             measurement is outside the specified limits.

                 6.      To determine the upper or lower limit, first perform test marking to obtain the actual
                         marking energy. Select the “Marking energy measurement” tab and specify a value for
                         “Laser power for marking energy measurement”.
                         The value for “Laser power in laser settings” shows the laser power currently set in
                         “Laser settings”. Based on this setting, increase and decrease the value of “Laser
                         power for marking energy measurement” and check the marking quality. With this
                         method you can determine the upper and lower limit for the marking energy, within
                         which the marking result is still of good quality.


ME-NAVIS2-OP-5                                                                                                  285

---

## หน้า 286

24 Laser settings


                    7.    Use the guide laser to visually check the marking position and adjust the work
                          distance.
                          In the “Marking energy” dialog, the “Measure workpiece displacement when marking
                          starts” check box is displayed if “Autofocus” is set to “ON”. If the check box is
                          selected, the workpiece displacement is automatically measured and applied when
                          you start test marking.

                    8.    Select “Start marking” and confirm with “Yes”.
                          The measured value is displayed for “Measured marking energy”.

                    9.    Set “Upper limit [mJ]” to a value greater than “Lower limit [mJ]”. You have the following
                          options to set the upper and lower limit for the marking energy.
                          •   Enter the particular values in the text boxes for “Upper limit [mJ]” or “Lower limit
                              [mJ]”.

                          •   To apply the value that is displayed for “Measured marking energy” to the upper or
                              lower limit, select “Set as upper limit” or “Set as lower limit”.

                          •   To use the automatically calculated upper and lower limits, select “Set by
                              percentage”. In the dialog, specify a value for “Percentage” and select “Apply”.
                              Select “Close” to close the dialog. The upper and lower limits are calculated by
                              adding/subtracting a percentage of the measured marking energy.

                    10.   Select “Apply” to update the settings.

                    11.   To close the “Marking energy” dialog, select “Close”.


286                                                                                               ME-NAVIS2-OP-5

---

## หน้า 287

25.1 About on-the-fly-marking


25     On-the-fly marking


25.1   About on-the-fly-marking

Specify on-the-fly marking settings if you want to mark a workpiece in motion, e.g. a
workpiece that moves on an assembly line.

On-the-fly marking is available for LP-RC, LP-RF, LP-RH, LP-RV, and LP-ZV.

The parameters for on-the-fly marking are located on the “Marking settings” screen in the
“On-the-fly marking” tab.

The following functions are not available for on-the-fly marking:

•   “File settings” > “Image checking before marking”, “Image checking after marking”

•   “Object group” > “Overwriting interval [s]”
•   2D code: “Object settings” > “Module marking order” > “Skip one”, “Skip two”
   (LP-ZV: If “LP-M/S/Z compatible” is set in the “System settings” screen: “File settings” > “
   2D code skip marking”)

•   LP-ZV: “File settings” > “Autofocus” > “ON”

•   LP-ZV: “Object group” > “Defocusing [mm]”

To enable on-the-fly marking and display the settings, select “ON” for “On-the-fly marking”.
Select “OFF” to disable the function.

Under “On-the-fly settings for all files”, specify the basic parameters. The settings apply to all
files in the laser marking system.

Under “On-the-fly settings for one file”, specify the detailed parameters. The settings apply
only to the current file.


Vibrations coming from surrounding equipment or line speed fluctuations may affect the marking
quality of bar codes or 2D codes during on-the-fly marking. When marking a bar code or 2D code on
a moving workpiece, check that the marking and reading results of the marked code are of sufficient
high quality.


Related topics

On-the-fly marking settings for all files (page 288)

On-the-fly-marking settings for one file (page 290)

Trigger mode parameters (page 294)

Line speed control setting “2 sensors input” (page 296)

Specify on-the-fly marking settings (page 296)


ME-NAVIS2-OP-5                                                                                                    287

---

## หน้า 288

25 On-the-fly marking


25.2     On-the-fly marking settings for all files

The basic on-the-fly marking settings apply to all files in the laser marking system.


“Moving direction”

Specify the moving direction of the conveyor. Check the direction of the laser head. This
setting also defines the moving direction. You can change the laser head direction in the
“System settings” screen.

For “Moving direction”, select one of the following options:

•     “+X to -X”

•     “-X to +X”

•     “+Y to -Y”

•     “-Y to +Y”

The marking order is optimized depending on the moving direction.

In the marking image editor, a marking field overview for on-the-fly marking is displayed:


(1)            (2)

(1)    The arrow indicates the moving direction.
(2)    This area indicates which part of the marking field is displayed in the marking image editor.


LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), the image showing
the moving direction is displayed in the 3D marking image editor.


This arrow indicates the moving direction.


“Trigger detecting position [mm]”

For “Trigger detecting position [mm]”, specify the distance between the center of the marking
field and the trigger detecting position.


288                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 289

25.2 On-the-fly marking settings for all files


(4)


(3)

   (5)
   (2)
(1)                      (6)

(1)    Marking field center
(2)    “Trigger detecting position [mm]”: Distance between the center of the marking field and the trigger
   detecting position
(3)    Moving direction
(4)    Trigger sensor
(5)    Workpiece
(6)    Trigger detecting position


“Trigger mode”

For “Trigger mode”, specify the mode of the marking trigger. Select “Single trigger”, “Marking
at regular intervals” or “Multiple triggers”.

On-the-fly marking at regular intervals or with multiple triggers cannot be set together with
the following functions in one file:
•     “Functional characters” > “External control” > “Registered characters (via I/O connector)”

•     “Functional characters” > “External control” > “Characters specified by SIN command”

•     “Function settings” > “External offset” (marking offset by I/O or SEO command)

•     “Function settings” > “Counter” > “Reset at date change”


“Line speed control”

For “Line speed control”, select “Fixed speed”, “Encoder input” or “2 sensors input”.

If the line speed is fluctuating, set “Encoder input” or “2 sensors input”. Use an external
encoder or sensors to measure the line speed.

Connect the encoder or sensors to ENCODER A IN (X13) and ENCODER B IN (X14) of the
TERMINAL connector. For details, refer to the “Setup and Maintenance Guide” of your laser
marking system.


“Encoder resolution [pulses/mm]”

If “Line speed control” is set to “Encoder input”, specify the encoder resolution.

When using A phase only:
Encoder resolution = Number of pulses/mm ´ 2.

When using A and B phases:
Encoder resolution = Number of pulses/mm ´ 4.

Remarks


ME-NAVIS2-OP-5                                                                                                         289

---

## หน้า 290

25 On-the-fly marking


•     When only one phase of the encoder is used, connect the encoder signal to ENCODER A
   IN (X13) and connect ENCODER B IN (X14) to IN COM.1 (X2).

•     Make sure the encoder frequency does not exceed 100kHz per phase.

•     In some cases, the influence of line speed fluctuations may be reduced by lowering
   the encoder resolution. However, a minimum encoder resolution of 25pulses/mm is
   recommended.

•     Adjust the setting value of the encoder resolution by checking the marking quality.
   ‒ When the character spacing is too wide, increase the value.

‒ When the character spacing is too narrow, decrease the value.


“Distance line speed sensors [mm]”

If “Line speed control” is set to “2 sensors input”, specify the distance between the sensors.

Under “Distance line speed sensors [mm]”, enter a value.

Connect the first sensor in moving direction to ENCODER A IN (X13) and the second sensor
to ENCODER B IN (X14) of the TERMINAL connector. Turn on ENCODER B IN (X14) within
10s from the signal input at ENCODER A IN (X13).


“2 Sensors input time-out [s]”

For “2 Sensors input time-out [s]”, specify the timeout period between turning on ENCODER
B IN (X14) and the marking trigger, e.g. signal input at TRIGGER IN (X5).

The warning E607 occurs if the marking trigger does not turn on within the set timeout period
from turning on the second sensor (ENCODER B IN (X14)).

For details about the control procedure and timing chart of the 2 sensors input, refer to the
“Setup and Maintenance Guide” of your laser marking system.


Related topics

Set the laser head direction (page 315)

Trigger mode parameters (page 294)

Line speed control setting “2 sensors input” (page 296)

On-the-fly-marking settings for one file (page 290)


25.3     On-the-fly-marking settings for one file

The detailed parameters for on-the-fly marking apply to the selected marking file only.


“Workpiece spacing [mm]”

Set this parameter if “Marking at regular intervals” is set for “Trigger mode”.


290                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 291

25.3 On-the-fly-marking settings for one file


For “Workpiece spacing [mm]”, specify the distance to the next marking data object (to the
next workpiece).

(1)

ABC                ABC            ABC            ABC


(2)

(1)    “Workpiece spacing [mm]”: Distance between workpieces
(2)    Workpiece


“Line speed [m/min]”

“Line speed [m/min]”: Specify this setting if “Fixed speed” is set for “Line speed control”.

“Line speed for test marking [m/min]”: Specify the reference line speed used for test marking
if “Encoder input” or “2 sensors input” is set for “Line speed control”.

Remarks

•     If “Encoder input” or “2 sensors input” is set for “Line speed control”, the current line
   speed is calculated based on the input signals from the encoder or the sensor. You can
   check the line speed in “Monitor” > “On-the-fly” (LP-RC, LP-RF, LP-RV) or “Real-time
   data” (LP-RH, LP-ZV).

•     Adjust the setting value of the line speed by checking the marking quality.
   ‒ When the character spacing is too wide, increase the value.

‒ When the character spacing is too narrow, decrease the value.


“Workpiece reference boundary [mm]”

The workpiece reference boundary is used as a reference line to specify the position of the
marking data. The distance between the workpiece reference boundary and the marking
data defines the marking position on the workpiece.

Set the workpiece reference boundary at the same position as the detecting boundary of the
trigger sensor (trigger detecting position) and place the marking data.

The workpiece reference boundary is displayed in the marking image editor. You can change
the appearance of this line in “Startup” > “Preferences” > “Color and appearance” > “Color of
workpiece reference boundary” and “Type of workpiece reference boundary”.

LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), the workpiece
reference boundary is displayed in the 3D marking image editor.


ME-NAVIS2-OP-5                                                                                                  291

---

## หน้า 292

25 On-the-fly marking


Example

There is a distance of 5mm between the trigger detecting position and the marking data.

(2)


(1)                          (3)


(4)


   5mm
(5)


(6)


(7)

(1)    Trigger detecting position
(2)    Trigger sensor
(3)    Marking start position on the workpiece (lasing start boundary)
(4)    Workpiece
(5)    Workpiece reference boundary
(6)    Moving direction
(7)    Marking field

Remarks

•     The workpiece reference boundary is displayed in the marking image editor. The default
   position is the center of the marking field.

•     It is possible to set the workpiece reference boundary outside the marking field.

•     To fine-tune the marking position, change the position of the workpiece reference
   boundary or the marking data.
   ‒ To correct the marking start position backward, adjust the workpiece reference
   boundary to downstream direction.

‒ To correct the marking start position forward, adjust the workpiece reference
  boundary to upstream direction.


“Lasing start boundary [mm]”

For “Lasing start boundary [mm]”, specify the boundary position in the marking field. When
the workpiece reaches this boundary, the lasing process starts.

The boundary is measured from the center of the marking field. A positive value indicates
an upstream position (before the center of the marking field). A negative value indicates a
downstream position (after the center of the marking field).


292                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 293

25.3 On-the-fly-marking settings for one file


(2)


(1)

(3)


(4)

(1)    Moving direction
(2)    Lasing start boundary
(3)    Workpiece
(4)    Marking field

Remarks

•     If there is no on-the-fly marking error, the recommended position of the lasing start
   boundary is the center of the marking field (default setting).

•     If an error occurs because the marking speed cannot follow the line speed, specify an
   upstream position (positive value) for the lasing start boundary.

•     It is not necessary to conform the lasing start boundary to the position of the marking data
   in the marking field.

•     Place the lasing start boundary downstream of the trigger detecting position.


“Overrun correction”

If the characters at the marking start position are distorted, set a larger value for this
parameter. A larger value results in a longer marking time.


Example

With on-the-fly marking it is possible to mark data that is placed outside of the marking field.
The following drawing shows an example.

(1)                                (2)


ABCDEFGHIJKLMNOPQRSTU...


(3)


(4)

(1)    Workpiece reference boundary
(2)    Lasing start boundary
(3)    Moving direction
(4)    Marking field


ME-NAVIS2-OP-5                                                                                                  293

---

## หน้า 294

25 On-the-fly marking


Related topics

On-the-fly marking settings for all files (page 288)

Monitor the marking data in remote mode or RUN mode (page 342)


25.4     Trigger mode parameters

For on-the-fly marking, specify the mode of the marking trigger.

Select one of the following settings for “Trigger mode”:

•     “Single trigger”

•     “Marking at regular intervals”

•     “Multiple triggers”


“Single trigger”

Use the single trigger mode to input the marking trigger for every marking process. The
lasing process starts when the workpiece comes to the preset marking position. The next
trigger can be accepted after the current lasing process is finished.

(3)


(2)


(1)                                  (4)

(1)       Workpiece
(2)       Moving direction
(3)       Trigger sensor
(4)       Next workpiece


“Marking at regular intervals”

If “Marking at regular intervals” is set, the marking process is repeated at regular intervals.
To use this function, you must turn the marking trigger on before starting the marking. If you
use TRIGGER IN (X5) of the TERMINAL connector, keep the signal input ON during on-the-
fly marking.

Use this setting if the workpieces are arranged at equal distances.

The lasing process starts when the first workpiece reaches the preset marking position.
Afterwards, the marking process is executed at regular intervals until the marking trigger
turns off.


294                                                                                             ME-NAVIS2-OP-5

---

## หน้า 295

25.4 Trigger mode parameters


(2)


(3)


(1)

(1)    Workpiece
(2)    Moving direction
(3)    “Workpiece spacing [mm]”: Distance between workpieces


“Multiple triggers”

In multiple trigger mode, multiple triggers are accepted in advance.

A maximum of 16 triggers can be accepted while the trigger processing output
PROCESSING OUT (Y10) is ON.

Set this trigger mode if the distance between the trigger detecting position and the preset
marking position is so large that it will be necessary to input the next marking trigger during
the previous lasing process.

(4)


(2)


(1)                             (3)

(1)    Workpiece
(2)    Moving direction
(3)    Next workpiece
(4)    Trigger sensor


Related topics

On-the-fly marking settings for all files (page 288)


ME-NAVIS2-OP-5                                                                                                295

---

## หน้า 296

25 On-the-fly marking


25.5     Line speed control setting “2 sensors input”

If “2 sensors input” is set for “Line speed control”, use sensors to measure the line speed.

Connect the first sensor A to ENCODER A IN (X13) and the second sensor B to ENCODER
B IN (X14) of the TERMINAL connector. The line speed is calculated based on the time
difference of the sensor inputs.

(3)                  (5)                    (8)
   B                       A
   (4)
   (9)
   (6)


   (2)                                      (7)
(1)

(1)   Center of marking field
(2)   Trigger detecting position
(3)   Trigger sensor
(4)   “2 Sensors input time-out [s]”: You can specify a timeout period between turning on ENCODER B
   IN (X14) and the marking trigger e.g. signal input at TRIGGER IN (X5).
(5)   Sensor B (downstream)
(6)   Workpiece
(7)   “Distance line speed sensors [mm]”: Set the distance between the sensors so that ENCODER B
   IN (X14) (sensor B) turns on within 10s from the signal input at ENCODER A IN (X13) (sensor A).
(8)   Sensor A (upstream)
(9)   Moving direction


Related topics

On-the-fly marking settings for all files (page 288)

On-the-fly-marking settings for one file (page 290)


25.6     Specify on-the-fly marking settings

Follow the steps in this task to set on-the-fly marking parameters when marking a workpiece
in motion.

A typical step by step example is given below.

                  1.      Establish an online connection between your PC and the laser marking system.


296                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 297

25.6 Specify on-the-fly marking settings


                 2.   Go to the “Marking settings” screen and configure the layout of your marking data in
                      the marking image editor.
                      You do not have to set the position of the marking data at this moment. It will be
                      determined after you specify the on-the-fly marking settings.
                      LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), specify the
                      correct position of the marking data on the 3D model. You can check the position in
                      the 3D marking image editor. The position of the 3D model will be determined after
                      you specify the on-the-fly marking settings.

                 3.   In the “Laser settings” tab, specify settings such as “Laser power” and “Scan speed
                      [mm/s]”.
                      Make sure that the marking time is short enough to perform the marking process
                      within the required cycle time.

                 4.   Select the “On-the-fly marking” tab and select “ON” for “On-the-fly marking”.

                 5.   For “Moving direction”, specify the moving direction of the conveyor. Check the
                      direction of the laser head before you set the moving direction.


                      The icon in the marking image editor indicates the direction of the laser head.
                      LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), the icon is
                      displayed in the 3D marking image editor.

                 6.   For “Trigger mode”, specify the mode of the marking trigger.

                 7.   Select a parameter for “Line speed control”.
                      If the line speed is fixed, select “Fixed speed”. If the line speed is fluctuating, set
                      “Encoder input” or “2 sensors input”. Use an external encoder or sensors to measure
                      the line speed.
                      If “Encoder input” or “2 sensors input” is set, the current line speed is calculated
                      based on the input signals from the encoder or the sensor. You can check the line
                      speed in “Monitor” > “On-the-fly” (LP-RC, LP-RF, LP-RV) or “Real-time data” (LP-RH,
                      LP-ZV).

                 8.   Depending on the selected setting for “Line speed control”, set the following
                      parameters:
                      •   If “Fixed speed” is set, specify a value for “Line speed [m/min]”.

                      •   If “Encoder input” is set, specify a value for “Encoder resolution [pulses/mm]”.

                      •   If “2 sensors input” is set, specify values for “Distance line speed sensors [mm]”
                          and “2 Sensors input time-out [s]”.


ME-NAVIS2-OP-5                                                                                                 297

---

## หน้า 298

25 On-the-fly marking


                  9.    Measure the distance between the center of the marking field and the trigger
                        detecting position. Enter the measured value in the “Trigger detecting position [mm]”
                        text box.
                                                       (4)


                                                 (3)

                                                             (5)
                                           (2)
                              (1)                      (6)

                        (1)    Marking field center
                        (2)    “Trigger detecting position [mm]”: Distance between the center of the marking field and the
                               trigger detecting position
                        (3)    Moving direction
                        (4)    Trigger sensor
                        (5)    Workpiece
                        (6)    Trigger detecting position

                  10.   Measure the distance (d) between the trigger detecting position and the marking start
                        position on the workpiece.
                        Make sure that the distance between the workpiece reference boundary and the
                        marking data in the marking field corresponds with the measured distance (d). If
                        required, adjust the position of the workpiece reference boundary or the marking data.
                        LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), make sure
                        that the distance between the workpiece reference boundary and the marking data
                        on a 3D model corresponds with the measured distance (d). If required, adjust the
                        position of the workpiece reference boundary or the 3D model.


298                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 299

25.6 Specify on-the-fly marking settings


Example 1: The trigger detecting position is in front of the marking start position.

Example 2: The trigger detecting position is behind the marking start position.

   (2)                                             (2)
 1                                               2
(1)                    (3)
   (3)                (1)


(4)                                         (4)


(5)                                                                 (5)


(6)                                          (6)

(7)                                             (7)

(1)       Trigger detecting position
(2)       Trigger sensor
(3)       Marking start position on the workpiece
(4)       Workpiece
(5)       Workpiece reference boundary
(6)       Moving direction
(7)       Marking field

                 11.   Perform the marking time measurement.
                       If “Line speed control” is set to “Encoder input” or “2 sensors input”, specify the
                       approximate line speed for test marking and measure the marking time.
                       If you use an automatic switching function for the marking data, perform the marking
                       time measurement with characters that consist of many lines or curves such as the
                       number “8”.
                       In the measurement result of the marking time, the moving time of the workpiece is
                       included. The measurement result shows the time required from the commencement
                       of input of the marking start signal until the completion of the marking process.

                 12.   Make sure that no error with on-the-fly marking occurs.
                       •     If an error occurs because the marking speed cannot follow the line speed, specify
                             an upstream position (positive value) for the lasing start boundary.

                       •     It is not necessary to conform the lasing start boundary to the position of the
                             marking data in the marking field.

                       •     If there is no on-the-fly marking error, the recommended position of the lasing start
                             boundary is the center of the marking field (default setting).

                       •     If the problem with on-the-fly marking cannot be resolved, try the following:
                                 ‒ Reduce the marking time by increasing the scan speed, for example.

                                 ‒ Reduce the line speed.

                                 ‒ Increase the distance to the next workpiece.


ME-NAVIS2-OP-5                                                                                                   299

---

## หน้า 300

25 On-the-fly marking


                  13.    Go to the “Monitor” screen and select the “Laser pumping” tool.
                         Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                         and the status icon of the “Laser pumping” tool changes.

                  14.    Select the “Operation” tool.
                         In the dialog, select “RUN ON”. Select “Yes” to confirm.

                  15.    On-the-fly marking starts with the trigger input.

                  16.    After the marking process is finished, check the marking quality on the workpiece.

                  17.    When you are not satisfied with the marking result, check the position and
                         environment of the workpiece, the condition of the laser system, or the laser settings.
                         If character spacing is incorrect, try to adjust any of the following settings:
                         •   If “Line speed control” is set to “Fixed speed”, adjust the line speed (“Line speed
                             [m/min]”).

                         •   If “Line speed control” is set to “Encoder input”, adjust the encoder resolution
                             (“Encoder resolution [pulses/mm]”).

                         •   If “Line speed control” is set to “2 sensors input”, adjust the distance between the
                             line speed sensors (“Distance line speed sensors [mm]”).

                         If the marking start position deviates from the expected position, try the following:
                         •   To correct the marking start position backward, adjust the workpiece reference
                             boundary to downstream direction.

                         •   To correct the marking start position forward, adjust the workpiece reference
                             boundary to upstream direction.


Related topics

Set the laser head direction (page 315)

Trigger mode parameters (page 294)

On-the-fly marking settings for all files (page 288)

On-the-fly-marking settings for one file (page 290)

Monitor the marking data in remote mode or RUN mode (page 342)

Perform marking time measurement (page 60)

Perform marking in RUN mode (page 53)


300                                                                                               ME-NAVIS2-OP-5

---

## หน้า 301

26.1 Display information about the laser marking system


26     System settings


26.1   Display information about the laser marking system

In Laser Marker NAVI smart, you can easily view information about the connected laser
marking system.

When you edit a backup file in offline mode, the system information at the time of backup is
displayed.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “System settings” screen and select “System information” in the ribbon.

                 3.    The following information is displayed in the dialog:
                       •   “Model” of “Laser head”, “Oscillator unit” (LP-RV, LP-ZV), “Controller”
                       •   “Serial number” of “Laser head”, “Oscillator unit” (LP-RV, LP-ZV), “Controller”

                       •   “Lot number” of “Laser head”, “Oscillator unit” (LP-RV, LP-ZV), “Controller”

                       •   “Version” of “Laser head”, “Oscillator unit” (LP-RV, LP-ZV), “Controller”

                       •   “Controller display” (LP-RC, LP-RF, LP-RV)

                       •   “Optional network” (LP-RF, LP-RH, LP-RV, LP-ZV)

                       •   “Optional expansion board” (LP-RH, LP-ZV) if it is installed in the controller.

                 4.    To close the dialog, select “Close” or “X”.


26.2   Set the date and time

If the displayed date and time of the laser marking system are wrong, you can change them.

The current date and time are displayed under “System settings” > “Operation/information” >
“System clock” in the format YYYY-MM-DD hh:mm:ss.

•    When you edit a backup file in offline mode, only the setting for “Time zone” is displayed.

•    LP-RC, LP-RF, LP-RV: You can also check the date and time on the controller LED
   display.

•    Functional characters such as current date and time or lot are based on the system clock
   of the laser marking system (“System settings” > “System clock configuration”). Make
   sure that the date and time are correct.

•    It may happen that the system clock deviates from the accurate time due to errors of
   internal parts or low battery level. Therefore, check the system clock regularly.

•    The system clock does not set the daylight saving time automatically. Before using the
   laser marking system, check the system clock and set the correct date and time.


ME-NAVIS2-OP-5                                                                                                301

---

## หน้า 302

26 System settings


•    If you set “System settings” > “Operation/information” > “Time hold control”, you can mark
   the date of the previous day even after 0:00 AM, or temporarily stop updating of marking
   data for the time or lot function.

                     1.    Establish an online connection between your PC and the laser marking system.
                     2.    Go to the “System settings” screen and select “Operation/information”.
                           If the current date or time displayed under “System clock” is incorrect, you can change
                           them.

                     3.    Select “Change”. In the dialog, do any of the following:
                           •   Select the time for “UTC offset”. If you prefer to set the time zone by choosing a
                               location, click on the “Select by location” button. Select your location from the drop-
                               down menu and select “OK”.
                               Select the date and enter the time in the text box.
                               To update the new settings in the laser marking system, select “Apply”.

                           •   If you want to apply the PC time, date and time zone to the laser marking system,
                               select “Apply PC time”. The new settings will be updated in the laser marking system.
                           •   To exit the dialog, select “Close” or “X”.


Related topics

Functional characters for date and time (page 242)

Functional characters for lot numbers (page 246)

Use the time hold function (page 306)


26.3     Change calendar settings

Change the calendar settings, including the first day of the week and the first week of the
year.

Functional characters such as current date, expiry time or lot are based on the calendar
settings.

                     1.    Establish an online connection between your PC and the laser marking system.

                     2.    Go to the “System settings” screen and select “Operation/information”.

                     3.    Set any of the following:
                           “First day of the week”: Select the day you want to start the week. You can select
                           “Sunday” or “Monday”.
                           “First week of the year”: Select “Week of January 1” or “Week of first Thursday”.
                           •   “Week of January 1”:
                               This option specifies that the first week of the year is the week that contains January
                               1st, the first day of the year. The week which contains December 31 is the last week
                               of the year. For example, if January 1 is a Sunday and “Monday” is set for “First day
                               of the week”, the first week of the year comprises only one day (January 1, Sunday).


302                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 303

26.4 Specify a name for the laser marking system


The second week of the year starts on January 2 (Monday) and ends on January 8
(Sunday).

•   “Week of first Thursday”:
   This option specifies that the first week of the year is the week with the year's first
   Thursday in it. It may happen that the first week of the year contains a few last days
   of the previous year, or that the last week of the previous year contains January
                          1. For example, if January 1 is a Sunday and “Monday” is set for “First day of the
week”, the first week of the year starts on January 2 (Monday) and ends on January
8 (Sunday). January 1 is in the last week of the previous year.

                 4.   Select “Apply to laser marking system” in the ribbon to save the settings.
                      The new settings will be updated in the laser marking system.


Related topics

Functional characters for date and time (page 242)

Functional characters for lot numbers (page 246)


26.4   Specify a name for the laser marking system

Specify a descriptive name for the connected laser marking system that makes it easier to
identify your product.

In online mode, the name of the laser marking system is displayed in the title bar at the top
of Laser Marker NAVI smart. The name is also displayed on the “Startup” screen, when you
select a laser marking system to establish an online connection.

When you edit a backup file in offline mode, the name of the laser marking system saved in
the backup file is displayed.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “System settings” screen and select “Operation/information”.

                 3.   Select “Change” next to “Laser marker name” in the “Naming of laser marker” category.

                 4.   In the dialog, enter a name for the connected laser marking system (max. 128
                      characters).

                 5.   Select “OK”.
                      The name of the connected laser marking system is displayed under “Laser marker
                      name”.
                      The new settings will be updated in the laser marking system.


Related topics

Online connection between PC and laser marking system (page 41)


ME-NAVIS2-OP-5                                                                                                303

---

## หน้า 304

26 System settings


26.5     Set the error buzzer

If an error with the laser marking system occurs, a buzzer will sound. You can turn the
buzzer sound off.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Operation/information”.

                     3.   For “Error buzzer”, select “OFF” to deactivate the buzzer sound.
                          The initial setting is “ON”.

                     4.   Select “Apply to laser marking system” in the ribbon.

                     5.   Disconnect the online connection with the laser marking system.

                     6.   Turn off the power of the laser marking system, wait five seconds and then restart the
                          system.


                          Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                          system failure may occur.


                          The new settings will be updated in the laser marking system.


26.6     Specify remote mode settings

There are different methods to turn on remote mode. You must configure the settings for the
remote mode control in advance.

                     1.   Establish an online connection between your PC and the laser marking system.
                     2.   Go to the “System settings” screen and select “Operation/information”.

                     3.   Configure any of the following settings:
                          •   For “Remote mode switching method”, specify the method for switching to remote
                              mode:
                               ‒ By configuration software (“Configuration software”, initial setting)

                               ‒ By I/O signal (“I/O”)
                                  If “I/O” is selected for “Remote mode switching method”, you cannot switch
                                  remote mode on and off by configuration software.
                                  LP-RF, LP-RH, LP-RV, LP-ZV: Select “I/O” to control the remote mode via
                                  optional network unit (EtherNet/IP or PROFINET).

                              LP-RH, LP-ZV: If “Remote mode switching method” > “Configuration software” is
                              set, you can switch remote mode on and off by configuration software using a PC,
                              a touch panel console or a commercially available monitor. To use the touch panel
                              console or a monitor, the optional expansion board must be installed in the controller.


304                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 305

26.6 Specify remote mode settings


•   You can specify that the laser marking system will automatically start in remote mode
   when you turn on the key switch. Do the following:
   ‒ For “Remote mode switching method”, select “Configuration software”.

   ‒ For “Remote mode at power-on”, select “ON”.
•   Specify whether you want to control laser pumping, shutter operation, and guide
   laser display by I/O signals or by communication commands.
   For “Laser pumping control”, “Shutter operation control” and “Guide laser display
   control” (LP-GS051, LP-GS051-L, LP-RC350S, LP-RF, LP-RV, LP-ZV), select “I/O” or
   “Communication commands”.
   The initial setting is “I/O”.
   LP-RF, LP-RH, LP-RV, LP-ZV: Select “I/O” to control laser pumping, shutter
   operation, and guide laser display via optional network unit (EtherNet/IP or
   PROFINET).

•   “INTERLOCK alarm detection”: Specify when an alarm should be detected.
   This setting is for the alarm of the interlock functions controlled by I/O signals
   INTERLOCK 1 (X16, X17), INTERLOCK 2 (X18, X19) and REMOTE INTERLOCK IN
   (X20, for LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV).
   ‒ “Activate always under remote mode” (initial setting)

‒ “Deactivate while shutter closed”:
   With this setting, no alarm is output if you open the interlock connections and
   the shutter is closed. If you want to use a guide laser in remote mode, set
   “Deactivate while shutter closed” for “INTERLOCK alarm detection”.

                 4.   Select “Apply to laser marking system” in the ribbon.

                 5.   Disconnect the online connection with the laser marking system.

                 6.   Turn off the power of the laser marking system, wait five seconds and then restart the
                      system.


                      Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                      system failure may occur.


                      The new settings will be updated in the laser marking system.


Related topics

Specify input and output settings (page 316)

Remote mode (page 50)


ME-NAVIS2-OP-5                                                                                                     305

---

## หน้า 306

26 System settings


26.7     Use the time hold function

The time hold function allows to hold the time-based marking data for a specified period.

If you set “System settings” > “Operation/information” > “Time hold control”, you can mark
the date of the previous day even after 0:00 AM, or temporarily stop updating of marking
data for the time or lot function. This setting applies to the current and the expiry date and
time set as functional characters, lot functions based on the date and time, and counter reset
at date change.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Operation/information”.

                     3.   For “Time hold control” select “I/O” or “Activate until fixed time”.
                          •   “I/O” (default setting):
                              Retains the marking data of the date and time using the TIME HOLD IN (No. 22)
                              input of the I/O connector. If the desired timing for updating the date and time varies,
                              select “I/O”. For details, refer to the “Setup and Maintenance Guide”.

                          •   “Activate until fixed time”:
                              Select this option, if you want the date and time to be updated at a fixed time each
                              day (e.g. at 8:00 AM daily). If you select “Activate until fixed time”, the previous day’s
                              date will be marked from 0:00:00 AM until the time specified in “Deactivate time hold
                              at”.

                     4.   When “Time hold control” is set to “Activate until fixed time”, specifiy the time in
                          “Deactivate time hold at”.
                          Setting range (hh:mm): 0:01 to 23:59
                          Example: If you set “Deactivate time hold at” to 8:00 AM, the date of the previous day
                          will be marked from 0:00:00 AM to 7:59:59 AM. If you mark time-based functional
                          characters, the time 23:59:59 of the previous day will be applied to the marking data
                          from 0:00:00 AM to 7:59:59 AM.

                     5.   Select “Apply to laser marking system” in the ribbon.

                     6.   Disconnect the online connection with the laser marking system.

                     7.   Turn off the power of the laser marking system, wait five seconds and then restart the
                          system.


                          Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                          system failure may occur.


                          The new settings will be updated in the laser marking system.


306                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 307

26.8 Specify settings for the controller display


Note

•     During the period when the time hold function is activated and the marked date and time
   differ from the system clock, the DATE GAP OUT (No. 29) output of the I/O connector is
   ON. For details, refer to the “Setup and Maintenance Guide”.

•     The TIME HOLD IN (No.22) input of the I/O connector is disabled when “Time hold
   control” is set to “Activate until fixed time”.

•     The time hold function retains not only the marking data for the date, but also for the time.
   If you are marking both the date and time including the time set as lot or expiry date and
   time functions, make sure that the marking image of the functional characters for date/
   time or lot indicates your intended time. If you want to change only the update timing of
   the date without retaining the time, use the “Expiry time” instead of this function.


Related topics

Functional characters for date and time (page 242)

Functional characters for lot numbers (page 246)

Configure parameters for the counter function (page 252)


26.8   Specify settings for the controller display

Specify the controller LED display settings, including the backlight color and the display
language.

These settings are available for LP-RC, LP-RF and LP-RV.

You can specify different colors that indicate normal operation, alarm or warning output.


(1)    Controller display

                 1.     Establish an online connection between your PC and the laser marking system.

                 2.     Go to the “System settings” screen and select “Operation/information”.

                 3.     Under “Controller display”, specify the following settings:
                        •   “Color for normal operation” (initial setting: “White”): Specify a color to indicate that
                            the laser marking system is in normal operation.

                        •   “Color for warning” (initial setting: “Pink”): Specify a color to indicate that a warning is
                            output.


ME-NAVIS2-OP-5                                                                                                      307

---

## หน้า 308

26 System settings


•   “Color for alarm” (initial setting: “Red”): Specify a color to indicate that an alarm is
   output.
   When an alarm occurs and the displayed error code is in the range from E001 to
   E199, the display color is always red, regardless of the setting.
•   For “Display language”, set one of the following languages.
   ‒ Japanese

‒ English (initial setting)

‒ Simplified Chinese

                     4.    Select “Apply to laser marking system” in the ribbon to save the settings.
                           The new settings will be updated in the laser marking system.


Note

Alternatively, change the display language directly using the controller display. For details
about the operation of the display, refer to the “Setup and Maintenance Guide” of your laser
marking system.


26.9     Select compatible mode

This setting is required if you want to use the command format of the LP-400/LP-V series or
LP-M/LP-S/LP-Z series.

The LP-M/S/Z command format can only be used with the LP-ZV series.

If “LP-400/V compatible” or “LP-M/S/Z compatible” is set for “Compatible mode”, the
following settings are changed:

•    The command mode is changed from standard command mode to LP-400/V or LP-M/S/Z
   command mode. In this mode you can use the command format of the former models.

•    If you create a new marking file, the object group number 1000 is automatically created
   in the object list. Be aware that only the marking data located in the object group number
   1000 can be controlled by the LP-400/LP-V series communication commands. To control
   marking data by the LP-M/LP-S/LP-Z series communication commands, the data must be
   located in the object group numbers 1000 to 1016.

•    The parameters under “File settings” > “Compatibility with former models” are available.

                     1.    Establish an online connection between your PC and the laser marking system.

                     2.    Go to the “System settings” screen and select “Operation/information”.

                     3.    For “Compatible mode”, select “LP-400/V compatible” or “LP-M/S/Z compatible”.
                           LP-RF, LP-RH, LP-RV, LP-ZV: If you use the optional network unit (EtherNet/IP or
                           PROFINET) for command control, set “OFF” for “Compatible mode”. The command
                           format of the LP-400/LP-V series and the LP-M/LP-S/LP-Z series is not supported by
                           EtherNet/IP or PROFINET.


308                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 309

26.9 Select compatible mode


                 4.    If you select “LP-M/S/Z compatible” for “Compatible mode”, set “Former model”.
                       Select “LP-M/LP-S”, “LP-Z130”, or “LP-Z250/LP-Z256”. Depending on this setting, the
                       setting values in “Laser settings” are converted.

                 5.    Select “Apply to laser marking system” in the ribbon.
                 6.    Disconnect the online connection with the laser marking system.

                 7.    Turn off the power of the laser marking system, wait five seconds and then restart the
                       system.


                       Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                       system failure may occur.


                       The new settings will be updated in the laser marking system.

For details, refer to the “Serial Communication Command Guide: LP-400/V compatible
mode” or “Serial Communication Command Guide: LP-M/S/Z compatible mode”.


Note

•    The Command mode (RSM) command is only available if “LP-400/V compatible” or “LP-
   M/S/Z compatible” is set for “Compatible mode”.

•    In converted LP-400/LP-V files, “Compatible mode” is set to “LP-400/V compatible”. This
   is the default setting.

•    In converted LP-M/LP-S/LP-Z files, “Compatible mode” is set to “LP-M/S/Z compatible”.
   This is the default setting.

•    If “LP-400/V compatible” is set for “Compatible mode”, the command mode is always
   LP-400/V command mode when starting remote mode. If “LP-M/S/Z compatible” is set
   for “Compatible mode”, the command mode is always LP-M/S/Z command mode when
   starting remote mode. To start remote mode in standard command mode, send the
   Command mode (RSM) command, or set “OFF” for “Compatible mode” in the system
   settings.


Related topics

Convert an LP-400/LP-V backup file (page 82)

Convert an LP-M/LP-S/LP-Z backup file (page 86)

Conversion rules for LP-400/LP-V files (page 84)

Conversion rules for LP-M/LP-S/LP-Z files (page 88)

Specify parameters under “Compatibility with former models” (page 269)


ME-NAVIS2-OP-5                                                                                                      309

---

## หน้า 310

26 System settings


26.10 Configure advanced system settings

Under “Advanced system settings”, you can specify setting preferences such as a default
font or the default setting for East Asian characters.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Operation/information”.

                     3.   To open the settings dialog, select “Open settings” for “Advanced system settings”.

                     4.   In the dialog, configure any of the following settings:
                          •   “Enable graphic cache”:
                              This setting reduces the marking time of files containing graphic objects.
                              Always select the check box if you use graphic objects.
                              Initial setting: Check box is selected.

                          •   “Default setting for East Asian characters”:
                              This setting specifies the default character set for “East Asian characters” parameter
                              in “File settings”.
                              If “Japanese” is set, JIS fonts are used for the non-alphanumeric characters (file
                              number J1 and J2).
                              If “Simplified Chinese” is set, GB fonts are used for the non-alphanumeric characters
                              (file number GB1 and GB2).

                          •   “Default font for character objects”:
                              Set a default font used for character objects.

                          •   “Default font for bar code/2D code objects”:
                              Set a default font used for the human readable text of bar code or 2D code objects.

                          •   “ASCII code 5C”, “ASCII code 60”, “ASCII code 7E”:
                              Specify which symbol is marked if you set a character corresponding to the following
                              ASCII codes. This setting is applied to the characters that are input using the PC
                              configuration software and by communication control.
                               ‒ “ASCII code 5C”: “\ (Backslash)” (initial setting) or “¥ (Yen sign)”

                               ‒ “ASCII code 60”: “` (Grave accent)” (initial setting) or “´ (Left single quotation
                                 mark)”

                               ‒ “ASCII code 7E”: “~ (Tilde)” (initial setting) or “¯ (Overline)”

                          •   “Low power notice level [%]” (LP-ZV500P, LP-ZV505P, LP-ZV506P):
                              Specify a value for “Low power notice level [%]” if necessary (initial setting: 80). It is
                              used for the measurement result of the “Power check” in the “Maintenance” screen.
                              If the measured value for “Power compared to delivery state [%]” falls below the
                              specified value for “Low power notice level [%]”, you will be notified. The notification
                              is displayed in the “Power check” dialog after the measurement has been completed.
                              This setting is linked to “Low power notice level [%]” in “Maintenance” > “Power
                              check” > “Measurement”.

                          •   “Pre-scan optimization level”: “0 (Equivalent to LP-400/V/M/S/Z)”, “1”, “2”


310                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 311

26.10 Configure advanced system settings


This setting only applies to files where “Laser settings” > “Laser fine adjustment” >
“Pre-scan time [ms]” is configured. A smaller value means that a finer pre-scan
optimization is applied. If you aim to improve the marking quality of line edges,
intersections, or corners, set a smaller value. However, note that decreasing the
value will extend the marking time.
Initial setting: When converting LP-400/LP-V or LP-M/LP-S/LP-Z backup data, the
value is set to “0 (Equivalent to LP-400/V/M/S/Z)”. Otherwise, it is set to “2”.

•   “Adjust character width when justifying”:
   This setting applies to the “Character spacing type” > “Justify” option of the character
   object. If you encounter a broken character layout while using an LP-400/LP-V or LP-
   M/LP-S/LP-Z marking file, deselect the check box. Otherwise, this function should be
   enabled.
   Initial setting: When converting LP-400/LP-V or LP-M/LP-S/LP-Z backup data, the
   check box is not selected. Otherwise, the check box is selected by default.

•   “Warning if no graphic file is specified”:
   If there is a graphic object for which a graphic file has not been set, the warning
   E656 will be output when the shutter opens. When creating a marking file using
   communication commands, if you prefer to ignore this warning for convenience in
   creation or control procedures, deselect the check box.
   Initial setting: When converting LP-400/LP-V or LP-M/LP-S/LP-Z backup data, the
   check box is not selected. Otherwise, the check box is selected by default.

•   “Check DXF hatch path”:
   This setting applies when a DXF file is used as a graphic object in a marking file.
   If the filling lines in the DXF file are not created properly, deselect the check box.
   If you are using a marking file of the LP-400/LP-V or LP-M/LP-S/LP-Z series, it is
   recommended to deselect the check box. Otherwise, this function should be enabled.
   Initial setting: When converting LP-400/LP-V or LP-M/LP-S/LP-Z backup data, the
   check box is not selected. Otherwise, the check box is selected by default.
•   To exit the dialog without changes, select “Cancel” or “X”.

                 5.   Select “OK”.
                      The dialog closes.

                 6.   Select “Apply to laser marking system” in the ribbon to save the settings.
                      The new settings will be updated in the laser marking system.


Related topics

About font files (page 71)

Specify the East Asian character set (page 265)

Inspect the laser power with the power check function (page 352)

Fine-tune the laser settings (page 274)

Set the character spacing of a character object along a straight line (page 112)

Tips for improving the marking quality of a graphic (page 142)


ME-NAVIS2-OP-5                                                                                                  311

---

## หน้า 312

26 System settings


26.11 Set parameters for the touch panel console and monitor

If you operate the laser marking system with the optional touch panel console or a
commercial monitor, specify the system settings under “Console/monitor”. To use the touch
panel console or a monitor, the optional expansion board must be installed in the controller.

This setting is available for the LP-RH and LP-ZV series.

For details about the operation with the touch panel console and monitor, refer to the “Touch
Panel Console Instruction Manual”.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Operation/information”.

                     3.   Under “Console/monitor”, specify any of the following settings:
                          •   For “User login at startup”, select one of the following options:
                               ‒ “Unspecified”: The “User selection/information” screen is displayed when the
                                 touch panel console or monitor is activated.

                               ‒ “Administrator”: As “Administrator” you have access to all screens and settings.
                                 If no password is set for the “Administrator” role, you are automatically logged
                                 in as “Administrator”. If a password is set for the “Administrator” role, the “User
                                 selection/information” screen is displayed as soon as the touch panel console or
                                 monitor is activated.

                               ‒ “Restricted user”: When using the touch panel console or monitor, the default
                                 user is set to “Restricted user”. As “Restricted user” you do not have access to
                                 the “Data management” and “System settings” screen.

                          •   “Screen refresh method of “Monitor” screen”: When using the touch panel console
                              or monitor, this setting updates the marking image, the “Current settings” and
                              “Reference character strings” tabs. If the marking file contains a large amount of
                              data and the display is loading slowly, set a longer refresh interval. Alternatively, set
                              “Button “Refresh screen””.
                              Select one of these options:
                               ‒ “Button “Refresh screen””: Select this option if you want to refresh the “Monitor”
                                 screen manually using the “Refresh screen” button.

                               ‒ “Auto”: Updates the “Monitor” screen automatically at regular intervals that you
                                 specified.

                               ‒ “Refresh interval of “Monitor” screen [s]”: If “Auto” is set for “Screen refresh
                                 method of “Monitor” screen””, specify the interval period for refreshing the
                                 “Monitor” screen (initial setting: 0.5s).

                          •   “Default layout of “Monitor” screen”: When using the touch panel console or a
                              monitor, select one of these options to set the default “Monitor” screen layout:
                               ‒ “Standard” (initial setting): Select this option to set the standard layout showing
                                 the marking image and the parameters in the “Current settings”, “Reference
                                 character strings” and “Real-time data” tabs.

                               ‒ “Marking image only”: Select this option if you want to show a larger marking
                                 image without any parameters.


312                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 313

26.12 Specify the laser power correction


•   “Resolution (VGA)”: Configure this setting if you use a commercial monitor.
   Depending on the size of your monitor, select “1280 × 1024” or “1440 × 900”.

•   “Screen timeout”: Specify this setting if you use a touch panel console.
   Select one of these options:
   ‒ “Disabled”: The screen backlight stays always on.

‒ “Enabled”: The screen backlight turns off automatically after the specified period
  if you do not operate the touch panel console. The backlight turns on again when
  you touch the screen.

‒ “Timeout period [min]”: If “Enabled” is set for “Screen timeout”, specify the time it
  takes until the backlight turns off (initial setting: 1min).

                 4.   Select “Apply to laser marking system” in the ribbon to save the settings.

                 5.   If you change the setting for “Resolution (VGA)”, disconnect the online connection with
                      the laser marking system.
                      Turn off the power of the laser marking system, wait five seconds and then restart the
                      system.


                      Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                      system failure may occur.


                      The new settings will be updated in the laser marking system.


26.12 Specify the laser power correction

With this setting, you can correct the laser power value in all files saved in the laser marking
system.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “System settings” screen and select “System offset”.

                 3.   You can specify the following parameters:
                      •   For “Laser power correction [%]”, enter a correction value.
                          The correction value is applied to the “Laser power” parameter under “Laser
                          settings”. This setting does not correct the maximum laser power [W] value.
                          If the correction setting results in the laser power value to exceed 100, the marking is
                          performed with the laser power setting value 100.
                          The setting applies to all files in the laser marking system.

                      •   LP-GS, LP-RH: If the laser power at the first stroke is not stable, enter a correction
                          value (between -100 and +100) for “Laser start-up tuning” under “Laser fine
                          adjustment” to improve the marking quality. With a larger value, you can achieve a
                          darker or wider marking result at the beginning of the marking.

                 4.   Select “Apply to laser marking system” in the ribbon to save the setting.
                      The new setting will be updated in the laser marking system.


ME-NAVIS2-OP-5                                                                                                     313

---

## หน้า 314

26 System settings


Related topics

Set laser parameters (page 273)


26.13 Adjust the marking field position

Specify different parameters to fine-tune the marking position. The settings apply to all files
in the laser marking system.

Make sure that you have specified the correct head direction setting. When you change the
head direction setting, check if the marking field is positioned as intended.

The settings are not reflected in the marking image editor.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “System offset”.
                     3.   You can specify different parameters to correct the marking position.
                          The following figure shows these parameters.
                                                       (3)


                                                       +Z
                                                                 (2)
                                          -X


                                                             +
                                                             Y


                          (5) +                                        - (4)
                                          -Y


                                                             +
                                                             X


                                                                 (1)
                                                       -Z


                          (1)    X-axis offset
                          (2)    Y-axis offset
                          (3)    Z-axis offset
                          (4)    Rotation offset (-)
                          (5)    Rotation offset (+)

                          •     “X-axis offset [mm]”, “Y-axis offset [mm]”:
                                Enter a value to position the marking field along the x-axis and y-axis.
                                With the x-/y-axis offset, you can shift the position of the marking field coordinates.
                                However, you cannot use the whole original marking field, because the available
                                range is defined by the lens and other optical devices.


314                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 315

26.14 Set the laser head direction


Example

The following drawing is an example to illustrate the available marking field (gray) with x-/
y-axis offset. The available marking field is restricted to the area that overlaps the original
position of the marking field.

(1)
   (2)


(3)

(1)   Original position of the marking field
(2)   Offset x-/y-position of the marking field
(3)   Available area for marking

•   “Z-axis offset [mm]” (LP-ZV, LP-GS except LP-GS051-L):
   Enter a value to position the marking field along the z-axis.

•   “Rotation offset [°]”:
   Specify an angle to rotate the marking field. The rotation center is the center of the
   marking field.

•   “X-scaling [%]”, “Y-scaling [%]”:
   Enlarge or reduce the size of the marking field by a specific percentage. The scaling
   center is the center of the marking field.

                 4.    Select “Apply to laser marking system” in the ribbon to save the settings.
                       The new settings will be updated in the laser marking system.


Related topics

Set the laser head direction (page 315)


26.14 Set the laser head direction

Set the direction of the laser head that corresponds to the actual installation direction.

When you change the head direction setting, check if the marking field is positioned as
intended.

The following two system settings require that you select the head direction “No. 1”:

•    “Marking field calibration” (LP-RF, LP-RV, LP-ZV)

•    “Power optimization by marking position” (LP-GS, LP-RC, LP-RH)

                 1.    Establish an online connection between your PC and the laser marking system.


ME-NAVIS2-OP-5                                                                                                               315

---

## หน้า 316

26 System settings


                     2.   Go to the “System settings” screen and select “System offset”.
                          The current setting of the laser head direction is displayed under “Head direction to axis”
                          and in the marking image editor (“Marking settings” screen). “F” indicates the front of the
                          laser head.
                          LP-ZV: If 3D marking is turned on (“File settings” > “3D marking” > “ON”), the icon is
                          displayed in the 3D marking image editor.

                     3.   Select “Change” to open the dialog.

                     4.   In the dialog, do any of the following:
                          •   To choose a laser head direction, select an image (“No. 1” to “No. 4”).

                          •   Select “Apply”.

                          •   To confirm, select “OK”.
                              The new setting will be updated in the laser marking system.

                          •   To exit the dialog, select “Close” or “X”.


Related topics

Calibrate the marking field (page 332)

Optimize the laser power of specific marking field areas (page 330)

Marking image editor (page 90)


26.15 Specify input and output settings

If you use I/O signals for control, you can change the one-shot pulse duration, configure the
output of warnings at invalid trigger signals, and make terminal assignments.

                     1.   Establish an online connection between your PC and the laser marking system.
                     2.   Go to the “System settings” screen and select “Inputs/outputs”.

                     3.   Specify any of the following parameters:
                          •   “One-shot pulse duration [ms]” (initial setting: 40ms):
                              Change the ON-time for one-shot outputs, e.g. PROCESSING END OUT (Y11).
                              One-shot output terminals:
                               ‒ PROCESSING END OUT (Y11)

                               ‒ PROCESSING FAIL OUT (Y12)

                               ‒ SET OK OUT (No. 28)

                               ‒ CHECK OK OUT (No. 34)

                               ‒ CHECK NG OUT (No. 35)

                          •   “Warning at invalid trigger signal” (initial setting: “Enabled”):
                              Select “Disabled” to deactivate the warning that is output when invalid marking
                              trigger signals are detected while the trigger processing output PROCESSING OUT
                              (Y10) is ON.


316                                                                                               ME-NAVIS2-OP-5

---

## หน้า 317

26.16 Specify Ethernet communication settings


If “Enabled” is selected, the warning E750 is output. The warning is automatically
cleared after 3s.

•   “Terminal assignment X11” (LP-GS, initial setting: LASER STOP 2 IN):
   Change the behavior of the input X11 from LASER STOP 2 IN to LASER STOP 1 IN,
   if required.
   For details, refer to the “Setup and Maintenance Guide”.

•   “TARGET DETECTION IN (X7)” (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV, initial setting:
   “Disabled”):
   Enable this input if you use a sensor to check that the workpiece is in the marking
   position during the lasing process.

•   “Assignment of counter end outputs”:
   Change the counter numbers for the counter end outputs A to D (I/O terminal No. 30
   to 33). The initial settings for counter end outputs A to D are counter number 0 to 3,
   respectively.

                 4.    Select “Apply to laser marking system” in the ribbon.
                 5.    Disconnect the online connection with the laser marking system.

                 6.    Turn off the power of the laser marking system, wait five seconds and then restart the
                       system.


                       Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                       system failure may occur.


                       The new settings will be updated in the laser marking system.


Related topics

Specify remote mode settings (page 304)


26.16 Specify Ethernet communication settings

To establish an Ethernet connection, make the network settings in Laser Marker NAVI smart
according to the requirements of your network environment.

•    Using a hub or a router, you can connect multiple devices simultaneously to the Ethernet
   interface, such as a PC for configuration, a PLC for command control, and a code reader
   to check the marking results.

•    Ethernet communication should be performed in a secure network environment.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “System settings” screen and select “Communication”.


ME-NAVIS2-OP-5                                                                                                      317

---

## หน้า 318

26 System settings


                     3.    Set the Ethernet communication settings according to your network environment.
                           Even if the values for the IP address and the subnet mask are within the configurable
                           range, they may be invalid because of their combination.
                           •   “IP address”: 1.0.0.0–223.255.255.255 (do not use 127 for the first octet)
                               Initial setting: 192.168.1.5
                               Enter an IP address, which is not already used by the laser marking system or by the
                               PC.

                           •   “Subnet mask”: 128.0.0.0–255.255.255.254
                               Initial setting: 255.255.255.0

                           •   “Default gateway”: 1.0.0.0–223.255.255.255 (do not use 127 for the first octet)
                               Initial setting: 0.0.0.0 (unspecified)

                           •   “Port for PC configuration software”: 1025–65534 (do not use 9090)
                               Initial setting: 9093

                           •   “Port for communication commands”: 1025–65534 (do not use 9090)
                               Initial setting: 9094
                               Set different port numbers for “Port for PC configuration software” and “Port for
                               communication commands”.

                           •   “MAC address”: Displays the MAC address.

                     4.    Select “Apply to laser marking system” in the ribbon.

                     5.    Disconnect the online connection with the laser marking system.

                     6.    Turn off the power of the laser marking system, wait five seconds and then restart the
                           system.


                           Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                           system failure may occur.


                           The new settings will be updated in the laser marking system.


Related topics

Establish an Ethernet connection between PC and laser marking system (page 43)


26.17 Specify RS-232C communication settings

If you are using the RS-232C interface, align the RS-232C communication settings with the
external device.

•    Use the RS-232C interface to control the laser marking system by communication
   commands or to connect a code reader.

•    For details about command control, refer to the “Serial Communication Command Guide”.

                     1.    Establish an online connection between your PC and the laser marking system.


318                                                                                                     ME-NAVIS2-OP-5

---

## หน้า 319

26.18 Enable Bluetooth


                 2.    Go to the “System settings” screen and select “Communication”.

                 3.    Specify the following RS-232C communication settings:
                       •   “RS-232C usage”:
                           Select “Communication commands” to control the laser marking system by
                           communication commands.
                           Select “Code reader” if you connect a code reader.

                       •   “Baud rate [bit/s]”: Select the baud rate.
                           Initial setting: 9600

                       •   “Data length [bit]”: 8 (fixed)

                       •   “Parity”: “None” (initial setting), “Even” or “Odd”

                       •   “Stop bits [bit]”: “1” (initial setting) or “2”

                       •   “Check sum”: “OFF” (initial setting) or “ON”
                           The checksum is used to detect an error in data communication.

                       •   “End code”: “CR” (initial setting) or “CR+LF”
                           The end code identifies the end of a message.

                 4.    Select “Apply to laser marking system” in the ribbon.

                 5.    Disconnect the online connection with the laser marking system.

                 6.    Turn off the power of the laser marking system, wait five seconds and then restart the
                       system.


                       Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                       system failure may occur.


                       The new settings will be updated in the laser marking system.


26.18 Enable Bluetooth

If the laser marking system supports Bluetooth, you can turn it on or off in the
“Communication” tab.

•    The Bluetooth function is available for the following models: LP-GS051, LP-GS051-E, LP-
   GS051-L, LP-GS051-LE, LP-GS052, LP-GS052-E

•    If both, your PC and laser marking system, support Bluetooth, you can establish an online
   connection via Bluetooth. It cannot be guaranteed, that every Bluetooth enabled device
   can connect with the laser marking system.

•    For details about Bluetooth, refer to the “Setup and Maintenance Guide”.

                 1.    Connect the laser marking system and the PC with a USB cable or with a LAN cable.

                 2.    Establish an online connection between your PC and the laser marking system.

                 3.    Go to the “System settings” screen and select “Communication”.


ME-NAVIS2-OP-5                                                                                                      319

---

## หน้า 320

26 System settings


                     4.   Under “Bluetooth communication”, select “Enabled” to turn Bluetooth on. Select
                          “Disabled” to turn it off.

                     5.   Select “Apply to laser marking system” in the ribbon.

                     6.   Disconnect the online connection with the laser marking system.
                     7.   Turn off the power of the laser marking system, wait five seconds and then restart the
                          system.


                          Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                          system failure may occur.


                          The new setting will be updated in the laser marking system.


Related topics

Establish a Bluetooth connection between PC and laser marking system (page 45)


26.19 Specify EtherNet/IP communication settings

If you are using the optional EtherNet/IP network unit, configure the communication settings.
EtherNet/IP communication is supported by LP-RF, LP-RH, LP-RV, and LP-ZV.

EtherNet/IP communication should be performed in a secure network environment.

For details about the EtherNet/IP configuration, refer to the “EtherNet/IP Communication
Guide”.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Communication”.

                     3.   Specify the EtherNet/IP communication settings.
                          •   “DHCP”:
                              Select “ON” (initial setting) to import the settings automatically for IP address, subnet
                              mask and default gateway from the DHCP server. If the network settings such as IP
                              address are not updated, check the connection status of the DHCP server.
                              Select “OFF” if you want to specify particular values for IP address, subnet mask and
                              default gateway.

                          •   Network settings
                              If “ON” is set for “DHCP”, IP address, subnet mask and default gateway are
                              displayed.
                              If “OFF” is set for “DHCP”, specify the values for IP address, subnet mask and
                              default gateway.
                               ‒ “IP address”: 0.0.0.0–223.255.255.255 (do not use 127 for the first octet)
                                  Initial setting: 0.0.0.0

                               ‒ “Subnet mask”: 0.0.0.0–223.255.255.254


320                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 321

26.19 Specify EtherNet/IP communication settings


Initial setting: 0.0.0.0
Even if the value for the subnet mask is within the configurable range, it may be
invalid because of its combination.

‒ “Default gateway”: 0.0.0.0–223.255.255.255 (do not use 127 for the first octet)
   Initial setting: 0.0.0.0

‒ “MAC address”: Displays the MAC address.

•   “Firmware version”:
   Displays the version of the installed EtherNet/IP network unit.

•   “LM → PLC data size (T → O) [byte]”:
   Displays the maximum data size that can be sent from your laser marking system to
   your PLC.
   460 bytes (fixed)

•   “PLC → LM data size (T → O) [byte]”:
   Displays the maximum data size that can be sent from your PLC to your laser
   marking system.
   320 bytes (fixed)

•   “Explicit message data size [byte]”:
   Specifies the maximum size of the explicit message. Check the specification of your
   PLC and set a value that can be accepted by the PLC.
   Setting range: 64–1448 bytes
   Initial setting: 300 bytes

•   “Control method of input signals”:
   To open the settings dialog, select “Open settings”.
   Specify the control method for inputs on the TERMINAL connector and I/O
   connector. Select “I/O” (initial setting) or “EtherNet/IP”.
   Select “I/O to all” or “EtherNet/IP to all” to change the control method for all inputs at
   once.
   The inputs REMOTE INTERLOCK IN, INTERLOCK 1 and INTERLOCK 2 cannot be
   controlled via EtherNet/IP.
   For the following inputs, settings are activated if the control method is set to “I/O” in
   “System settings” > “Operation/information”.
   ‒ REMOTE IN (remote mode switching method)

‒ LASER SUPPLY IN (laser pumping control)

‒ SHUTTER IN, SHUTTER ENABLE IN (shutter control)

‒ GUIDE IN (guide laser control)

Select “OK” to close the dialog.

                 4.   Select “Apply to laser marking system” in the ribbon.

                 5.   Disconnect the online connection with the laser marking system.


ME-NAVIS2-OP-5                                                                                                   321

---

## หน้า 322

26 System settings


                     6.   Turn off the power of the laser marking system, wait five seconds and then restart the
                          system.


                          Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                          system failure may occur.


                          The new settings will be updated in the laser marking system.


Related topics

Specify remote mode settings (page 304)


26.20 Specify PROFINET communication settings

If you are using the optional PROFINET network unit, configure the communication settings.
PROFINET communication is supported by LP-RF, LP-RH, LP-RV, and LP-ZV.

PROFINET communication should be performed in a secure network environment.

The inputs REMOTE INTERLOCK IN, INTERLOCK 1, and INTERLOCK 2 cannot be
controlled via PROFINET.

For details about the PROFINET configuration, refer to the “PROFINET Communication
Guide”.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Communication”.

                     3.   Specify the PROFINET communication settings.
                          •   “Device name”:
                              Displays the PROFINET device name (initial setting: “LP-Device”).
                              The name can be changed with your controlling device such as a PLC. For the
                              naming rules, follow the specifications of PROFINET communication.

                          •   Network settings
                              Displays the current settings of the network. You can change the IP address, subnet
                              mask and default gateway with your controlling device such as a PLC.
                               ‒ “IP address”: 0.0.0.0–223.255.255.255

                               ‒ “Subnet mask”: 128.0.0.0–225.255.255.254

                               ‒ “Default gateway”: 0.0.0.0–223.255.255.255

                               ‒ “MAC address 1”

                               ‒ “MAC address 2”

                          •   “Firmware version”:
                              Displays the version of the installed PROFINET network unit.

                          •   “Control method of input signals”:


322                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 323

26.21 Specify the command format


To open the settings dialog, select “Open settings”.
Specify the control method for inputs on the TERMINAL connector and I/O
connector. Select “I/O” (initial setting) or “PROFINET”.
Select “I/O to all” or “PROFINET to all” to change the control method for all inputs at
once.
For the following inputs, settings are activated if the control method is set to “I/O” in
“System settings” > “Operation/information”.
 ‒ REMOTE IN (remote mode switching method)

‒ LASER SUPPLY IN (laser pumping control)

‒ SHUTTER IN, SHUTTER ENABLE IN (shutter control)

‒ GUIDE IN (guide laser control)

Select “OK” to close the dialog.

                 4.   Select “Apply to laser marking system” in the ribbon.

                 5.   Disconnect the online connection with the laser marking system.
                 6.   Turn off the power of the laser marking system, wait five seconds and then restart the
                      system.


                      Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                      system failure may occur.


                      The new settings will be updated in the laser marking system.


Related topics

Specify remote mode settings (page 304)


26.21 Specify the command format

For command control, you can customize the command format, the encoding for non-ASCII
characters, and the input method for control codes in 2D codes.

For details about command control, refer to the “Serial Communication Command Guide”.

LP-400/LP-V or LP-M/LP-S/LP-Z: To use the commands of these product series, set
“LP-400/V compatible” or “LP-M/S/Z compatible” for “Compatible mode” in Laser Marker
NAVI smart. In this case, the LP-400/LP-V or LP-M/LP-S/LP-Z settings for start code,
response code, and encoding for non-ASCII characters will be applied, regardless of any
other settings. For details, refer to the “Serial Communication Command Guide: LP-400/V
compatible mode” or “Serial Communication Command Guide: LP-M/S/Z compatible mode”.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “System settings” screen and select “Communication”.


ME-NAVIS2-OP-5                                                                                                     323

---

## หน้า 324

26 System settings


                     3.   Make the following settings in the “Command format (standard mode)” category:
                          •   “Start code”: “STX” (initial setting) or “None”
                              LP-RF, LP-RH, LP-RV, LP-ZV: If you use the optional network unit (EtherNet/IP or
                              PROFINET) for command control, the start code is not required, regardless of this
                              setting.

                          •   “Include command in response”: “ON” (initial setting) or “OFF”
                              LP-RF, LP-RH, LP-RV, LP-ZV: If you use the optional network unit (EtherNet/IP or
                              PROFINET) for command control, the command is included in the response data,
                              regardless of this setting.

                          •   Response code: Any single-byte ASCII code from 01h to 7Fh. The initial settings are:
                               ‒ “Positive response code”: A

                               ‒ “Negative response code”: E

                               ‒ “Read request response code”: A

                              To set another response code, select “Change”. In the dialog, select a response code
                              and select “OK”.
                          •   For “Encoding for non-ASCII characters”, select “Shift JIS” (initial setting), “GB 2312”
                              or “Latin-1”.
                              This setting is required for European special characters, Japanese and Chinese
                              characters which cannot be specified by ASCII codes. Select “Shift JIS” for Japanese
                              characters and “GB 2312” for simplified Chinese. If you use European special
                              characters such as À or Ä, select “Latin-1”.

                          •   To enter control codes in bar code or 2D code character strings via communication
                              commands or optional network unit (EtherNet/IP or PROFINET), specify the settings
                              for “Input method for control codes”.
                              This setting is also applied to the data of the read request response.
                              This setting only applies to the control codes in bar code/2D code strings, but not to
                              general control codes used in the message such as STX or CR.
                               ‒ Select “Open settings”.

                               ‒ In the dialog, select “Input EOT/FS/GS/RS/US directly using ASCII code” or
                                 “Input all ASCII control codes using alternative code” (initial setting).

                               ‒ “Input FNC1 using ASCII GS” (initial setting): If you select “Input all ASCII control
                                 codes using alternative code”, select this option to use the ASCII control code to
                                 input the separator “FNC1”. If the check box is not selected, use the alternative
                                 code.

                               ‒ Select “OK”. The dialog closes.

                     4.   Select “Apply to laser marking system” in the ribbon.

                     5.   Disconnect the online connection with the laser marking system.

                     6.   Turn off the power of the laser marking system, wait five seconds and then restart the
                          system.


                          Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or
                          system failure may occur.


324                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 325

26.22 Make imagechecker communication settings


The new settings will be updated in the laser marking system.


26.22 Make imagechecker communication settings

When linking the laser marking system with an imagechecker, you need to specify the
settings for the imagechecker connection.

The following functions are not available if you use the link function with imagecheckers:

•    On-the-fly-marking

•    TARGET DETECTION IN (X7) input of TERMINAL connector

•    “Continuous trigger” under “Marking settings” > “File settings” > “Trigger mode”

For details about connecting image processing devices, refer to the “Setup and Maintenance
Guide” of your laser marking system.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “System settings” screen and select “Linked device”.

                 3.    Enter the communication settings according to the required functions.
                       “Image checking before marking”:
                       •   “Model”: PV230/PV200 can be used for marking position correction.

                       •   “IP address”: Set an IP address for the connected imagechecker.
                           0.0.0.0–223.255.255.255 (do not use 127 for the first octet)
                           Initial setting: 0.0.0.0

                       •   “Port (result output)”: 8601 (fixed)

                       •   “Port (command transmission)”: 8604 (fixed)

                       “Image checking after marking”:
                       •   “Model”: PV230, PV200, DataMan or LP-ABR11/LP-ABR12 can be used for checking
                           the marking result. (Only LP-GS, LP-RC, LP-RF and LP-RV can be connected to LP-
                           ABR11/LP-ABR12.)

                       •   “IP address”: Set an IP address for the connected imagechecker.
                           0.0.0.0–223.255.255.255 (do not use 127 for the first octet)
                           Initial setting: 0.0.0.0

                       •   For PV230/PV200:
                           “Port (result output)”: 8601 (fixed)

                       •   “Port (command transmission)”:
                            ‒ PV230/PV200: 8604 (fixed)

                            ‒ DataMan: 1–65535
                                Initial setting: 23

                            ‒ LP-ABR11/LP-ABR12: 1–65535


ME-NAVIS2-OP-5                                                                                                325

---

## หน้า 326

26 System settings


Initial setting: 27110

                     4.   Select “Apply to laser marking system” in the ribbon to save the settings.

                     5.   Disconnect the online connection with the laser marking system.
                     6.   Turn off the power of the laser marking system, wait five seconds and then restart the
                          system.
                          The new settings will be updated in the laser marking system.


26.23 Specify settings for code reader functions

When linking the laser marking system with a code reader, you need to specify the settings
for the code reader functions.

For details about connecting image processing devices, refer to the “Setup and Maintenance
Guide” of your laser marking system.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Linked device”.

                     3.   Under “Code reader”, make settings according to the required functions.
                          •   “Control function”:
                              Select “File switching by name”, “File switching by number”, or “Character
                              transmission”.

                          •   “Data extraction”:
                              Set to “ON” to extract and transfer only a part of the code read. If “OFF” is selected,
                              all characters of the code string are transmitted.
                              The data extraction function cannot be used for code strings with variable-length
                              data.

                          •   “Extraction start position [byte]”:
                              Specify the start position for the code extraction.
                              Setting range: 1–299 bytes

                          •   “Extraction length [byte]”:
                              Specify the data length for code extraction.
                              Setting range for “Character transmission” and “File switching by name”: 1–299 bytes
                              Setting range for “File switching by number”: 4 bytes (fixed)
                              Example: Read code characters ABCDE and transfer BCD to the laser marking
                              system as follows: “Extraction start position [byte]”: 2, “Extraction length [byte]”: 3.
                               ‒ Count one single byte character as one byte.

                               ‒ The extraction position setting applies to all data captured when using this
                                 function.

                               ‒ If the code to be captured is shorter than the string to extract, the code is not
                                 captured.

                               ‒ Make sure the checksum setting is “OFF”. Otherwise the checksum is
                                 transferred to the laser marking system as marking data.


326                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 327

26.24 Specify settings for an external displacement sensor


‒ The end code is not part of the extracted string.

•   “Target object number”:
   Enter the object number if “Character transmission” is set for “Control function”. The
   character data read will be transferred to the object number specified here.
   Setting range: 0–1999
   You can specify object numbers of character objects and of bar code or 2D code
   objects.

                 4.   Select “Apply to laser marking system” in the ribbon to save the settings.


26.24 Specify settings for an external displacement sensor

Before you use the autofocus function, specify all settings in advance. This setting is
available for the LP-ZV series.

The autofocus function is available if the optional expansion board is installed in the
controller.

For details about the installation method when using the autofocus function and control
method of the external displacement sensor, refer to the “Setup and Maintenance Guide”.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “System settings” screen and select “Linked device”.

                 3.   Under “Displacement sensor”, specify the following parameters depending on the
                      specifications and installation conditions of the displacement sensor.
                      •   “Input method”: “Analog current input” (fixed)
                          Displays the type of input signal available on the laser marking system. Displacement
                          sensors with other types of output signals cannot be used.

                      •   “Workpiece displacement at 4mA [mm]”, “Workpiece displacement at 20mA [mm]”:
                          Specify the values at which the analog outputs of the displacement sensor are 4mA
                          and 20mA respectively. It is possible to enter values in the range from -200.000mm
                          to 200.000mm. However, with the laser marking system the work distance value can
                          be adjusted only in the range from -25mm to 25mm.
                          The work distance is adjusted based on the measured workpiece displacement. The
                          workpiece displacement is 0mm if the laser head is installed at base position (LP-
                          ZV200P/LP-ZV500P: 190mm, LP-ZV205P/LP-ZV505P: 220mm, LP-ZV206P/LP-
                          ZV506P: 330mm).
                          Enter a positive value to reduce the work distance and a negative value to increase
                          the work distance.


ME-NAVIS2-OP-5                                                                                               327

---

## หน้า 328

26 System settings


(1)


(2)         (5)
   +25
   0
(3)
   -25
   (4)
   [mm]

(1)   Laser head
(2)   Work distance (base position)
(3)   Workpiece displacement (measured by an external displacement sensor)
(4)   Workpiece
(5)   Correction range of the workpiece displacement


Example 1

For this setting example, a displacement sensor with the following specifications is used:

•   Analog current output: 4mA to 20mA

•   Measurement center distance: 120mm

•   Measurement range: ±60mm (60mm to 180mm measured from the surface of the sensor
   head)

Install the displacement sensor at a position at which the measurement center distance of
the sensor and the base position of the laser marking system are at the same height. Under
“System settings” > “Linked device” > “Displacement sensor”, set the following values:

•   “Workpiece displacement at 4mA [mm]”: +60mm

•   “Workpiece displacement at 20mA [mm]”: -60mm


328                                                                                                ME-NAVIS2-OP-5

---

## หน้า 329

26.24 Specify settings for an external displacement sensor


(7)


(3)

   (1)
   (2)                  (5)
  60mm
  (4mA)         +60mm
   (4)                 (8)
   +25mm
120mm                                                    0mm
   (6)
   -25mm
180mm
(20mA)          -60mm

(1)    Measurement range of the displacement sensor
(2)    Setting values of “Workpiece displacement at 4mA [mm]” and “Workpiece displacement at 20mA
   [mm]” (distance measured from the base position of the laser marking system)
(3)    Displacement sensor
(4)    Measurement center distance (measured from the surface of the sensor head)
(5)    Work distance (base position) of the laser marking system
(6)    Workpiece
(7)    Laser head
(8)    Correction range of the workpiece displacement


Example 2

For this setting example, a displacement sensor with the following specifications is used:

•     Analog current output: 4mA to 20mA

•     Measurement center distance: 250mm

•     Measurement range: ±150mm (100mm to 400mm measured from the surface of the
   sensor head)

Install the displacement sensor at a position at which the measurement center distance
of the sensor and the base position of the laser marking system are 30mm apart. Under
“System settings” > “Linked device” > “Displacement sensor”, set the following values:

•     “Workpiece displacement at 4mA [mm]”: +120mm

•     “Workpiece displacement at 20mA [mm]”: -180mm


ME-NAVIS2-OP-5                                                                                                    329

---

## หน้า 330

26 System settings


(7)


(3)


(1)            (2)

100mm             +120mm
   (5)
 (4mA)
   (4)
   (8)
   30mm                                           +25mm
   0mm
250mm                                                     -25mm
   (6)


400 mm
(20 mA)           -180mm

(1)    Measurement range of the displacement sensor
(2)    Setting values of “Workpiece displacement at 4mA [mm]” and “Workpiece displacement at 20mA
   [mm]” (distance measured from the base position of the laser marking system)
(3)    Displacement sensor
(4)    Measurement center distance (measured from the surface of the sensor head)
(5)    Work distance (base position) of the laser marking system
(6)    Workpiece
(7)    Laser head
(8)    Correction range of the workpiece displacement


Related topics

Use the autofocus function (page 271)

Check the workpiece displacement (page 61)


26.25 Optimize the laser power of specific marking field areas

With this setting, you can adjust the laser power setting of specific marking field areas such
as the corners of the marking field. Laser power optimization is available for LP-GS, LP-RC,
and LP-RH.

The laser power optimization settings are performed based on the x- and y-axis of head
direction “No. 1”. Make sure the head direction is set to “No. 1” before making settings under
“Power optimization by marking position”.

•     Use the laser power optimization settings to offset marking density differences of specific
   areas in the marking field. For example, there might be marking density differences
   between the center and the edges of the marking field.

•     The settings apply to all files in the laser marking system.


330                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 331

26.25 Optimize the laser power of specific marking field areas


•    The laser power optimization settings do not change the maximum laser power [W] value.
   The correction value is applied to the “Laser power” parameter under “Laser settings”.
   The actual maximum output power relative to the initial power remains unaffected by the
   laser power optimization settings.
   If the power optimization setting results in the laser power value to exceed 100, the
   marking is performed with the laser power setting value 100.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “System settings” screen and select “System offset”.

                 3.    For “Power optimization by marking position”, select “ON”.
                       Initial setting (LP-GS, LP-RH): “OFF”
                       Initial setting (LP-RC): “ON”

                 4.    Select “Details”. In the dialog, do any of the following:
                       •   Adjust the laser power along the x- and y-axis of the marking field. Enter a correction
                           value in the text box for “X-axis (+)”, “X-axis (-)”, “Y-axis (+)” and “Y-axis (-)”.
                           Alternatively use the slider and the arrows to adjust the correction value.
                           The laser power correction rate of each marking field area is displayed in the image
                           on the left side.

                       •   Adjust the laser power in the corners of the marking field. Enter a correction value in
                           the text box for “Top left”, “Top right”, “Bottom right” and “Bottom left”. Alternatively
                           use the slider and the arrows to adjust the correction value.
                           The laser power correction rate of each marking field area is displayed in the image
                           on the left side.
                           The laser power correction rate for the corners, for example the “Top left” corner, is
                           the result of multiplying the values of “Top left”, “X-axis (-)” and “X-axis (-)”.

                       •   The laser power value at the center of the marking field is set to 100%.

                       •   Select “Apply”.
                           The new settings will be updated in the laser marking system.
                       •   Select “Test marking/guide laser” to perform a test marking process with the file
                           selected in the “Marking settings” screen. Use this function to test the marking result
                           with the set laser power optimization settings.

                       •   Select “Reset to default” to reset all values to the initial settings.

                       •   To exit the dialog, select “Close” or “X”.


Tip

To determine the appropriate correction values effectively do the following:

•   First, set a correction value for the laser power along the x- and y-axis.

•   Perform a test marking to check the marking quality with these settings on the actual
   marking surface. If necessary, readjust the values.

•   Enter correction values for the corners to fine-tune the marking quality.

•   Always perform test marking to check if the marking result is as intended.


ME-NAVIS2-OP-5                                                                                                   331

---

## หน้า 332

26 System settings


Related topics

Set the laser head direction (page 315)

Set laser parameters (page 273)

Perform test marking (page 54)


26.26 Marking field calibration


26.26.1 Calibrate the marking field


With the calibration function, you can adjust the marking field position when it is misaligned.
Calibrate the marking field if the fiber unit was removed and re-installed. Marking field
calibration is available for LP-RF, LP-RV, and LP-ZV.

The marking field calibration is based on the x-/y-axis of head direction “No. 1”. Make sure
the head direction is set to “No. 1” before calibrating the marking field.

Make sure that the fiber unit is properly mounted to the head of the laser marking system.
For details about the mounting procedure, refer to the “Setup and Maintenance Guide”.


(1)

(1)   Fiber unit

                     1.      Establish an online connection between your PC and the laser marking system.

                     2.      Go to the “System settings” screen and select “System offset”.
                             Under “System offset”, enter the initial values for the following parameters:
                             •   “X-axis offset [mm]”, “Y-axis offset [mm]”: 0
                                 “Z-axis offset [mm]” (LP-ZV): 0
                                 “Rotation offset [°]”: 0
                                 “X-scaling [%]”/“Y-scaling [%]”: 100

                             •   Select “Apply to laser marking system” in the ribbon to save the settings.

                             After finishing the calibration, enter the system offset parameters used before.

                     3.      For “Head direction to axis”, set the head direction to “No. 1”.

                     4.      Select the “Laser pumping” tool.
                             Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                             and the status icon of the “Laser pumping” tool changes.

                     5.      Select “Marking field calibration” in the ribbon.

                     6.      Select “Select marking file”.


332                                                                                                ME-NAVIS2-OP-5

---

## หน้า 333

26.26 Marking field calibration


                 7.    In the dialog, select file number 9998 (file name: “Marking field”) and select “OK”.
                       This file contains the preset marking field data (graphic object of a square) for the
                       calibration process. If the file number 9998 does not contain suitable marking field
                       data, use the following files:
                       •   LP-RF, LP-RV:
                              For LP-RF200P: Marking field_LP-RF200P.lms
                              For LP-RV200P: Marking field_LP-RV200P.lms

                           They are saved on the included CD-ROM (“Laser Marker Smart Utility”) in this
                           folder: [CD-ROM]\Sample\SettingFiles\

                       •   LP-ZV:
                              For LP-ZV200P: Marking field_LP-ZV200P.lzs
                              For LP-ZV205P: Marking field_LP-ZV205P.lzs
                              For LP-ZV206P: Marking field_LP-ZV206P.lzs
                              For LP-ZV500P: Marking field_LP-ZV500P.lzs
                              For LP-ZV505P: Marking field_LP-ZV505P.lzs
                              For LP-ZV506P: Marking field_LP-ZV506P.lzs

                           They are saved in the “Laser Marker Smart Utility” - “Tools” folder on your PC. If
                           you installed Laser Marker Smart Utility with the default setting, the files would be
                           under:
                              C:\Program Files (x86)\Panasonic Industry Laser\Laser Marker Smart Utility
                              \Tools\Sample\SettingFiles
                              or
                              C:\Program Files\Panasonic Industry Laser\Laser Marker Smart Utility\Tools
                              \Sample\SettingFiles

                 8.    In the dialog, select “Test marking/guide laser”.

                 9.    Select the “Test marking” tab.
                       The values for laser power, scan speed, pulse cycle and pulse duration (LP-RV, LP-
                       ZV200P, LP-ZV205P, LP-ZV206P), set in the selected marking file, are displayed. If
                       you want to perform the test marking with other laser settings, change them in the
                       “Marking settings” screen.

                 10.   Select the “Guide laser” tab. For “Guide laser display”, set “Marking image” and select
                       “Guide laser ON”.
                       Check the marking position, and depending on your laser marking system place the
                       workpiece at the following work distance:
                           190mm (LP-RF200P, LP-RV200P, LP-ZV200P, LP-ZV500P)
                           220mm (LP-ZV205P, LP-ZV505P)
                           330mm (LP-ZV206P, LP-ZV506P)

                 11.   Select “Start marking” to trigger the laser radiation.
                       A confirmation dialog appears. Select “Yes” to start laser radiation.
                       When the test marking ends, leave the marking target at the same position.

                 12.   In the “Guide laser” tab, set “Marking field” for “Guide laser display”. Select “Guide
                       laser ON”.


ME-NAVIS2-OP-5                                                                                                  333

---

## หน้า 334

26 System settings


                     13.    Compare the marking field position indicated by the guide laser with the actual
                            marked position of the marking field. If they do not overlap, enter correction values in
                            the “Marking field calibration” dialog to adjust the position of the marking laser.
                            Specify any of the following parameters:
                            •   “X-offset [mm]”, “Y-offset [mm]”: Enter a value to move the center position of the
                                marking field.

                            •   “Distortion correction”: For each distortion correction shape, you can specify X and
                                Y values to change the marking field.

                            •   Select “Apply”.
                                The new settings will be updated in the laser marking system.

                            •   Select “Reset to default” to reset all values to the initial settings.

                     14.    Repeat steps 10 to 13 until the marking field position indicated by the guide laser is
                            aligned with the actual marked position of the marking field.

                     15.    To close the dialog, select “Close”.


Related topics

Set the laser head direction (page 315)

Adjust the marking field position (page 314)

Details of distortion correction settings (page 334)

Perform test marking (page 54)

Laser settings (page 273)


26.26.2 Details of distortion correction settings


Use the distortion correction settings to fine-tune the shape of the marking field during
calibration.

For each distortion correction shape, you can specify X and Y values in the “Marking field
calibration” dialog. The drawings in this topic show how the marking field shape changes
depending on the entered X and Y values.

A square with dashed lines indicates the original marking field.


Arrows indicate the direction in which the marking field is changed.


334                                                                                                      ME-NAVIS2-OP-5

---

## หน้า 335

26.26 Marking field calibration


Parallelogram


(1)               (2)   (3)                       (4)

(1)   X value reduced
(2)   X value increased
(3)   Y value reduced
(4)   Y value increased


Pincushion


(1)               (2)   (3)                       (4)

(1)   X value reduced
(2)   X value increased
(3)   Y value reduced
(4)   Y value increased


Trapezoid


(1)               (2)   (3)                      (4)

(1)   X value reduced
(2)   X value increased
(3)   Y value reduced
(4)   Y value increased


ME-NAVIS2-OP-5                                                                    335

---

## หน้า 336

26 System settings


Bow-shape


(1)                        (2)                        (3)                           (4)

(1)   X value reduced
(2)   X value increased
(3)   Y value reduced
(4)   Y value increased


Related topics

Calibrate the marking field (page 332)


26.27 Specify the work distance offset

The base position (work distance) is adjusted by using the laser head and oscillator unit that,
at delivery, have the same model numbers.

If the fiber unit was removed and re-installed, the base position (work distance) may differ
from the factory setting. Specify an offset value to adjust the work distance if necessary. This
function is available for the LP-ZV series.

                     1.      Establish an online connection between your PC and the laser marking system.

                     2.      Go to the “System settings” screen and select “System offset”.
                             a.    Under “System offset”, enter the initial value for the following parameter:
                                   “Z-axis offset [mm]”: 0

                             b.    Select “Apply to laser marking system” in the ribbon to save the settings.

                             c.    After finishing the work distance adjustment, enter the system offset parameters
                                   used before.

                     3.      Select the “Laser pumping” tool.
                             Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                             and the status icon of the “Laser pumping” tool changes.

                     4.      Select “Marking field calibration” in the ribbon.

                     5.      Select “Select marking file”.

                     6.      In the dialog, select file number 9995 (file name: “Work distance adjustment”) and
                             select “OK”.
                             This file contains the preset marking data for the work distance adjustment process. If
                             the file number 9995 does not contain suitable marking data, use the following files:


336                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 337

26.27 Specify the work distance offset


•   For LP-ZV200P, LP-ZV205P, LP-ZV206P: Work distance adjustment_LP-
   ZV20XP.lzs

•   For LP-ZV500P, LP-ZV505P, LP-ZV506P: Work distance adjustment_LP-
   ZV50XP.lzs

They are saved in the “Laser Marker Smart Utility” - “Tools” folder on your PC. If you
installed Laser Marker Smart Utility with the default setting, the files would be under:
   C:\Program Files (x86)\Panasonic Industry Laser\Laser Marker Smart Utility\Tools
   \Sample\SettingFiles
   or
   C:\Program Files\Panasonic Industry Laser\Laser Marker Smart Utility\Tools
   \Sample\SettingFiles

                 7.    In the dialog under “Work distance”, set "0.000" for “Offset [mm]”.

                 8.    Select “Test marking/guide laser”.

                 9.    Select the “Test marking” tab.
                       The values for laser power, scan speed, pulse cycle and pulse duration (LP-ZV200P,
                       LP-ZV205P, LP-ZV206P), set in the selected marking file, are displayed. If you want to
                       perform test marking with other laser settings, change them in the “Marking settings”
                       screen.

                 10.   Select the “Guide laser” tab. For “Guide laser display”, set “Marking image” and select
                       “Guide laser ON”.
                       Check the marking position and place the workpiece at a work distance of 190mm
                       (LP-ZV200P, LP-ZV500P), 220mm (LP-ZV205P, LP-ZV505P) or 330mm (LP-ZV206P,
                       LP-ZV506P).

                 11.   Select “Start marking” to trigger the laser radiation.
                       A confirmation dialog appears. Select “Yes” to start laser radiation.
                       The following image is marked. Each letter “A” is marked with a different work
                       distance offset in the range from -0.5mm to +0.5mm.


                       Marking image of the marking file “Work distance adjustment”

                 12.   Check the marking quality and determine the work distance offset with the best
                       (clearest) marking result. Enter this value for “Offset [mm]” under “Work distance”.

                 13.   Select “Apply”.
                       The new settings will be updated in the laser marking system.
                       Select “Reset to default” to reset all values to the initial settings.

                 14.   Repeat steps 8 to 11 once again, and ensure that the best marking result is achieved
                       for the letter “A” below “0.0”.

                 15.   To close the dialog, select “Close”.


ME-NAVIS2-OP-5                                                                                                337

---

## หน้า 338

26 System settings


26.28 Set or disable a password

You can set a password in the “System settings” screen. The password is required when you
switch from “Restricted user” to “Administrator”.

In offline mode, you cannot select a user.


The password protection of this configuration software is designed for the purpose to prevent a wrong
configuration or unintended operation. You cannot use this password for security purpose.


                     1.   Start the Laser Marker NAVI smart software.

                     2.   Establish an online connection between your PC and the laser marking system.

                     3.   Go to the “System settings” screen and select “Access permissions”.

                     4.   Select “Change” next to “Password for administrator” to specify a password.

                     5.   In the dialog, select “Enable password protection”. If you do not use the password
                          protection, deselect the check box.

                     6.   Enter a password, verify it and select “OK”.

                     7.   Select “Apply to laser marking system” in the ribbon to save the settings.
                          The new settings will be updated in the laser marking system.


Related topics

Delete a forgotten password (page 338)

Availability of the screens (page 38)

User selection (page 39)


26.29 Delete a forgotten password

To restrict access to certain screens and settings, a password can be set for the
“Administrator” role. In case you cannot remember the password, the file ClearPassword.exe
must be executed to remove the password.

Do not delete the password while the laser marking system is in remote mode.

                     1.     Make sure the laser marking system is not in remote mode.

                     2.     Exit Laser Marker NAVI smart.

                     3.     Execute ClearPassword.exe.
                            LP-GS, LP-RC, LP-RF, LP-RV: The file is located on the Laser Marker NAVI smart
                            CD-ROM under \Tools\ClearPassword.exe.


338                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 339

26.30 Configure permissions and customize the “Monitor” screen


LP-RH, LP-ZV: The file is located in the “Laser Marker Smart Utility” - “Tools” folder
on your PC. If you installed Laser Marker Smart Utility with the default setting, the file
would be under:
   C:\Program Files (x86)\Panasonic Industry Laser\Laser Marker Smart Utility\Tools
   \ClearPassword\ClearPassword.exe
   or
   C:\Program Files\Panasonic Industry Laser\Laser Marker Smart Utility\Tools
   \ClearPassword\ClearPassword.exe

                 4.      Select “Clear the password”.

                 5.      Select “OK”.
                         During the execution of ClearPassword.exe, a connection between the laser marking
                         system and the PC is not required.

                 6.      Start Laser Marker NAVI smart.

                 7.      Establish an online connection between your PC and the laser marking system.
                         This deletes the password and clears the password protection of the connected laser
                         marking system.
                 8.      Exit Laser Marker NAVI smart.

                 9.      Execute ClearPassword.exe again.

                 10.     Deselect “Clear the password”.

                 11.     Select “OK”.
                         Pay attention that “Clear the password” in the dialog is not selected. Otherwise, the
                         new password will be deleted again when you establish an online connection even
                         without executing ClearPassword.exe.


Related topics

Set or disable a password (page 338)

User selection (page 39)


26.30 Configure permissions and customize the “Monitor” screen

For the “Restricted user” profile, you can add or remove a permission to edit a parameter on
the “Marking settings” screen. You can also specify which marking file settings are displayed
on the “Monitor” screen.

LP-RH, LP-ZV: If you use the optional touch panel console or a commercially available
monitor, you can only edit the parameters allowed for the “Restricted user”, regardless of the
currently set user role.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “System settings” screen and select “Access permissions”.

                 3.    You can configure the parameters that are shown in the “Permissions” column.
                       Add or remove a permission to edit parameters with the “Restricted user” profile:


ME-NAVIS2-OP-5                                                                                                  339

---

## หน้า 340

26 System settings


•   Select the check box in the “Restricted user” column, to add the permission for
   editing the parameter on the “Marking settings” screen.

•   To remove the permission, deselect the check box.

Customize the “Monitor” screen:
•   If you select a check box in the “Monitor” column, the selected parameter is
   displayed on the “Monitor” screen.

•   Deselect the check box if you do not want to show the parameter on the “Monitor”
   screen.

                     4.   Select “Apply to laser marking system” in the ribbon to save the settings.
                          The new settings will be updated in the laser marking system.


Related topics

User selection (page 39)

Specify more permissions and “Monitor” screen settings (page 340)

Monitor the marking data in remote mode or RUN mode (page 342)


26.31 Specify more permissions and “Monitor” screen settings

You can add or remove a permission to edit a parameter and specify a range for some
parameters and reference character strings that can be edited with the “Restricted user”
profile. You can also specify which marking file settings are displayed on the “Monitor”
screen.

LP-RH, LP-ZV: If you use the optional touch panel console or a commercially available
monitor, you can only edit the parameters allowed for the “Restricted user”, regardless of the
currently set user role.

                     1.   Establish an online connection between your PC and the laser marking system.

                     2.   Go to the “System settings” screen and select “Access permissions”.

                     3.   To specify advanced settings, select “More settings”.
                          The dialog opens.

                     4.   You can configure the parameters that are shown in the “Permissions” column.
                          Add or remove a permission to edit parameters with the “Restricted user” profile:
                          •   Select a category from the “Setting category” list box.
                              On-the-fly marking, 3D marking (LP-ZV), and camera settings (LP-ZV) cannot be
                              selected from the list box. The parameters for these functions cannot be changed
                              with the “Restricted user” profile.

                          •   Depending on the category, the available parameters are displayed in the
                              “Permissions” column.

                          •   Select the check box in the “Restricted user” column, to add the permission for
                              editing the parameter on the “Marking settings” screen.


340                                                                                               ME-NAVIS2-OP-5

---

## หน้า 341

26.31 Specify more permissions and “Monitor” screen settings


•   To remove the permission, deselect the check box.

Customize the “Monitor” screen:
•   If you select a check box in the “Monitor” column, the selected parameter is
   displayed on the “Monitor” screen.
•   Deselect the check box if you do not want to show the parameter on the “Monitor”
   screen.

Delete settings:
•   If you want to delete all your settings, select “Clear all”.

“Display/edit range” table:
•   In the “Monitor” column, set a range for parameters that are displayed on the
   “Monitor” screen.

•   In the “Restricted user” column, set a range for parameters that can be edited with
   the “Restricted user” profile.

•   You can set a range for the following parameters:
   “Marking object”, “Counter (global)”, “Counter”, “Expiry time (global)”, “Expiry time”,
   “Lot (global)”, “Lot”, “Reference character strings (global)”, “Reference character
   strings”

•   For parameters indicated with “(global)”, the set range is available in all files.

•   For parameters without “(global)”, the set range is only available in the current file.

•   Double-click on the cells to enter values.

•   Use “-” to indicate a range, e.g. 1-50.

•   You can enter more than one range. Use “,” or “;” as separator between them, e.g.
   “1-50,60;100” for “Reference character strings”. This setting means, that the string
   No. from 1 to 50, No. 60 and No. 100 can be edited or are displayed.

                 5.   Select “OK” to close the dialog.
                 6.   Select “Apply to laser marking system” in the ribbon to save the settings.
                      The new settings will be updated in the laser marking system.


Related topics

User selection (page 39)

Monitor the marking data in remote mode or RUN mode (page 342)


ME-NAVIS2-OP-5                                                                                                  341

---

## หน้า 342

27 Monitor the marking data


27       Monitor the marking data


27.1     Monitor the marking data in remote mode or RUN mode

If the laser marking system is in remote mode or RUN mode, you can monitor the selected
marking file during the marking process on the “Monitor” screen.


Marking image display

In remote mode or RUN mode, the selected marking file is displayed on the “Monitor” screen.
If the marking file is switched by I/O signals or by communication commands, the displayed
file is also switched.

The initial interval period for refreshing the “Monitor” screen is 0.5s. If the display loads
slowly, because the marking file contains a large amount of data, set a longer refresh
interval or use the “Refresh screen” button. You can change this setting in “Startup” >
“Preferences” > “General settings”.


Check the marking parameters

In the “Current settings” tab, you can check some of the marking parameters.

To show a marking parameter in the “Monitor” screen, enable it in “System settings” >
“Access permissions” in advance.


Check on-the-fly marking status

LP-RC, LP-RF, LP-RV: In the “On-the-fly” tab, you can check the status of on-the-fly marking
(“ON”/“OFF”) and the line speed.

LP-RH, LP-ZV: In “Real-time data” > “On-the-fly”, you can check the status of on-the-fly
marking (“ON”/“OFF”) and the line speed.

•   If on-the-fly marking is enabled (“ON”), the current line speed is displayed. The line speed
   display is updated every 500ms.
   The specified value is displayed if “Fixed speed” is set for “Line speed control”.
   If “Encoder input” or “2 sensors input” is set for “Line speed control”, the current value,
   calculated based on the input signals from the encoder or the sensors, is displayed.

•   If on-the-fly making is disabled (“OFF”) or the line speed cannot be detected, the line
   speed value is shown as “-”.


Check the last marking results (LP-ZV)

In the “Real-time data” tab under “Last marking results”, you can check “Marking energy
[mJ]”, “Marking energy check” and “Workpiece displacement [mm]”. The values displayed
under “Last marking results” are updated at the end of every marking process.


342                                                                                               ME-NAVIS2-OP-5

---

## หน้า 343

27.1 Monitor the marking data in remote mode or RUN mode


•   “Marking energy [mJ]” (LP-ZV500P, LP-ZV505P, LP-ZV506P): The automatically
   measured value of the marking energy is displayed. If the measurement fails due to a
   marking interruption caused by an error, “-” is displayed.

•   “Marking energy check” (LP-ZV500P, LP-ZV505P, LP-ZV506P): “OK” is displayed if
   “Laser settings” > “Limit values” is set to “Upper limit”, “Lower limit”, or “Upper/lower limit”,
   and if the measured marking energy is in the specified range. If the marking energy is not
   in the specified range, “Out of range” is displayed. If “Laser settings” > “Limit values” is
   “OFF” or in case the measurement fails due to a marking interruption caused by an error,
   “-” is displayed.

•   “Workpiece displacement [mm]”: You can check the workpiece displacement that
   was used for the last marking. If “File settings” > “Autofocus” is set to “ON”, the
   workpiece displacement measured by the external sensor is displayed. If “File settings” >
   “Autofocus” is “OFF”, or in case the measurement fails, “-” is displayed.


Reference character strings

The “Reference character strings” tab is available if a range of reference character strings is
specified in “System settings” > “Access permissions”.

The specified reference character strings are listed in 2 tabs.

•   “Current file”: Shows the reference character strings (depending on the set range) that
   can only be used in the current file.

•   “For all files”: Shows the reference character strings (depending on the set range) that
   can be used in all files.


Check the status of I/O terminals

Select “I/O monitor” in the ribbon to open the I/O monitor. The status (“ON”/“OFF”) of the I/
O terminals on the laser marking system is displayed in the dialog. For details about the I/O
terminals, refer to the “Setup and Maintenance Guide” of your laser marking system.

•   “-” next to a I/O terminal indicates that it cannot be monitored.

•   The status (“ON”/“OFF”) of the I/O monitor is updated every 500ms.

•   In the I/O monitor you can also monitor the I/O status controlled via optional network unit
   (EtherNet/IP or PROFINET).

•   There is a deviation between the actual input or output time and the time “ON” or “OFF” is
   displayed on the screen.


Refresh the screen manually

The “Refresh screen” button is available in the ribbon if you select “Button “Refresh screen””
in “Startup” > “Preferences” > “General settings” > “Screen refresh of "Monitor" screen” >
“Method”.

Use the “Refresh screen” button to manually update the “Monitor” screen.


ME-NAVIS2-OP-5                                                                                                    343

---

## หน้า 344

27 Monitor the marking data


Related topics

Specify “General settings” (page 29)

Specify more permissions and “Monitor” screen settings (page 340)

Create a character object (reference list) (page 105)

Use the autofocus function (page 271)

Specify limits for the marking energy (page 284)


27.2     Select a marking file on the “Monitor” screen

You can also select and open a marking file on the “Monitor” screen.

The marking file displayed in the “Monitor” screen is the file that is executed when the
marking process is triggered in remote mode or RUN mode.

Turn off remote mode or RUN mode before selecting the marking file.

A restricted user can perform this operation, if the option “Select file” is enabled in “System
settings” > “Access permissions”.

                  1.   In the “Monitor” screen, select “Open”.
                       A dialog opens and shows a list of all marking files saved on the laser marking system.

                  2.   Select a marking file from the list.

                  3.   Select “OK” to close the dialog.
                       The marking file in the connected laser marking system is changed.


Related topics

Monitor the marking data in remote mode or RUN mode (page 342)


344                                                                                             ME-NAVIS2-OP-5

---

## หน้า 345

28.1 Display operating data


28     Maintenance


28.1   Display operating data

In the “Operating data” tab, you can check the operating data of the connected laser marking
system, for example the total operating time of the controller.

When you edit a backup file in offline mode, the operating data at the time of backup is
displayed.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Maintenance” screen and select “Operating data”.

                 3.   The following data is displayed:
                      •   “Controller operating time [h]”
                      •   “Laser pumping time [h]”

                      •   “Laser radiation time [h]”

                      •   “Number of shutter cycles”

                      •   “Number of power-on times”

                      •   “Head fan operating time [h]” (LP-GS, LP-RC, LP-RH)

                      •   “Controller fan operating time [h]”

                      •   “Battery status for system clock” (“Normal”, “Abnormal”)

                      •   “Number of marking processes”
                          "Overwriting" is not reflected in the “Number of marking processes”. This count is
                          incremented even if an error occurs during the marking process.
                      •   “Number of switching cycles of INTERLOCK relays” (LP-GS)

                      •   “Number of switching cycles of INTERLOCK contactors” (LP-RC, LP-RF, LP-RH, LP-
                          RV, LP-ZV)

                      If you have replaced a part, reset its operating data. Select “Reset” and confirm with
                      “Yes” to reset the values to the initial settings. Log in as administrator to reset the
                      following operating data:
                      •   “Head fan operating time [h]” (LP-GS, LP-RC, LP-RH)

                      •   “Controller fan operating time [h]”

                      •   “Number of switching cycles of INTERLOCK contactors” (LP-RC, LP-RF, LP-RH, LP-
                          RV, LP-ZV)

                      LP-RH, LP-ZV: For “Laser pumping time [h]” (LP-RH), “Laser radiation time [h]” (LP-ZV),
                      “Number of shutter cycles” and “Number of switching cycles of INTERLOCK contactors”,
                      the predefined values for maintenance are shown in the column “Reference cycle
                      for maintenance”. When the predefined values (operating time or cycles) have been
                      reached, the output MAINTENANCE OUT (Y13) of the I/O TERMINAL connector turns


ME-NAVIS2-OP-5                                                                                                  345

---

## หน้า 346

28 Maintenance


on to inform you that it is time to perform maintenance. In addition, an exclamation point
symbol (!) is displayed on the “Maintenance” screen of Laser Marker NAVI smart.

For details about maintenance, refer to the “Setup and Maintenance Guide” of your laser
marking system.


28.2    Specify settings for maintenance tasks

For routine maintenance tasks, such as the cleaning of the laser emission port, you can
specify the announcement setting and the maintenance cycle setting.

This setting is available for the LP-RH and LP-ZV series.

When you edit a backup file in offline mode, this function cannot be set. To change the
announcement setting and the maintenance cycle setting, log in as administrator.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Maintenance” screen and select “Operating data”.

                 3.   The following data is displayed under “Announcement for regular maintenance”:
                      •   “Type”: Displays the maintenance tasks “Air filter replacement”, “Laser emission port
                          glass cleaning” (LP-ZV), and “Laser emission port cleaning” (LP-RH).

                      •   “Announcement”: Select the check box to activate the announcement for
                          maintenance.

                      •   “Next maintenance”: Shows the time period until the next maintenance (“In xxx hours
                          of controller operation time”). When the time for maintenance is reached, “xx hours
                          have passed” is displayed. You can change the interval for maintenance.

                      •   “Last maintenance”: Displays the date and time of the last performed maintenance.

                 4.   Select the “Announcement” check box to activate the announcement function.
                      The output MAINTENANCE OUT (Y13) of the I/O TERMINAL connector turns on when
                      the maintenance due date is reached. In addition, an exclamation point symbol (!) is
                      displayed on the “Maintenance” screen of Laser Marker NAVI smart.
                      MAINTENANCE OUT (Y13) does not tun on if the check box is deselected.

                 5.   To change the maintenance cycle, select “Change”.
                      The “Maintenance cycle” dialog appears.

                 6.   Specify the maintenance cycle based on the controller operating time (operating time of
                      the laser marking system).
                      To reset the maintenance cycle to the initial setting, select “Reset to default” (initial
                      setting of “Air filter replacement”: 300 hours of controller operating time; initial setting of
                      “Laser emission port glass cleaning” (LP-ZV), “Laser emission port cleaning” (LP-RH):
                      300 hours of controller operating time).

                 7.   Select “OK” to close the dialog.
                      The time displayed under “Next maintenance” is updated.

                 8.   If you have finished the maintenance work, select “Done”.
                      The date and time are saved and displayed under “Last maintenance”. The time until the
                      next maintenance is updated.


346                                                                                               ME-NAVIS2-OP-5

---

## หน้า 347

28.3 Show the error log


28.3   Show the error log

In the “Error log” tab, you can view the error log, delete all log entries or save the log entries
as TSV file.

In online mode, you will see the error log of the connected laser marking system. When you
edit a backup file in offline mode, the error log entries at the time of backup are displayed.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Maintenance” screen and select “Error log”.

                 3.   The error log shows a table of errors with the following information: date and time of
                      occurrence in the format YYYY-MM-DD hh:mm:ss, type (either alarm or warning), file
                      number, error code, and description.
                      A maximum of 100 error log entries are displayed.
                      •   To export the error log entries as TSV file select “Save as TSV”. Select the storage
                          location, enter a file name and save the TSV file.

                      •   Select “Delete all” and confirm with “Yes” to delete all log entries. To delete the error
                          log, log in as administrator.
                          This function is not available when backup files are edited in offline mode.


Related topics

Alarm messages (E001–E599) (page 387)

Warning messages (E600–E799) (page 401)


28.4   Perform output simulation

Use the output simulation function to check the operation of external devices connected to
the laser marking system by manually changing the status of an output.

You can also use the output simulation to check the operation of external devices connected
to the laser marking system via optional network unit (EtherNet/IP or PROFINET).

When you use the output simulation, you cannot perform other operations or make any
settings in Laser Marker NAVI smart.

                 1.   Establish an online connection between your PC and the laser marking system.

                 2.   Go to the “Maintenance” screen and select “Output simulation” in the ribbon.

                 3.   In the dialog, do any of the following:
                      •   Select “OFF” next to the output signal that you want to simulate. The status of the
                          output signal changes to “ON”.

                      •   Select “Reset” to terminate the output simulation and reset the status of the output
                          signals to the actual settings.


ME-NAVIS2-OP-5                                                                                                  347

---

## หน้า 348

28 Maintenance


•   To close the “Output simulation” dialog and terminate the simulation, select “Close” or
   “X”.

For details about the I/O terminals, refer to the “Setup and Maintenance Guide” of your laser
marking system.


28.5    Check the communication command history

The transmitted and received communication commands are displayed in the “Command
history” tab.

•    When you edit a backup file in offline mode, the communication command history at the
   time of backup is displayed.

•    A maximum of 100 commands are displayed.

•    If a code reader is connected to the RS-232C interface, the data transmitted and received
   between the code reader and the laser marking system are not recorded in the command
   history.

•    If a transmitted message cannot be recognized as a command (for example due to an
   incorrect start or end code), it is not recorded in the command history.

                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “Maintenance” screen and select “Command history”.

                 3.    The communication commands are listed in a table.
                       •   The table has the following columns:
                            ‒ “Date/time”: Displays the date and time of a transmitted or received command in
                              the format YYYY-MM-DD hh:mm:ss.fff.

                            ‒ “Interface”: Displays the interface used for command control: RS-232C, Ethernet,
                              PROFINET, EtherNet/IP
                               LP-RF, LP-RH, LP-RV, LP-ZV: PROFINET and EtherNet/IP are available if the
                               optional network unit is installed in the controller.

                            ‒ “PLC ↔ LM”: Arrows show the communication direction.
                               → indicates that the laser marking system received the command from an
                               external device, for instance a PLC.
                               ← indicates that the laser marking system transmitted the command to an
                               external device.

                            ‒ “File No.”: Displays the file number that is selected for command transmission or
                              reception.

                            ‒ “Command messages”: Displays the command messages transmitted and
                              received by the laser marking system. The recordable data length is up to 64
                              bytes. Unrecorded data are displayed in parentheses, for example (...70 byte).

                       •   “Display format”: Select “Text” or “Hexadecimal” to change the display format of the
                           command messages.


348                                                                                            ME-NAVIS2-OP-5

---

## หน้า 349

28.6 Inspect the laser power with a commercial power meter


‒ “Text”: The command messages are displayed in text form. Non-ASCII
  characters are displayed according to the setting made for “Encoding for non-
  ASCII characters” in “System settings” > “Communication”. Square brackets are
  used for control codes such as start and end code, for example [STX].
‒ “Hexadecimal”: The command messages are displayed in hexadecimal format.
  Each byte of the message is separated by a space.

•       To export the entries of the command history as a TSV file, select “Save as TSV”.

•       Select “Delete all” and confirm with “Yes” to delete all entries of the command history.
   To delete the command history, log in as administrator.
   This function is not available when backup files are edited in offline mode.


28.6   Inspect the laser power with a commercial power meter

Inspect the laser power regularly in order to maintain consistent marking quality. A usage
under severe operating conditions may require a daily inspection.

Use a commercial laser power meter to measure the laser power. The power meter must
meet the following requirements:


•    Use a calibrated laser power meter.
•    LP-GS: The detector of the laser power meter should have a damage threshold (maximum
   2
   average power density) of more than 1kW/cm . The size of the detector should be more than
   Ø20mm.
   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: The detector of the laser power meter should have a
   2
   damage threshold (maximum average power density) of more than 10kW/cm . The size of the
   detector should be more than Ø10mm.
•    High or low temperatures can result in different measurement values. Measure the power with a
   normal temperature (20–30°C is recommended).
•    Make sure there is no contamination in the laser emission port. If the laser emission port is
   contaminated or damaged, the measurement results may be faulty.


                 1.       Install the laser power meter.
                          Place the laser power meter detector vertically down from the center of the laser
                          emission port at one-third to half of the specified work distance.
                          •     LP-GS051(-L): approx. 45mm
                                LP-GS052: approx. 35mm
                                                                                                              2
                                These are the recommended values for a damage threshold of 1kW/cm .

                          •     LP-RC350S: approx. 50mm
                                LP-RF200P: approx. 90mm
                                LP-RH300/200/100: approx. 90mm
                                LP-RH301/101: approx. 50mm
                                LP-RH305: approx. 130mm


ME-NAVIS2-OP-5                                                                                                        349

---

## หน้า 350

28 Maintenance


LP-RV200P: approx. 90mm
LP-ZV200P, LP-ZV500P: approx. 90mm
LP-ZV205P, LP-ZV505P: approx. 110mm
LP-ZV206P, LP-ZV506P: approx. 160mm
   2
These are the recommended values for a damage threshold of 10kW/cm .


(3)


(2)                           (4)


   (5)
(1)

(6)


(1)       Work distance (base position)
(2)       Installation distance for detector
(3)       Laser head
(4)       Detector of laser power meter
(5)       Laser beam
(6)       Workpiece


•     Do not install the detector at the focal point (base position). This may cause destruction of the
   laser power meter.
•     Do not use the pointer (LP-GS052) as a reference to determine the position of the detector. Since
   the pointer is emitted diagonally, it does not indicate the center of the marking field at the specified
   installation distance.


                 2.   Establish an online connection between your PC and the laser marking system.

                 3.   Go to the “Maintenance” screen and select the “Laser pumping” tool.
                      Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                      and the status icon of the “Laser pumping” tool changes.

                 4.   Select “Laser radiation for measurement” in the ribbon.

                 5.   In the dialog, enter the desired laser power and other laser settings.
                      The settings specified for the inspection of laser power are saved in the laser marking
                      system.
                      LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P: The laser power changes depending
                      on the settings for pulse duration and pulse cycle. If you select “Optimal setting”, the
                      software automatically sets the optimal values for “Pulse duration [ns]” and “Pulse
                      cycle [μs]”.


350                                                                                                    ME-NAVIS2-OP-5

---

## หน้า 351

28.6 Inspect the laser power with a commercial power meter


LP-GS, LP-RF, LP-RH, LP-ZV500P, LP-ZV505P, LP-ZV506P: If you select “Optimal
setting”, the software automatically sets the optimal values for “Laser frequency [kHz]”
(LP-GS, LP-RH) and “Pulse cycle [μs]” (LP-RF, LP-ZV500P, LP-ZV505P, LP-ZV506P).

                 6.    LP-GS051(-L), LP-RC, LP-RF, LP-RV, LP-ZV: Use the guide laser to check the
                       position of the detector.
                       •   Select “Guide laser ON”.

                       •   Set the detector so that the crosshairs of the guide laser radiate on the center of
                           the detector.

                 7.    Select “Laser radiation”.


                                  •   Wear laser protective goggles against laser radiation within the laser
                                      controlled area.
                                  •   During radiation, the laser power is concentrated onto one point. Long
                                      radiation periods may cause fire and damage to the workpiece.


                 8.    Select “Yes” to start laser radiation.
                       For stable measurement results, it is recommended to obtain the average laser power
                       value by measuring the laser power after about 30s from the start of laser radiation for
                       10–30s.

                 9.    Select “Stop” to stop laser radiation.
                       The laser radiation for measurement automatically stops after about one minute if you
                       do not select “Stop”.

                 10.   Check the measurement results of the power meter.
                       If the measurement value is lower than the specified laser power, change the value for
                       “Laser power correction [%]” under “System offset” in the “System settings” screen.
                       Setting range of “Laser power correction [%]”: 50–200
                       The laser power correction does not change the maximum laser power [W] value. The
                       correction value is applied to the “Laser power” parameter under “Laser settings”.


                        If the measurement value is more than 20% below the specified laser power, the laser oscillator
                        needs maintenance. Contact our service center or sales offices.


Related topics

Set laser parameters (page 273)


ME-NAVIS2-OP-5                                                                                                    351

---

## หน้า 352

28 Maintenance


28.7    Inspect the laser power with the power check function

Use the built-in power monitor to check the laser power. This function is available for the
following models: LP-ZV500P, LP-ZV505P, LP-ZV506P.

Inspect the laser power regularly in order to maintain consistent marking quality. A usage
under severe operating conditions may require a daily inspection.

Take note of the following points when using the power check function:

•    Use the results measured with the power check function for reference only. To obtain
   accurate measurements of the laser power, use a commercial power meter.

•    After the laser marking system was installed or moved, the measured values may change
   slightly. Calibrate the built-in power monitor to improve the accuracy when measuring or
   correcting values with the power check function.

•    For more details about the power check function, refer to the “Setup and Maintenance
   Guide”.


When the power check function is used to measure and correct the laser power,
the laser radiates without opening the shutter. Even if the shutter remains closed,
take appropriate protective measures during laser radiation such as wearing laser
protective goggles or using a protective enclosure. Keep flammable materials
away from the marking field of your laser marking system.


                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “Maintenance” screen and select the “Laser pumping” tool.
                       Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                       and the status icon of the “Laser pumping” tool changes.

                 3.    Select “Power check” in the ribbon.

                 4.    Select the “Measurement” tab and specify the measurement settings. For “Laser
                       settings”, select “Optimal setting” or “User-defined settings”.
                       •   Select “Optimal setting” to apply the recommended values for laser power (80.0), and
                           pulse cycle.

                       •   Select “User-defined settings” to specify a value for laser power. For measurement,
                           you must use the laser power setting 80.0, in order to obtain a value for “Power
                           compared to delivery state [%]”. The laser power correction is only available if the
                           output power was measured with the laser power setting 80.0.
                           The following functions are only available with a laser power setting of 80.0:
                              Power check history
                              Power comparison to delivery state
                              Power correction after power check

                 5.    Select the “Measure” button.


352                                                                                                   ME-NAVIS2-OP-5

---

## หน้า 353

28.8 Correct the laser power with the power check function


                 6.   In the confirmation dialog, select “Yes” to start the measurement.
                      It takes about 21 seconds to complete the power measurement.

                 7.   The following data is shown under “Measurement results” as soon as the measurement
                      is completed:
                      •   “Output power [W]”: Displays the measured laser power.

                      •   “Corrected output power [W]”: If power correction has been performed, the corrected
                          laser power is displayed.

                      •   “Power compared to delivery state [%]”: This value is displayed only if the
                          measurement has been performed with the laser power setting 80.0. It shows the
                          ratio of the current output power relative to the initial power at the time of delivery.
                          For the calculation, it is assumed that the laser power is 100% at delivery.


                      If “Power compared to delivery state [%]” is below 80%, the oscillator unit requires maintenance.
                      Contact our service center or sales offices.

                 8.   Specify a value for “Low power notice level [%]” if necessary (initial setting: 80). To
                      change this setting, select “Change” and enter a new value.
                      If the measured value for “Power compared to delivery state [%]” falls below the
                      specified value for “Low power notice level [%]”, you will be notified. The notification is
                      displayed in the “Power check” dialog after the measurement has been completed.
                      •   This setting is linked to “Low power notice level [%]” in “System settings” >
                          “Operation/information” > “Advanced system settings”.

                      •   The setting is saved without overwriting the file.

                 9.   To close the “Power check” dialog, select “Close”.
                      If the output power was measured with the laser power setting 80.0, the measurement is
                      recorded in “Power check history” on the “Maintenance” screen.


Related topics

Show the power check history (page 357)

Calibrate the built-in power monitor (page 355)

Configure advanced system settings (page 310)


28.8   Correct the laser power with the power check function

If you identify a decline in the laser power after measurement, correct the laser power
setting. This function is available for LP-ZV500P, LP-ZV505P, and LP-ZV506P.

The laser power correction is only available if the output power was measured with the laser
power setting 80.0.


ME-NAVIS2-OP-5                                                                                                       353

---

## หน้า 354

28 Maintenance


When the power check function is used to measure and correct the laser power,
the laser radiates without opening the shutter. Even if the shutter remains closed,
take appropriate protective measures during laser radiation such as wearing laser
protective goggles or using a protective enclosure. Keep flammable materials
away from the marking field of your laser marking system.


                 1.    Establish an online connection between your PC and the laser marking system.

                 2.    Go to the “Maintenance” screen and select the “Laser pumping” tool.
                       Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                       and the status icon of the “Laser pumping” tool changes.

                 3.    Select “Power check” in the ribbon.

                 4.    Select the “Measurement” tab and execute the power measurement with the laser
                       power setting 80.0.

                 5.    Select the “Correction” tab.

                 6.    The following data is displayed under “Correction settings”:
                       •   “Output power at delivery [W] (laser power 80)”: Shows the initial laser power at
                           the time of delivery with the laser power set to 80.0.

                       •   “Laser power setting at measurement”: Shows the setting value of the laser power
                           used for the power measurement.

                       •   “Measured output power [W]”: Displays the measured laser power.

                 7.    For “Correction method”, select “Auto” or “Manual”.
                       •   “Auto”: The value for “Laser power correction [%]” is calculated automatically, in
                           order to correct the laser power to be equivalent to the power at delivery.

                       •   “Manual”: This setting allows you to specify a correction value for “Laser power
                           correction [%]”.
                       •   “Laser power correction [%]”: The setting is displayed if “Manual” is set for
                           “Correction method”. Enter a correction value for the laser power.
                           The laser power correction is a function that corrects internally the setting value of
                           “Laser power” under “Laser settings”. This setting does not change the maximum
                           laser power [W] value.

                 8.    Select “Correct power”.

                 9.    In the confirmation dialog, select “Yes” to perform the correction.
                       It takes about 11 seconds to complete the laser power correction.

                 10.   The following data under “Status” is updated as soon as the correction is completed:
                       •   “Laser power correction [%]”: Shows the correction rate used to correct the laser
                           power.

                       •   “Corrected output power [W]”: Shows the corrected laser power. It is approximately
                           equal to the result of: “Measured output power [W]” x “Laser power correction [%]”.

                       •   “Valid power setting range”: If the value for “Laser power correction [%]” exceeds
                           100%, the effective setting range for the laser power is narrowed. This means that
                           the output power does not change even if you set a laser power value greater than


354                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 355

28.9 Calibrate the built-in power monitor


the upper range value. If you do not perform the power correction, the “Valid power
setting range” is 12.0–100.0.
Example: You have performed the power correction and 12.0–90.0 is displayed for
“Valid power setting range”. This means that the output power will be the same if
you perform the measurement with the laser power set to 100 and to 90.

•   “Date/time of correction”: The date and time of the correction are displayed in the
   format YYYY-MM-DD hh:mm:ss.

                 11.      To close the “Power check” dialog, select “Close”.
                          The performed correction is recorded in “Power check history” on the “Maintenance”
                          screen.


Related topics

Show the power check history (page 357)


28.9   Calibrate the built-in power monitor

After the laser marking system was installed or moved, the measured values by the power
check function may change slightly. Execute a calibration to improve the accuracy of the
built-in power monitor.

This function is available for the following models: LP-ZV500P, LP-ZV505P, LP-ZV506P.

Use a commercial laser power meter to calibrate the power monitor. The power meter must
meet the following requirements:


•     Use a calibrated laser power meter.
•     The detector of the laser power meter should have a damage threshold (maximum average power
   2
   density) of more than 10kW/cm . The size of the detector should be more than Ø10mm.
•     High or low temperatures can result in different measurement values. Measure the power with a
   normal temperature (20–30°C is recommended).
•     Make sure there is no contamination in the laser emission port. If the laser emission port is
   contaminated or damaged, the measurement results may be faulty.


                 1.       Establish an online connection between your PC and the laser marking system.

                 2.       Go to the “Maintenance” screen and select the “Laser pumping” tool.
                          Select “Yes” to start laser pumping. After a few seconds, laser pumping is completed
                          and the status icon of the “Laser pumping” tool changes.

                 3.       Select “Power check” in the ribbon.

                 4.       Select the “Measurement” tab and select “Calibrate”.
                          The “Power monitor calibration” dialog opens.
                          •   If you have previously performed the calibration, the date and time of the previous
                              calibration would be displayed under “Last calibration date/time” in the format
                              YYYY-MM-DD hh:mm:ss.


ME-NAVIS2-OP-5                                                                                                         355

---

## หน้า 356

28 Maintenance


•   To exit the dialog without changes, select “Cancel”.

                 5.    Select “Next” to carry out the whole calibration process.
                       To calibrate the power monitor, you have to measure the current output power with an
                       external power meter. Make sure that the result is in the range from 31.7 to 32.3W for
                       a laser power setting of 80.
                       If you already measured and checked the output power, select “Skip” and move to
                       step 13.

                 6.    Install the laser power meter.
                       Place the laser power meter detector vertically down from the center of the laser
                       emission port at one-third to half of the specified work distance.
                           LP-ZV500P: approx. 90mm
                           LP-ZV505P: approx. 110mm
                           LP-ZV506P: approx. 160mm

                                                                                                          2
                       These are the recommended values for a damage threshold of 10kW/cm .


                       Do not install the detector at the focal point (base position). This may cause destruction of the laser
                       power meter.

                 7.    Use the guide laser to check the position of the detector. Select “Guide laser ON”.
                       Set the detector so that the crosshairs of the guide laser radiate on the center of the
                       detector.

                 8.    Select “Laser radiation” to measure the output power.


                                  •   Wear laser protective goggles against laser radiation within the laser
                                      controlled area.
                                  •   During radiation, the laser power is concentrated onto one point. Long
                                      radiation periods may cause fire and damage to the workpiece.


                 9.    Select “Yes” to start laser radiation.
                       For stable measurement results, it is recommended to obtain the average laser power
                       value by measuring the laser power after about 30s from the start of laser radiation for
                       10–30s.

                 10.   Select “Stop” to stop laser radiation.
                       The laser radiation for measurement automatically stops after about one minute if you
                       do not select “Stop”.

                 11.   Enter a value for “Laser power correction” so that the measured value is in the range
                       from 31.7 to 32.3W.

                 12.   Select “Next” to go on with the calibration.
                       To exit the dialog without changes, select “Cancel”.


356                                                                                                  ME-NAVIS2-OP-5

---

## หน้า 357

28.10 Show the power check history


                 13.       Select “Start calibration”.


                                      During power monitor calibration, the laser radiates without opening the shutter.
                                      Even if the shutter remains closed, take appropriate protective measures during
                                      laser radiation such as wearing laser protective goggles or using a protective
                                      enclosure. Keep flammable materials away from the marking field of your laser
                                      marking system.

                 14.       Select “Yes” to start calibration.

                 15.       A message is displayed once the power monitor calibration is completed.
                           To close the “Power monitor calibration” dialog, select “Close”.


Related topics

Inspect the laser power with a commercial power meter (page 349)


28.10 Show the power check history

In the “Power check history” tab, you can view the history of the laser power measurements
and corrections executed by the power check function. In addition, you can save the log
entries as TSV file or delete all log entries.

This function is available for the following models: LP-ZV500P, LP-ZV505P, LP-ZV506P.

In online mode, you will see the power check history of the connected laser marking system.
When you edit a backup file in offline mode, the measurement and correction log entries at
the time of backup are displayed.

                 1.    Establish an online connection between your PC and the laser marking system.
                 2.    Go to the “Maintenance” screen and select “Power check history”.

                 3.    Select “Measurement log” or “Correction log” to show the related log entries.

                 4.    The power check history consists of a table with the following information:
                       •    “Measurement log”: Date and time in the format YYYY-MM-DD hh:mm:ss, measured
                            laser power and in parentheses the corrected laser power, power compared to output
                            power at delivery, power correction rate, laser radiation time.
                            Only the measurements performed with the laser power set to 80 are recorded.

                       •    “Correction log”: Date and time in the format YYYY-MM-DD hh:mm:ss, power
                            correction rate, measured laser power and in parentheses the corrected laser power,
                            laser radiation time.

                       In the table, up to 100 log entries are displayed per page. A maximum of 4000 log
                       entries can be saved.
                       •    To export the power check history as TSV file, select “Save as TSV”. Select the
                            storage location, enter a file name, and save the TSV file.


ME-NAVIS2-OP-5                                                                                                            357

---

## หน้า 358

28 Maintenance


•   Select “Delete all” and confirm with “Yes” to delete all log entries. To delete the power
   check history, log in as administrator.
   This function is not available when backup files are edited in offline mode.


358                                                                                        ME-NAVIS2-OP-5

---

## หน้า 359

29.1 List of common problems


29         Troubleshooting


29.1       List of common problems

If any operation error occurs, check the following items before contacting our service center
or sales offices.


Start-up

Power supply is not turned on or system does not start (page 360)


Laser pumping

Laser pumping does not start (page 361)
Laser pumping does not start in remote mode (page 362)


Connection with Laser Marker NAVI smart

Laser marking system not available in the “Connection” dialog (page 362)
Online connection is disconnected (page 363)
Ethernet connection cannot be established (page 363)
Bluetooth connection cannot be established (LP-GS) (page 364)


Lasing process

Marking cannot be done. (The laser emission indicator blinks but marking is not
performed on the workpiece.) (page 364)
Marking is not performed in RUN/REMOTE mode. (The laser emission indicator does not
light.) (page 366)
Unintended laser radiation occurs (page 366)
Marking position is not correct (page 366)


Marking quality

Marking result is totally or partially faded (page 367)
Edge of the marking field is faded or chipped (page 369)
Marked characters are partially chipped (page 369)
Marking result of filling lines in drawings or characters is uneven (page 370)
Filling lines in drawings, bar codes or 2D codes are deformed (straight lines are marked
wavy) (page 370)
Marking result is uneven, characters are deformed (page 370)
Marking line runs over the intended start or end points (page 371)
Small characters are not readable (page 372)
Marking result is dotted (page 372)


ME-NAVIS2-OP-5                                                                                              359

---

## หน้า 360

29 Troubleshooting


On-the-fly marking (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)

Marking is sometimes skipped (E750) (page 372)
Start lines of characters are distorted (page 373)
Characters are distorted or character spacing is unstable (page 373)


External control

Communication with the external device does not start (page 375)
I/O control fails (page 376)
Command control fails (page 376)
Marking trigger ready output does not turn on (page 377)
A negative response is returned (page 379)


Linking of image processing devices

Linking of an imagechecker and/or a code reader fails (page 381)
Position correction fails (page 381)
Code or character reading results are NG (page 382)
Marking result is uneven, characters are deformed (page 383)


Built-in camera (LP-ZV)

Camera image not displayed (page 383)
Workpiece not displayed properly (page 384)
Workpiece size in marking image editor is incorrect (page 384)


Operation by touch panel console or monitor (LP-RH, LP-ZV)

Touch panel console or monitor shows an empty screen (page 384)
Mouse does not respond (page 385)
USB flash drive cannot be recognized (page 386)


29.2    Start-up

When the system does not start, check the power cable, position of the key switch, or
condition of the fuse or circuit protector.


Power supply is not turned on or system does not start

Cause:
The power cable is not connected.
Remedy:
Connect the power supply cable.


360                                                                                           ME-NAVIS2-OP-5

---

## หน้า 361

29.3 Laser pumping


Cause:
The key switch is not turned on.
Remedy:
Turn the key switch on the front of the controller from 0 to I.

Cause:
Power is not supplied.
Remedy:
Check the power supply.

Cause:
LP-GS: The fuse is blown.
Remedy:
Replace the fuse. For details, refer to the “Setup and Maintenance Guide”.

Cause:
LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: The circuit protector is off.
Remedy:
Turn on the circuit protector. For details, refer to the “Setup and Maintenance Guide”.


29.3   Laser pumping

If laser pumping does not start, check the terminal connections, the state of the “Stop laser”
button, or the control method.


Laser pumping does not start

Cause:
One of the following connections between terminals is open.
   INTERLOCK 1(+) (X16) and INTERLOCK 1(-) (X17)
   INTERLOCK 2(+) (X18) and INTERLOCK 2(-) (X19)
   LP-GS: LASER STOP 2 IN (X11) and OUT COM. 1
   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: REMOTE INTERLOCK IN (X20) and OUT
   COM. 1

Remedy:
•   Check the connection of all terminals on the TERMINAL connector.

•   If the safeguard connected to the laser stop or interlock input was opened or actuated,
   restore the original status.


ME-NAVIS2-OP-5                                                                                              361

---

## หน้า 362

29 Troubleshooting


Cause:
The “Stop laser” button in the configuration software was selected.
Remedy:
•   Solve the safety problem. Then select “Reset” in the error dialog in Laser Marker NAVI
   smart to finish the laser stop status.

•   LP-RH, LP-ZV: When using the touch panel console or monitor:
   Solve the safety problem. Then select “Reset” in the error dialog on the screen to finish
   the laser stop status.


Cause:
Power is not supplied to the common terminal of the I/O TERMINAL connector.
Remedy:
Connect the internal or external power supply to IN COM. 1 (X2) and OUT COM.1 (Y2) on
the I/O TERMINAL connector.


Laser pumping does not start in remote mode

Cause:
Signals from the external device cannot be transmitted.
Remedy:
Refer to External control (page 375).

Cause:
The setting for “Laser pumping control” does not match the actual control method.
Remedy:
•   Check if the setting for “Laser pumping control” (“I/O” or “Communication commands”) in
   the “Operation/information” window of the “System settings” screen is correct.

•   A change of this setting will take effect only after restarting the laser marking system.


29.4    Connection with Laser Marker NAVI smart

If a connection to the laser marking system is not possible, check the condition of your PC
and the communication settings.


Laser marking system not available in the “Connection” dialog

Cause:
The laser marking system has not been started.
Remedy:
Refer to Start-up (page 360).


362                                                                                                ME-NAVIS2-OP-5

---

## หน้า 363

29.4 Connection with Laser Marker NAVI smart


Cause:
PC and laser marking system are not connected.
Remedy:
Connect PC and laser marking system with a USB cable or a LAN cable.

Cause:
The USB driver is not installed properly.
Remedy:
Install the USB driver for every laser marking system you wish to connect. For details, refer
to the “Laser Marker NAVI smart Operation Manual”.


Online connection is disconnected

Cause:
The PC is in sleep mode or in hibernate mode.
Remedy:
Deactivate the sleep mode settings of the PC to prevent a disconnection.

Cause:
A CPU-intensive application caused the disconnection.
Remedy:
Terminate the CPU-intensive application to maintain the online connection.


Ethernet connection cannot be established

Cause:
The Ethernet settings are incorrect.
Remedy:
Establish a USB connection, and enter the correct settings in the “System settings”. Then,
restart the laser marking system.

Cause:
Ethernet connections are not included in the search settings.
Remedy:
In the “Connection” dialog, activate the “Including Ethernet connections” check box.

Cause:
The LAN cable is connected to the wrong port (EtherNet/IP, PROFINET, or INFO LAN).
Remedy:
Connect the cable to the port marked “LAN” on the rear of the controller.


ME-NAVIS2-OP-5                                                                                             363

---

## หน้า 364

29 Troubleshooting


Bluetooth connection cannot be established (LP-GS)

Cause:
A model not supporting Bluetooth is used.
Remedy:
The Bluetooth function is available for the following models: LP-GS051, LP-GS051-E, LP-
GS051-L, LP-GS051-LE, LP-GS052, LP-GS052-E

Cause:
Bluetooth communication is disabled.
Remedy:
Establish a USB connection, and enable Bluetooth in the “System settings”. Then, restart
the laser marking system.

Cause:
The PC is too far away from the laser head.
Remedy:
Install the laser head within 5m from the PC.

Cause:
The environment is not suited for Bluetooth communication.
•   Wireless LAN or another wireless device is used near the laser marking system.

•   There is an obstacle between the laser head and the PC.
•   Radio wave signals are weak in this environment.

Remedy:
Establish the Bluetooth connection in an environment suited for stable wireless
connections.


29.5    Lasing process

Invalid laser settings, an incorrect workpiece position, or obstacles in the laser beam path
may be responsible for lasing problems.


Marking cannot be done. (The laser emission indicator blinks but marking is not performed on
the workpiece.)

Cause:
There is an obstacle in the laser beam path.
Remedy:
•   Remove the obstacle between the laser emission port at the laser head and the
   workpiece.

•   LP-RF, LP-RV: Remove the protection cap of the laser emission port.


364                                                                                            ME-NAVIS2-OP-5

---

## หน้า 365

29.5 Lasing process


Cause:
The distance to the workpiece is not appropriate.
Remedy:
Adjust the distance between the bottom surface of the laser marking system and the
surface of the workpiece.

Cause:
LP-ZV: When you use the autofocus function:
The workpiece displacement does not match the actual distance.
Remedy:
•   Check if the values set for “Workpiece displacement at 4mA [mm]” and “Workpiece
   displacement at 20mA [mm]” in the “System settings” screen are correct.

•   Check if the trigger of the displacement sensor is input after a stable measurement
   result (analog current output of the sensor) was obtained.

•   Check if the sensor's detection area and the marking surface are identical.


Cause:
LP-GS (except LP-GS051-L), LP-ZV: The set z-position does not match the height of the
actual workpiece.
Remedy:
Set the z-position according to the workpiece height.

Cause:
The workpiece is not in place.
Remedy:
•   Check the marking position using the guide laser.
•   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: Connect a sensor to TARGET DETECTION IN
   (X7) of the TERMINAL connector to check the presence of the workpiece during laser
   radiation.


Cause:
The laser power is not sufficient.
Remedy:
•   Increase the laser power (including correction factor).
•   Decrease the scan speed (including correction factor).


Cause:
The laser type (wavelength, laser power, etc.) is not appropriate for the target material.
Remedy:
Laser wavelength and laser power determine which target materials are suitable for laser
marking.
   LP-GS, LP-RC, LP-RH: not suitable for metal materials
   LP-RF, LP-RV, LP-ZV: not suitable for transparent materials


ME-NAVIS2-OP-5                                                                                                365

---

## หน้า 366

29 Troubleshooting


Marking is not performed in RUN/REMOTE mode. (The laser emission indicator does not light.)

Cause:
In RUN mode: RUN mode is not active or the marking trigger signal is not input.
Remedy:
Turn on RUN mode, and then input the marking trigger signal, either from an external
device connected to TRIGGER IN (X5) of the TERMINAL connector or from Laser Marker
NAVI smart.

Cause:
The marking trigger signal is not input at TRIGGER IN (X5).
Remedy:
•   Check the connections to external devices for faulty or loose contacts.
•   Make sure that in each marking cycle, the TRIGGER IN (X5) signal is a one-shot signal
   of more than 2ms.


Cause:
The marking trigger input is ON while the marking trigger ready output is OFF.
Remedy:
Refer to External control (page 375).


Unintended laser radiation occurs

Cause:
Fumes cause malfunction of the photoelectric sensor which triggers the marking process.
Remedy:
Install a dust collector to eliminate fumes (smoke) generated during the marking and make
sure the dust is properly collected.


Marking position is not correct

Cause:
•   The laser head direction set in the PC configuration software does not correspond to the
   actual installation direction.

•   A system offset was specified in the “System settings”.

Remedy:
Check the laser head direction and system offset values specified in the “System settings”.


366                                                                                                ME-NAVIS2-OP-5

---

## หน้า 367

29.6 Marking quality


29.6    Marking quality

When you are not satisfied with the marking result, check the position and environment of
the workpiece, the condition of the laser system, or the laser settings.


Marking result is totally or partially faded

Cause:
The laser emission port is not clean.
Remedy:
•   Clean the laser emission port by following the instructions in the “Setup and
   Maintenance Guide”.

•   LP-RF, LP-RV, LP-ZV: If contaminants persist, replace the protection glass of the laser
   emission port.


Cause:
Fumes created during the marking hinder the laser beam.
Remedy:
Install a dust collector to eliminate fumes (smoke) generated during the marking and make
sure the dust is properly collected.

Cause:
The distance to the workpiece is not appropriate.
Remedy:
Adjust the distance between the bottom surface of the laser head and the marking surface
of the workpiece.

Cause:
LP-GS (except LP-GS051-L), LP-ZV: The set z-position does not match the height of the
actual workpiece.
Remedy:
Set the z-position according to the workpiece height.


ME-NAVIS2-OP-5                                                                                              367

---

## หน้า 368

29 Troubleshooting


Cause:
LP-ZV: When you use the autofocus function:
The workpiece displacement does not match the actual distance.
Remedy:
•   Check if the values set for “Workpiece displacement at 4mA [mm]” and “Workpiece
   displacement at 20mA [mm]” in the “System settings” screen are correct.

•   Check if the trigger of the displacement sensor is input after a stable measurement
   result (analog current output of the sensor) was obtained.

•   Check if the sensor's detection area and the marking surface are identical.

•   Check the sensor's installation status. If there are vibrations that impact the
   displacement sensor, take measures to prevent vibrations.

•   Check if the output signal of the displacement sensor is affected by noise. Take
   measures to protect the sensor against noise.


Cause:
LP-ZV: The setting option specified for “Uniform spot mode” is not suitable for your marking
layout.
Remedy:
Specify a setting option for “Uniform spot mode” to adapt it to the work distance. If you
change this setting, marking quality may also change. Adjust the laser power according to
the selected uniform spot mode.

Cause:
The marking surface of the workpiece is inclined.
Remedy:
Make sure the bottom surface of the laser head and the marking surface of the workpiece
are parallel to each other.

Cause:
The workpieces have varying properties for thickness, surface condition (roughness, gloss
level, etc.), and material (incl. chemical composition).
Remedy:
Adjust the marking settings and work distance for each workpiece.

Cause:
The workpiece feeder is unstable.
Remedy:
Adjust the workpiece feeder so that the position of the workpiece will be stable.


368                                                                                                ME-NAVIS2-OP-5

---

## หน้า 369

29.6 Marking quality


Cause:
The performance of the laser oscillator deteriorated due to aging.
Remedy:
•   Increase the laser power.
•   Decrease the scan speed.

•   If the initial marking quality cannot be reached even if the laser power is set to the
   maximum value, the laser oscillator must be replaced. Contact our service center or
   sales offices.


Cause:
The laser power or power density is insufficient.
Remedy:
•   Increase the laser power (including correction factor).
•   Decrease the scan speed (including correction factor).

•   LP-ZV206P and LP-ZV506P are not suitable for engraving on metal.


Cause:
LP-RV, LP-ZV200P, LP-ZV205P, LP-ZV206P: The setting value of the pulse duration is
incorrect.
Remedy:
Adjust the pulse duration according to the material of the workpiece. For plastic, 4ns or
8ns is a common setting. For metal, 16ns or 30ns are often used. For shallow marking on
metal, 120ns or 200ns are often selected.


Edge of the marking field is faded or chipped

Cause:
A decrease of the power density at the edge of the marking field may affect the marking
quality.
Remedy:
•   LP-GS, LP-RC, LP-RH: Activate “Power optimization by marking position” in the
   “System settings”.

•   LP-RF, LP-RV, LP-ZV: Enable laser power correction for the marking objects at the edge
   of the marking field.

•   LP-ZV: Set “Uniform spot mode”.


Marked characters are partially chipped

Cause:
There is an obstacle in the laser beam path.
Remedy:
Remove the obstacle between the laser emission port at the laser head and the workpiece.


ME-NAVIS2-OP-5                                                                                                369

---

## หน้า 370

29 Troubleshooting


Cause:
The laser emission port is not clean.
Remedy:
•   Clean the laser emission port by following the instructions in the “Setup and
   Maintenance Guide”.

•   LP-RF, LP-RV, LP-ZV: If contaminants persist, replace the protection glass of the laser
   emission port.


Marking result of filling lines in drawings or characters is uneven

Cause:
LP-ZV: The speed is too high when the filling lines are drawn and the z-axis adjustment
module cannot follow up with the height change.
Remedy:
•   Decrease the scan speed.

•   Change the marking order or the marking direction of the filling lines.


Filling lines in drawings, bar codes or 2D codes are deformed (straight lines are marked wavy)

Cause:
The workpiece is moving during the marking process.
Remedy:
Take measures to prevent vibration.

Cause:
The marking settings are not appropriate for the drawing pattern of the filling lines.
Remedy:
•   Change the scan speed.
•   Adjust the value for “Waiting time” in “Laser settings”.


Marking result is uneven, characters are deformed

Cause:
The laser head is not fixed properly.
Remedy:
•   Fix the laser head with the specified torque.
•   Improve the strength of the stand on which the laser head is installed.


370                                                                                                ME-NAVIS2-OP-5

---

## หน้า 371

29.6 Marking quality


Cause:
There are continuous vibrations coming from surrounding equipment, such as motors and
presses.
Remedy:
Take measures to prevent vibration.

Cause:
There are irregular vibrations coming from surrounding equipment, such as air cylinders
and forklifts.
Remedy:
Take measures to prevent vibration.

Cause:
The starting and/or stopping of the workpiece feeder does not match the marking process.
Remedy:
•   The marking process is disturbed at the beginning: The marking trigger signal is input
   before the workpiece has fully stopped or the equipment continues to vibrate after the
   workpiece has stopped. Use a delay timer, for example, to input the trigger signal only
   after no more vibrations occur.

•   The marking process is disturbed at the end: The workpiece starts moving before the
   marking process is completed. Delay the start time of the workpiece feeder or increase
   the scan speed so that the marking process is finished before the workpiece starts
   moving.


Cause:
Surrounding equipment produces noise.
Remedy:
•   Securely ground the frame ground (FG) of the laser marking system or the surrounding
   equipment.

•   Insulate the power and signal lines from each other if they have been routed in parallel.

•   Shield the signal line.

•   Insulate the power supply of the laser marking system from other equipment.

•   Use a noise cut-off transformer to absorb noises from the power supply.


Marking line runs over the intended start or end points

Cause:
The fine adjustment parameters in the laser settings do not match the other settings.
Remedy:
Adjust the laser settings such as start point, end point, or waiting time.


ME-NAVIS2-OP-5                                                                                                371

---

## หน้า 372

29 Troubleshooting


Small characters are not readable

Cause:
The settings or the fonts are inadequate for the character size.
Remedy:
•   Use the ORG2 or ORG5 font for small size characters.
•   Adjust the laser power or the scan speed.


Marking result is dotted

Cause:
LP-GS, LP-RH: The settings for laser frequency and scan speed are inadequate.
Remedy:
Decrease the scan speed or increase the laser frequency.

Cause:
LP-RF, LP-RV, LP-ZV: The settings for laser pulse cycle and scan speed are inadequate.
Remedy:
Decrease the scan speed or the laser pulse cycle.


29.7    On-the-fly marking (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)

Most problems with on-the-fly marking can be resolved by adjusting the trigger signals, the
workpiece position, or the line speed.


Marking is sometimes skipped (E750)

Cause:
The marking trigger signal is entered before the current marking process is finished.
Remedy:
•   Select multiple trigger mode if you want to input trigger signals during trigger processing.
•   Place the trigger sensor closer to the laser marking system and select a smaller value
   for the trigger detecting position.

•   Reduce the marking time by increasing the scan speed, for example.

•   Reduce the feeder speed.

•   Increase the marking interval (interval between the objects on the feeder).


372                                                                                                ME-NAVIS2-OP-5

---

## หน้า 373

29.7 On-the-fly marking (LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV)


Start lines of characters are distorted

Cause:
The timing of the lasing process does not match the line speed.
Remedy:
Increase the value for overrun correction.


Characters are distorted or character spacing is unstable

Cause:
The set moving direction is wrong.
Remedy:
•   Adjust the moving direction to match the operation of the laser marking system.
•   Check the setting of the laser head direction in the system settings.


Cause:
The speed changes at a conveyor junction.
Remedy:
If conveyors are coupled, avoid marking near conveyor junctions.

Cause:
The actual speed and the preset speed for feeding workpieces are different due to slippage
of workpieces.
Remedy:
Remove the cause of workpiece slippage.

Cause:
Positional misalignment is likely to occur due to meandering motion of the conveyor.
Remedy:
Make sure that the position of the workpiece is stable.

Cause:
The moving speed of the conveyor is not stable.
Remedy:
•   Check the conveyor and remove the cause of the speed change.
•   Use an encoder to feedback speed changes and to stabilize the speed.


Cause:
A fixed line speed was set, which does not match the actual line speed.
Remedy:
Adjust the setting value of the line speed by checking the marking quality.
•   When the character spacing is too wide, increase the value.

•   When the character spacing is too narrow, decrease the value.


ME-NAVIS2-OP-5                                                                                          373

---

## หน้า 374

29 Troubleshooting


Cause:
The line speed is controlled by an encoder and could not be measured correctly.
Remedy:
•   Make sure that the encoder operates properly.
•   Make sure that the setting value of the encoder resolution is correct.
   ‒ When using A phase only:
   Encoder resolution = Number of pulses/mm ´ 2.

‒ When using A and B phases:
  Encoder resolution = Number of pulses/mm ´ 4.

•   When only one phase of the encoder is used, connect the encoder signal to ENCODER
   A IN (X13) and connect ENCODER B IN (X14) to IN COM.1 (X2).

Cause:
The line speed fed back to an encoder is not consistent with the actual line speed during
the marking process.
Remedy:
•   Place the encoder closer to the trigger sensor.

•   Adjust the setting value of the encoder resolution by checking the marking quality.
   ‒ When the character spacing is too wide, increase the value.

‒ When the character spacing is too narrow, decrease the value.

•   In some cases, the influence of line speed fluctuations may be reduced by lowering
   the encoder resolution. However, a minimum encoder resolution of 25pulses/mm is
   recommended.


Cause:
The line speed, which is controlled by two sensors, could not be measured correctly.
Remedy:
•   Adjust the setting value for “Distance line speed sensors [mm]”.
•   Make sure the sensors operate properly.


Cause:
The line speed control measured with two sensors is not consistent with the actual line
speed during the marking process.
Remedy:
•   Place the trigger sensor closer to the line speed measuring sensor to reduce the
   difference between the speed at the point of measurement and the point of marking.

•   Adjust the setting value for “Distance line speed sensors [mm]” by checking the marking
   quality.
   ‒ When the character spacing is too wide, increase the value.

‒ When the character spacing is too narrow, decrease the value.


374                                                                                               ME-NAVIS2-OP-5

---

## หน้า 375

29.8 External control


29.8   External control

If the laser marking system is controlled by I/O signals or communication commands, check
the connections, communications settings, and signal sequences.


Communication with the external device does not start

Cause:
The laser marking system is not in remote mode.
Remedy:
•   Switch the laser marking system to remote mode. For details, refer to the “Setup and
   Maintenance Guide”.

•   Check the setting for “Remote mode switching method” (“I/O” or “Configuration
   software”) in the “System settings” of Laser Marker NAVI smart. Make sure the setting
   matches your actual control method.

•   If you have changed the setting for “Remote mode switching method” in the “System
   settings”, restart the laser marking system.


Cause:
The connection to external devices is inadequate.
Remedy:
•   Check the connections to external devices for faulty or loose contacts.
•   Check the wiring using a continuity tester or the like.

•   For RS-232C connections, check the wiring of the external device including the
   loopback.


Cause:
The communication settings are incorrect.
Remedy:
•   Align the communication settings with the external device.
•   If you have changed any of the communication settings (Ethernet, EtherNet/IP,
   PROFINET or RS-232C) in the “System settings”, restart the laser marking system.

•   For DHCP of EtherNet/IP connections, check the connection status of your DHCP
   server.

•   For RS-232C connections, disable flow control on the external device.


Cause:
The communication settings were overwritten by a backup file.
Remedy:
Check the communication settings. For Ethernet and EtherNet/IP connections, check the
IP address and other Ethernet settings. When you restore a backup file, the communication
settings are overwritten by the backup data.


ME-NAVIS2-OP-5                                                                                              375

---

## หน้า 376

29 Troubleshooting


Cause:
Surrounding equipment produces noise.
Remedy:
•   Securely ground the frame ground (FG) of the laser marking system or the surrounding
   equipment.

•   Insulate the power and signal lines from each other if they have been routed in parallel.

•   Shield the signal line.

•   Insulate the power supply of the laser marking system from other equipment.

•   Use a noise cut-off transformer to absorb noises from the power supply.


I/O control fails

Cause:
The settings in the “System settings” are incorrect.
Remedy:
•   Make sure that the control method is set to “I/O” in “System settings” > “Operation/
   information”.

•   Check the I/O settings in “System settings” > “Inputs/outputs”.

•   For EtherNet/IP or PROFINET connections, check the settings for “Control method of
   input signals” in “System settings” > “Communication”.

If you have changed any of the above settings, restart the laser marking system.


Command control fails

Cause:
Communication commands are not received from the external device.
Remedy:
•   Check the commands in “Maintenance” > “Command history”.
•   Use a commercially available line monitor or protocol analyzer to check if the external
   device sends data.


Cause:
The start code is incorrect.
Remedy:
•   Check if the setting for “Start code” specified in the “System settings” matches the start
   code in the data from the external device.

•   If you use EtherNet/IP or PROFINET, make sure that the command data do not contain
   the start code.


376                                                                                               ME-NAVIS2-OP-5

---

## หน้า 377

29.8 External control


Cause:
The end code is incorrect.
Remedy:
•   For RS-232C and Ethernet connections, make sure the data from the external device
   contain an end code.

•   For RS-232C connections, check if the setting for “End code” specified in the “System
   settings” matches the end code in the data from the external device.

•   If you use EtherNet/IP or PROFINET, make sure that the command data do not contain
   the end code.


Cause:
The “Compatible mode” setting is wrong.
Remedy:
•   To use the command format of the LP-400/LP-V or LP-M/LP-S/LP-Z series, select
   “LP-400/V compatible” or “LP-M/S/Z compatible” for “Compatible mode” in the “System
   settings” of Laser Marker NAVI smart.

•   To use the standard command format, set “OFF” for “Compatible mode” or switch the
   command mode with the Command mode (RSM) command.

•   For EtherNet/IP or PROFINET connections, set “OFF” for “Compatible mode”. LP-400/
   V and LP-M/S/Z compatible command modes are not supported for EtherNet/IP and
   PROFINET connections.


Marking trigger ready output does not turn on

Cause:
An error occurred.
Remedy:
Check the error code and cancel the alarm or warning.

Cause:
The marking trigger signal is being processed.
Remedy:
•   Do not input the marking trigger signal until READY OUT (Y5) is ON.
•   When multiple trigger mode is selected for on-the-fly marking , a maximum of 16 trigger
   signals can be transmitted during trigger processing.


Cause:
Laser pumping is turned off.
Remedy:
Turn on laser pumping. If laser pumping is not possible, refer to Laser pumping (page
361).


ME-NAVIS2-OP-5                                                                                            377

---

## หน้า 378

29 Troubleshooting


Cause:
The shutter is closed.
Remedy:
•   Open the shutter.
•   Check the setting for “Shutter operation control” (“I/O” or “Communication commands”)
   in the “System settings” of “Laser Marker NAVI smart”. Make sure the setting matches
   your current control method.

•   A change of this setting will take effect only after restarting the laser marking system.


Cause:
File switching has not completed.
Remedy:
During file switching, the marking trigger ready output READY OUT (Y5) is OFF until the
marking data are generated. The time varies depending on the quantity of data to be
marked. Do not input the marking trigger signal until READY OUT (Y5) is ON.

Cause:
External character input was activated, but the required marking data are not input from the
external device.
Remedy:
•   If the register function (registered characters), the external offset function, or character
   entry by SIN command is used, the marking data must be input in every marking cycle.

•   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: Before you input the marking data, make sure the
   DATA WAIT OUT (No. 38) output of the I/O connector is ON.


Cause:
Reception mode was turned on during command control.
Remedy:
Turn off reception mode with the Reception mode (MKM) command.

Cause:
LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: The counter was reset during on-the-fly marking.
Remedy:
When the counter is reset during on-the-fly marking, READY OUT (Y5) temporarily turns off
and the trigger signal cannot be transmitted. Check the timing of the counter reset.

Cause:
LP-ZV: The autofocus function with the external displacement sensor was activated in
Laser Marker NAVI smart, but there is no input from the sensor.
Remedy:
•   Check the connection and status of the external displacement sensor.

•   Before the sensor provides an input to the laser marking system, make sure the DATA
   WAIT OUT (No. 38) output of the I/O connector is ON.

•   If you do not use the external displacement sensor, change the setting for “Autofocus” in
   “File settings”.


378                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 379

29.8 External control


A negative response is returned

Cause:
The control method is set to “I/O” in the “System settings”.
Remedy:
•   To control laser pumping, the shutter, or the guide laser by communication commands,
   select “Communication commands” for the corresponding operation. A change of this
   setting will take effect only after restarting the laser marking system. The setting is
   required for the following commands:
   Laser pumping (LSR)
   Shutter control (SHT)
   Guide laser (GID) (except LP-GS052)

•   The SPT command (laser radiation for measurement), TST command (test marking, LP-
   ZV) and PWM command (power check, LP-ZV) are available only if “Shutter operation
   control” is set to “Communication commands”.


Cause:
Reception mode is OFF.
Remedy:
The setting request of most commands can only be transmitted if reception mode is
ON. Turn on reception mode with the Reception mode (MKM) command. The following
commands do not require the reception mode:
   File switching by number (FNO)
   File switching by name (FNN)
   Shutter control (SHT)
   Reception mode (MKM)
   Laser pumping (LSR)
   Counter reset (CTR)
   Marking trigger (MRK)
   Character entry per trigger (SIN)
   Marking offset and laser power correction per trigger (SEO)

For LP-400/V and LP-M/S/Z compatible mode, different commands apply. For details, refer
to the “Serial Communication Command Guide: LP-400/V compatible mode” or “Serial
Communication Command Guide: LP-M/S/Z compatible mode”.


ME-NAVIS2-OP-5                                                                                            379

---

## หน้า 380

29 Troubleshooting


Cause:
There is an alarm or a warning.
Remedy:
•   If there is an alarm, only these commands can be transmitted:
   Status check (STS)
   I/O monitor (IOM)
   Operating data (RTD)
   Error history (ERH)
   Alarm reset (ARS)
   Error number (ENO)
   Command mode (RSM)

•   If there is a warning, only these commands can be transmitted:
   Status check (STS)
   I/O monitor (IOM)
   Operating data (RTD)
   Error history (ERH)
   Alarm reset (ARS)
   Error number (ENO)
   Command mode (RSM)
   Shutter control (SHT); close request and status request only
   Reception mode (MKM); read request only

For LP-400/V and LP-M/S/Z compatible mode, different commands apply. For details,
refer to the “Serial Communication Command Guide: LP-400/V compatible mode” or
“Serial Communication Command Guide: LP-M/S/Z compatible mode”.


Cause:
Two or more commands are transmitted at the same time.
Remedy:
When you send a command, always confirm the response from the laser marking system
before sending the next command.

Cause:
The “Compatible mode” setting is wrong.
Remedy:
•   To use the command format of the LP-400/LP-V or LP-M/LP-S/LP-Z series, select
   “LP-400/V compatible” or “LP-M/S/Z compatible” for “Compatible mode” in the “System
   settings” of Laser Marker NAVI smart.

•   To use the standard command format, set “OFF” for “Compatible mode” or switch the
   command mode with the Command mode (RSM) command.

•   The LP-M/S/Z compatible command mode cannot be used for LP-GS, LP-RC, LP-RF,
   LP-RH, and LP-RV.


380                                                                                          ME-NAVIS2-OP-5

---

## หน้า 381

29.9 Linking of image processing devices


Cause:
•   The character code used in the commands is incorrect.

•   Unsupported characters are used in the readout strings.

Remedy:
•   “Shift JIS”, “GB 2312” and “Latin-1” cannot be used together.

•   Check the setting for “Encoding for non-ASCII characters” in the “System settings”.

•   Check if characters in the readout strings can be encoded with ASCII code or the
   character code specified in “Encoding for non-ASCII characters”.

•   When LP-400/V or LP-M/S/Z compatible mode is set, only ASCII code and Shift JIS are
   available.


29.9    Linking of image processing devices

Common problems include the connection of the imagechecker or code reader, the
workpiece position, or the inspection conditions.


Linking of an imagechecker and/or a code reader fails

Cause:
The connection with the imagechecker or code reader is inadequate.
Remedy:
Check the connections to external devices for faulty or loose contacts. For details, refer to
the “Setup and Maintenance Guide”.

Cause:
The communication settings are incorrect.
Remedy:
Check the communication settings. A change of this setting will take effect only after
restarting the laser marking system.

Cause:
The LAN cable is connected to the wrong port (EtherNet/IP, PROFINET, or INFO LAN).
Remedy:
Connect the cable to the port marked “LAN” on the rear of the controller.


Position correction fails

Cause:
The imagechecker coordinates differ from the marking position of the laser marking system.
Remedy:
Set the calibration of the imagechecker and align the coordinate origin of the imagechecker
with the marking field's center point of the laser marking system.


ME-NAVIS2-OP-5                                                                                              381

---

## หน้า 382

29 Troubleshooting


Cause:
Imagechecker settings are inadequate.
Remedy:
Check the following PV230/PV200 settings:
   Ethernet setting: “General Com.” (general communication) is set for “Protocol”
   Calibration
   Settings for position correction
   Expression of the numerical calculation


Cause:
The setting order in the expression table of PV230/ PV200 is inadequate.
Remedy:
Make appropriate adjustments to the setting order in the expression table of PV230/
PV200. The numerical calculation results should be output to the laser marking system in
the following order: X, Y, and theta.


Code or character reading results are NG

Cause:
The inspection conditions of the imagechecker are incorrect.
Remedy:
Set appropriate inspection conditions according to the marked code type or character
settings.

Cause:
Other codes or characters than the marked bar code, 2D code or characters are read.
Remedy:
Do not capture codes or characters other than marked codes or characters in the field of
view of the imagechecker.

Cause:
When PV230 is used: The settings for total judgement of PV230 are incorrect.
Remedy:
•   For code checking, check the settings for the code reader checker of PV230.
•   For character checking, check the settings for the OCR checker of PV230.

•   Make sure the expression of the numeric calculation in the total judgement is correct.


Cause:
When PV230 is used: No settings were made in the character dictionary of PV230.
Remedy:
To use the character recognition function, set the dictionary of PV230 for each marking
character beforehand.


382                                                                                              ME-NAVIS2-OP-5

---

## หน้า 383

29.10 Built-in camera (LP-ZV)


Cause:
An image of fumes (smoke) in the field of view was taken.
Remedy:
Install a dust collector to eliminate fumes (smoke) generated during the marking and make
sure the dust is properly collected.


Marking result is uneven, characters are deformed

Cause:
When TIMING IN (No. 24) on the I/O connector is used, the starting and/or stopping of the
workpiece feeder does not match the marking process.
Remedy:
•   At the beginning of the marking process, make sure the timing input TIMING IN (No. 24)
   turns ON only after the workpiece has completely stopped.

•   At the end of the marking process, make sure workpieces are moved only after the
   timing standby output TIMING WAIT OUT (No. 36) has turned ON.


29.10 Built-in camera (LP-ZV)

If the camera is not working properly, check the connection of the camera to the PC, the
camera settings, and the workpiece position.


Camera image not displayed

Cause:
The camera is not connected to your PC.
Remedy:
Connect the USB port on the rear of the laser head to your PC with a USB cable.

Cause:
If a USB hub is being used, the power supply of the hub is insufficient.
Remedy:
•   Connect your PC to the laser head without using a USB hub.
•   When you use a USB hub, use a product with an external power supply (self-powered
   USB hub).


ME-NAVIS2-OP-5                                                                                              383

---

## หน้า 384

29 Troubleshooting


Workpiece not displayed properly

Cause:
For metallic or other glossy surfaces, the camera lighting and the camera settings are
inadequate.
Remedy:
•   Change the brightness of the camera lighting.

•   Turn off “Auto-exposure” and adjust the values for “Gain” and “Exposure time”.


Cause:
The workpiece position is inadequate for the lighting direction.
Remedy:
•   Change the workpiece position.
•   For metallic or other glossy surfaces, change the angle of the workpiece.

•   Change the brightness of the camera lighting.

•   Turn off “Auto-exposure” and adjust the values for “Gain” and “Exposure time”.


Workpiece size in marking image editor is incorrect

Cause:
The setting of “Z-movement of camera [mm]” is inadequate.
Remedy:
Measure the work distance and enter the value of the difference from the base position.
Enter a positive value to reduce the work distance and a negative value to increase the
work distance.


29.11 Operation by touch panel console or monitor (LP-RH, LP-ZV)

If you connect a touch panel console or a monitor, a mouse, or a USB flash drive to the laser
marking system, a few requirements must be met.


Touch panel console or monitor shows an empty screen

Cause:
The laser marking system has not been started.
Remedy:
Start-up the laser marking system with the touch panel console or monitor connected.


384                                                                                             ME-NAVIS2-OP-5

---

## หน้า 385

29.11 Operation by touch panel console or monitor (LP-RH, LP-ZV)


Cause:
Incorrect connection of the touch panel console or monitor.
Remedy:
•   When you use the touch panel console: Connect the cable of the touch panel console to
   the CONSOLE connector on the front of the controller.

•   When you use a monitor: Connect the cable of the monitor to the VGA connector on
   the rear of the controller. This product can only be connected to a monitor with a VGA
   connector.


Cause:
The expansion board is not installed or incorrectly installed in the controller.
Remedy:
•   When you use the touch panel console or a monitor, you need to install the optional
   expansion board LP-AEB10 in the controller of the laser marking system.

•   Make sure that the cables inside the controller are connected correctly to the expansion
   board.


Cause:
An online connection between Laser Marker NAVI smart and the laser marking system is
established.
Remedy:
You cannot operate the touch panel console or a monitor during an online connection
between Laser Marker NAVI smart and the laser marking system.

Cause:
When you use a monitor: The monitor is not turned on.
Remedy:
Check the power supply of the monitor.


Mouse does not respond

Cause:
The mouse is connected to a USB hub.
Remedy:
Connect the USB mouse directly to the controller of the laser marking system without using
a USB hub.

Cause:
The mouse type is not supported by the laser marking system.
Remedy:
Use a Human Interface Device (HID) class USB mouse.


ME-NAVIS2-OP-5                                                                                                385

---

## หน้า 386

29 Troubleshooting


USB flash drive cannot be recognized

Cause:
The USB flash drive type is not supported by the laser marking system.
Remedy:
You cannot use the USB flash drive with security functions.

Cause:
The file system selected when formatting the USB flash drive is not appropriate.
Remedy:
Use a USB flash drive formatted with FAT32 or exFAT.

Cause:
The connector of the USB flash drive is not clean.
Remedy:
Clean the connector of the USB flash drive.

Cause:
The USB flash drive is connected to a USB hub.
Remedy:
Connect the USB flash drive directly to the controller of the laser marking system without
using a USB hub.

Cause:
The expansion board is not installed in the controller.
Remedy:
The USB flash drive can be used only together with the touch panel console or a monitor.
For this, you need to install the optional expansion board LP-AEB10 in the controller of the
laser marking system.


Version error appears on the touch panel console or monitor

Cause:
Incorrect firmware version combination of controller and expansion board.
Remedy:
Update the firmware of your laser marking system. Download the software package Laser
Marker Firmware Updater from the following Web site:
https://industry.panasonic.com/global/en/downloads/?tab=software
In “Download Center” > “Software”, use the “Part Number Search” with your laser marking
system series name, like LP-ZV, to find the relevant software.


386                                                                                              ME-NAVIS2-OP-5

---

## หน้า 387

29.12 Reset an alarm message (E001–E599)


29.12 Reset an alarm message (E001–E599)

An alarm is output when a safety function is activated or if there is a hardware or system
error.

When an alarm occurs, laser pumping is turned off and laser radiation is stopped if marking
is in process.

There are different methods to reset an alarm, depending on the type of error.

If the error persists after restarting the laser marking system, contact our service center or
sales offices.

•   Remove the cause of the alarm and confirm the operation logic of the safeguards.

•   E001–E399: These errors are caused by hardware or system errors. Restart the laser
   marking system to clear the alarm.

•   For error codes E400–E599, reset the alarm by one of the following methods:
   ‒ Confirm the error message in Laser Marker NAVI smart to reset the error.

‒ Turn on the alarm reset input ALARM RESET IN (X15) on the TERMINAL connector.

‒ Send an Alarm reset (ARS) command.

•   If a counter is used, check the counter value in the marking file before resuming the
   marking process.


Related topics

Alarm messages (E001–E599) (page 387)

Warning messages (E600–E799) (page 401)

Reset a warning message (E600–799) (page 400)


29.13 Alarm messages (E001–E599)

Error codes in the range from E001 to E599 indicate an alarm.

E001–E038        Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.


ME-NAVIS2-OP-5                                                                                                387

---

## หน้า 388

29 Troubleshooting


E039                 Cause:
•   Incorrect model combination.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   LP-GS, LP-RC, LP-RF, LP-RH: Make sure to connect a laser head and controller which
   have the allowed combination of model numbers.

•   LP-RV, LP-ZV: Make sure to connect a laser head, controller and oscillator unit which
   have the allowed combination of model numbers. Connect the oscillator unit correctly to
   the laser head and controller.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E040–E043            Cause:
•   Communication between the laser head and the controller is not possible due to a
   system error.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the connection of cables and signal lines, and restart the laser marking system.

•   Replace the cable.


E044                 Cause:
•   Incorrect model combination.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   LP-GS, LP-RC, LP-RF, LP-RH: Make sure to connect a laser head and controller which
   have the allowed combination of model numbers.

•   LP-RV, LP-ZV: Make sure to connect a laser head, controller and oscillator unit which
   have the allowed combination of model numbers. Connect the oscillator unit correctly to
   the laser head and controller.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E059                 Cause:
A network error occurred.
Remedy:
Make sure the optional network unit is installed correctly.
Applies to LP-RF, LP-RV, LP-ZV only.

E045–E058,           Cause:
E060–E094,           A system error occurred.
E101–E138
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.


388                                                                                            ME-NAVIS2-OP-5

---

## หน้า 389

29.13 Alarm messages (E001–E599)


E139             Cause:
•   Incorrect model combination.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   LP-GS, LP-RC, LP-RF, LP-RH: Make sure to connect a laser head and controller which
   have the allowed combination of model numbers.

•   LP-RV, LP-ZV: Make sure to connect a laser head, controller and oscillator unit which
   have the allowed combination of model numbers. Connect the oscillator unit correctly to
   the laser head and controller.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E140–E143        Cause:
•   Communication between the laser head and the controller is not possible due to a
   system error.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the connection of cables and signal lines, and restart the laser marking system.

•   Replace the cable.


E144             Cause:
•   Incorrect model combination.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   LP-GS, LP-RC, LP-RF, LP-RH: Make sure to connect a laser head and controller which
   have the allowed combination of model numbers.

•   LP-RV, LP-ZV: Make sure to connect a laser head, controller and oscillator unit which
   have the allowed combination of model numbers. Connect the oscillator unit correctly to
   the laser head and controller.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E145–E158        Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E159             Cause:
A network error occurred.
Remedy:
Make sure the optional network unit is installed correctly.
Applies to LP-RF, LP-RH, LP-RV, LP-ZV only.


ME-NAVIS2-OP-5                                                                                            389

---

## หน้า 390

29 Troubleshooting


E160–E194            Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E200–E201            Cause:
The safety relay used for the INTERLOCK inputs on the laser marking system is defective.
Remedy:
Contact our service center or sales offices.
Applies to LP-GS only.

E202                 Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E205–E207            Cause:
•   An error occurred in the shutter.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E208–E214            Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E216–E217            Cause:
An error occurred in the controller fan.
Remedy:
•   Clean the cooling air inlet and outlet, and the fan located at the cooling air area of the
   controller. For details, refer to the “Setup and Maintenance Guide”.

•   Replace the air filter.

•   Replace the fan.

Applies to LP-RH, LP-ZV only.

E218–E219            Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.


390                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 391

29.13 Alarm messages (E001–E599)


E220             Cause:
The head housing is open.
Remedy:
Contact our service center or sales offices.

E221–E222        Cause:
•   Communication between the laser head and the controller is not possible due to a
   system error.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the connection of cables and signal lines, and restart the laser marking system.

•   Replace the cable.


E223–E224        Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E225             Cause:
The fiber unit is detached.
Remedy:
Install the fiber unit properly. For details, refer to the “Setup and Maintenance Guide”.
Applies to LP-RF, LP-RV, LP-ZV only.

E226–E229        Cause:
An error occurred in the head fan.
Remedy:
•   Clean the cooling air inlet and outlet located at the cooling air area of the laser head. For
   details, refer to the “Setup and Maintenance Guide”.

•   Replace the air filter.

Applies to LP-RH only.

E230             Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E231-E236        Cause:
A network error occurred.
Remedy:
Make sure the optional network unit is installed correctly.
Applies to LP-RF, LP-RH, LP-RV, LP-ZV only.


ME-NAVIS2-OP-5                                                                                                391

---

## หน้า 392

29 Troubleshooting


E237                 Cause:
An expansion board error occurred.
Remedy:
Make sure the optional expansion board is installed correctly.
Applies to LP-RH, LP-ZV only.

E240–E243            Cause:
•   Communication between the laser head and the controller is not possible due to a
   system error.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the connection of cables and signal lines, and restart the laser marking system.

•   Replace the cable.


E245–E248            Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E250–E255,           Cause:
E260–E261            •   An error occurred in the laser oscillator.

•   A power supply voltage error was detected in the laser oscillator.
•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the power supply.

•   Check if the AC power line is affected by noise.

•   Check the connection of cables and signal lines, and restart the laser marking system.

•   LP-RC: Make sure the operating temperature of the laser marking system does not
   exceed the permissible range.


E262                 Cause:
The laser oscillator stopped because the permissible temperature was exceeded.
Remedy:
•   Make sure the operating temperature of the laser marking system does not exceed the
   permissible range.

•   Make sure the fan operates properly.

•   Clean the cooling air inlet and outlet, and the fan located at the cooling air area of the
   laser marking system.

•   If the air filter is contaminated, replace it.

•   If the problem persists, contact our service center or sales offices.

Applies to LP-RF, LP-RV, LP-ZV only.


392                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 393

29.13 Alarm messages (E001–E599)


E263             Cause:
Unintended laser radiation was detected.
Remedy:
Contact our service center or sales offices.
Applies to LP-RF, LP-RH, LP-RV, LP-ZV only.

E264–E265        Cause:
•   An error occurred in the laser oscillator.

•   A power supply voltage error was detected in the laser oscillator.
•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the power supply.

•   Check if the AC power line is affected by noise.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E266             Cause:
An error occurred in the power monitor.
Remedy:
Contact our service center or sales offices.
Applies to LP-ZV only.

E270–E275        Cause:
•   An error occurred in the galvano scanner.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the power supply.

•   Check if the AC power line is affected by noise.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E276             Cause:
Marking data are too detailed for the scan speed configured.
Remedy:
Decrease the scan speed.
Applies to LP-GS only.


ME-NAVIS2-OP-5                                                                                            393

---

## หน้า 394

29 Troubleshooting


E277, E280–          Cause:
E285                 •   An error occurred in the galvano scanner.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the power supply.

•   Check if the AC power line is affected by noise.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E286                 Cause:
Marking data are too detailed for the scan speed configured.
Remedy:
Decrease the scan speed.
Applies to LP-GS only.

E287                 Cause:
•   An error occurred in the galvano scanner.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   Check the power supply.

•   Check if the AC power line is affected by noise.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E290–E292            Cause:
An error occurred in the z-axis adjustment module.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.
Applies to LP-GS, LP-ZV only.

E300–E380            Cause:
A system error occurred.
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.


394                                                                                            ME-NAVIS2-OP-5

---

## หน้า 395

29.13 Alarm messages (E001–E599)


E400             Cause:
Interlock input 1 is open.
Remedy:
•   Connect the INTERLOCK 1 inputs on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the interlock terminals.

•   Check the operation logic of the connected device.

•   If you want to deactivate this alarm when the shutter is closed, set “Deactivate while
   shutter closed” in “System settings” > “Operation/information” > “INTERLOCK alarm
   detection”.

•   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: If the error persists even if the interlock terminals
   are connected properly, replace the INTERLOCK contactor. For details, refer to the
   “Setup and Maintenance Guide”.


E401             Cause:
Interlock input 2 is open.
Remedy:
•   Connect the INTERLOCK 2 inputs on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the interlock terminals.

•   Check the operation logic of the connected device.

•   If you want to deactivate this alarm when the shutter is closed, set “Deactivate while
   shutter closed” in “System settings” > “Operation/information” > “INTERLOCK alarm
   detection”.

•   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV: If the error persists even if the interlock terminals
   are connected properly, replace the INTERLOCK contactor. For details, refer to the
   “Setup and Maintenance Guide”.


E402, E403       Cause:
The laser stop input is open.
Remedy:
•   Connect the LASER STOP IN inputs on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the LASER STOP IN inputs.

•   Check the operation logic of the connected device.

•   Connect the internal or external power supply to IN COM. 1 (X2) and OUT COM.1 (Y2)
   on the I/O TERMINAL connector.


ME-NAVIS2-OP-5                                                                                                395

---

## หน้า 396

29 Troubleshooting


E404                 Cause:
The “Stop laser” button in the configuration software was selected.
Remedy:
•   Solve the safety problem. Then select “Reset” in the error dialog in Laser Marker NAVI
   smart to finish the laser stop status.

•   LP-RH, LP-ZV: When using the touch panel console or monitor:
   Solve the safety problem. Then select “Reset” in the error dialog on the screen to finish
   the laser stop status.


E405                 Cause:
The remote interlock input is open.
Remedy:
•   Connect the REMOTE INTERLOCK IN input on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the REMOTE INTERLOCK IN input.

•   Check the operation logic of the connected device.

•   If you want to deactivate this alarm when the shutter is closed, set “Deactivate while
   shutter closed” in “System settings” > “Operation/information” > “INTERLOCK alarm
   detection”.

•   Connect the internal or external power supply to IN COM. 1 (X2) and OUT COM.1 (Y2)
   on the I/O TERMINAL connector.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E410                 Cause:
Laser pumping was turned off during the marking process.
Remedy:
•   Start the marking process after laser pumping has completed.
•   Check the operation logic of laser pumping and trigger input.

•   Check the connection of the external devices to the I/O terminals or the communication
   port.

•   Make sure the switch or the sensor connected to TRIGGER IN (X5) of the I/O
   TERMINAL connector operates without chattering.


E411                 Cause:
The marking trigger signal was entered while laser pumping was off.
Remedy:
•   Start the marking process after laser pumping has completed.
•   Check the operation logic of laser pumping and trigger input.

•   Check the connection of the external devices to the I/O terminals or the communication
   port.

•   Make sure the switch or the sensor connected to TRIGGER IN (X5) of the I/O
   TERMINAL connector operates without chattering.


396                                                                                               ME-NAVIS2-OP-5

---

## หน้า 397

29.13 Alarm messages (E001–E599)


E450–E453        Cause:
•   The date and time of the system clock may not be correct.

•   The battery of the system clock in the controller is exhausted.
•   An error occurred in the system clock.

Remedy:
•   Check the system clock and set it in the “System settings” screen.

•   Replace the battery. For details, refer to the “Setup and Maintenance Guide”.

•   Before replacing the battery, you can reset this error to set the system clock every time
   after starting the laser marking system.


E460             Cause:
The laser oscillator stopped because the permissible temperature was exceeded.
Remedy:
•   Make sure the operating temperature of the laser marking system does not exceed the
   permissible range.

•   Make sure the fan operates properly.

•   Clean the cooling air inlet and outlet, and the fan located at the cooling air area of the
   laser marking system.

•   If the air filter is contaminated, clean or replace it.

•   If the problem persists, contact our service center or sales offices.

Applies to LP-GS only.

E500             Cause:
The marking trigger signal was entered while laser pumping was off.
Remedy:
•   Start the marking process after laser pumping has completed.
•   Check the operation logic of laser pumping and trigger input.

•   Check the connection of the external devices to the I/O terminals or the communication
   port.

•   Make sure the switch or the sensor connected to TRIGGER IN (X5) of the I/O
   TERMINAL connector operates without chattering.


E501             Cause:
The laser stop input is open.
Remedy:
•   Connect the LASER STOP IN inputs on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the LASER STOP IN inputs.

•   Check the operation logic of the connected device.

•   Connect the internal or external power supply to IN COM. 1 (X2) and OUT COM.1 (Y2)
   on the I/O TERMINAL connector.


ME-NAVIS2-OP-5                                                                                                    397

---

## หน้า 398

29 Troubleshooting


E502                 Cause:
The “Stop laser” button in the configuration software was selected.
Remedy:
•   Solve the safety problem. Then select “Reset” in the error dialog in Laser Marker NAVI
   smart to finish the laser stop status.

•   LP-RH, LP-ZV: When using the touch panel console or monitor:
   Solve the safety problem. Then select “Reset” in the error dialog on the screen to finish
   the laser stop status.


E503                 Cause:
The remote interlock input is open.
Remedy:
•   Connect the REMOTE INTERLOCK IN input on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the REMOTE INTERLOCK IN input.

•   Check the operation logic of the connected device.

•   If you want to deactivate this alarm when the shutter is closed, set “Deactivate while
   shutter closed” in “System settings” > “Operation/information” > “INTERLOCK alarm
   detection”.

•   Connect the internal or external power supply to IN COM. 1 (X2) and OUT COM.1 (Y2)
   on the I/O TERMINAL connector.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E505–E509            Cause:
A safety function (e.g. interlock or laser stop) was activated during marking trigger
preparation (data transfer to the laser head).
Remedy:
•   Reset the alarm if laser radiation was stopped by a laser stop signal, an interlock signal
   or the “Stop laser” button in “Laser Marker NAVI smart”.

•   Check if the signal lines are affected by noise.


E520–E522            Cause:
The marking file or system data were not saved normally when the laser marking system
was turned off. The data of the selected file cannot be read.
Remedy:
•   Save the file again in the laser marking system, overwriting the corresponding file
   number.

•   Do not turn off the laser marking system while saving the settings.


398                                                                                               ME-NAVIS2-OP-5

---

## หน้า 399

29.13 Alarm messages (E001–E599)


E530–E542        Cause:
The marking file or system data were not saved normally when the laser marking system
was turned off. The data of the selected file cannot be read.
Remedy:
•   Restore the previously saved backup file.

•   Do not turn off the laser marking system while saving the settings.


E550–E560        Cause:
A safety function (e.g. interlock or laser stop) was activated during marking trigger
preparation (data transfer to the laser head).
Remedy:
•   Reset the alarm if laser radiation was stopped by a laser stop signal, an interlock signal
   or the “Stop laser” button in “Laser Marker NAVI smart”.

•   Check if the signal lines are affected by noise.


E570             Cause:
The marking file or system data were not saved normally when the laser marking system
was turned off. The data of the selected file cannot be read.
Remedy:
•   Save the file again in the laser marking system, overwriting the corresponding file
   number.

•   Do not turn off the laser marking system while saving the settings.


E571             Cause:
The marking file or system data were not saved normally when the laser marking system
was turned off. The data of the selected file cannot be read.
Remedy:
•   Restore the previously saved backup file.

•   Do not turn off the laser marking system while saving the settings.


E572             Cause:
A safety function (e.g. interlock or laser stop) was activated during marking trigger
preparation (data transfer to the laser head).
Remedy:
•   Reset the alarm if laser radiation was stopped by a laser stop signal, an interlock signal
   or the “Stop laser” button in “Laser Marker NAVI smart”.

•   Check if the signal lines are affected by noise.


Related topics

Warning messages (E600–E799) (page 401)

Reset an alarm message (E001–E599) (page 387)


ME-NAVIS2-OP-5                                                                                               399

---

## หน้า 400

29 Troubleshooting


29.14 Reset a warning message (E600–799)

A warning is output if settings are wrong or if the operating conditions for laser radiation are
not met.

While a warning for E600–E699 is displayed, the marking process cannot be started.

There are different methods to reset a warning, depending on the type of error.

If the error persists after restarting the laser marking system, contact our service center or
sales offices.

•   Remove the cause of the warning or correct the setting.

•   Close the shutter or input the alarm reset signal by I/O or ARS command.
   The following warnings do not require a reset:
   ‒ E600: This warning occurs if LASER STOP IN and OUT COM. 1 on the TERMINAL
   connector are not connected. It is automatically cleared when the terminals are
   connected.

‒ E710–E711: These warnings occur during the lasing process and during guide laser
  radiation. They are automatically cleared when the operation is finished.

‒ E712–E717: The warning is automatically cleared when the cause of the error is
  eliminated.

‒ E750–E783: These warnings are automatically cleared after 3s.

•   If a counter is used, check the counter value in the marking file before resuming the
   marking process.

•   Before restarting the marking process, make sure the warning output WARNING OUT
   (Y14) is ON, and then open the shutter.


Related topics

Warning messages (E600–E799) (page 401)

Alarm messages (E001–E599) (page 387)

Reset an alarm message (E001–E599) (page 387)


400                                                                                            ME-NAVIS2-OP-5

---

## หน้า 401

29.15 Warning messages (E600–E799)


29.15 Warning messages (E600–E799)

Error codes in the range from E600 to E799 indicate a warning.

E600             Cause:
The laser stop input is open.
Remedy:
•   Connect the LASER STOP IN inputs on the I/O TERMINAL connector.
•   Check the status of the safeguards connected to the LASER STOP IN inputs.

•   Check the operation logic of the connected device.


E601             Cause:
The specified file contains no marking data.
Remedy:
Add the marking data and overwrite the file.

E603             Cause:
No data is available for laser radiation.
Remedy:
It is not possible to input a marking trigger signal if the marking file does not contain valid
marking data. Turn on the marking for at least one marking object and select a laser power
correction other than 0%.

E604             Cause:
No data are available for guide laser radiation.
Remedy:
To show masked objects with the guide laser, enable guide laser display in the object
settings.

E605, E606       Cause:
•   The combination of the version of Laser Marker NAVI smart and the model or version of
   the laser marking system is not supported.

•   The function set with Laser Marker NAVI smart cannot be used with this model of the
   laser marking system.

Remedy:
Use the right version of Laser Marker NAVI smart with the laser marking system model in
use.


ME-NAVIS2-OP-5                                                                                               401

---

## หน้า 402

29 Troubleshooting


E607                 Cause:
The sensor signals are invalid. The line speed cannot be detected.
Remedy:
•   Make sure the first sensor in moving direction is connected to ENCODER A IN (X13)
   and the second sensor is connected to ENCODER B IN (X14) of the TERMINAL
   connector.

•   Turn on ENCODER B IN (X14) within 10s from the signal input at ENCODER A IN
   (X13).

•   Input the signal at TRIGGER IN (X5) after turning on ENCODER B IN (X14) within the
   set timeout period.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E608                 Cause:
The counter value may not be updated because the laser marking system was turned off
during the marking process.
Remedy:
•   Check the current value of the counter.

•   Do not turn off the laser marking system during the marking.


E609                 Cause:
The marking data could not be saved correctly because the laser marking system was
turned off during saving.
Remedy:
•   Check the file and the setting values.

•   Overwrite the file.

•   Do not turn off the laser marking system while saving a file.


E610–E613            Cause:
The marking data are out of range.
Remedy:
•   Check the marking image display and adjust position and size of the marking data.
•   Adjust the values for “X-axis offset [mm]” and “Y-axis offset [mm]” in “System settings” >
   “System offset”. The system offset values are not reflected in the marking image editor.

•   If you calibrate the marking field in “System settings” > “Marking field calibration”,
   change the setting values.


402                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 403

29.15 Warning messages (E600–E799)


E614–E615        Cause:
The z-position of the marking data is outside the marking area.
Remedy:
•   Adjust the value for z-movement in the object group settings.
•   Adjust the value for z-movement in the file settings.

•   Adjust the value for “Z-axis offset [mm]” in “System settings” > “System offset”.

•   LP-ZV: When you use the autofocus function, check if the detected workpiece
   displacement value is correct.

Applies to LP-GS, LP-ZV only.

E616             Cause:
The signals from the encoder are invalid. The line speed cannot be detected.
Remedy:
•   Check the signal transmission from the encoder to ENCODER A IN (X13) and
   ENCODER B IN (X14) of the TERMINAL connector.

•   If either phase A or B of the encoder is used, connect the encoder to ENCODER A IN
   (X13) and connect ENCODER B IN (X14) to IN COM. 1 (X2).

•   Make sure the encoder frequency does not exceed 100kHz per phase.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E617             Cause:
The marking speed cannot follow the line speed.
Remedy:
•   Decrease the line speed.
•   Specify an upstream position (positive value) for the lasing start boundary.

•   Reduce the marking time by increasing the scan speed, reducing the space between
   characters, reducing the character size, etc.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E618             Cause:
The workpiece spacing is too small.
Remedy:
•   For marking at regular intervals, increase the workpiece spacing.
•   For multiple trigger mode, increase the time between trigger signals.

•   Decrease the line speed.

•   Increase the distance from the lasing start boundary to the trigger detecting position.

•   For multiple trigger mode, make sure the switch or the sensor connected to TRIGGER
   IN (X5) of the TERMINAL connector operates without chattering.

•   Reduce the marking time by increasing the scan speed, reducing the space between
   characters, reducing the character size, reducing the ON-time for one-shot outputs, etc.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.


ME-NAVIS2-OP-5                                                                                                 403

---

## หน้า 404

29 Troubleshooting


E619                 Cause:
On-the-fly marking is not possible with the set trigger detecting position or lasing start
boundary.
Remedy:
•   Increase the distance from the lasing start boundary to the trigger detecting position.

•   Check the setting of the workpiece reference boundary.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E620–E621            Cause:
The processing in the laser marking system could not be completed. Marking trigger
processing terminated abnormally. (Applies to the linking of image processing devices.)
Remedy:
Check the connection of cables and signal lines, and restart the laser marking system.

E622                 Cause:
The TIMING IN signal was not input in time. Marking trigger processing terminated
abnormally. (Applies to the linking of image processing devices.)
Remedy:
•   The signal at the TIMING IN (No. 24) terminal has to be received within 60s after the
   timing standby output TIMING WAIT OUT (No. 36) is turned ON.

•   Check the connection of the TIMING IN (No. 24) terminal on the I/O connector.

•   Check the connection with the external device.

•   Check the operation logic of the connected device.


E623                 Cause:
The TIMING IN (No. 24) signal was input while TIMING WAIT OUT (No. 36) was OFF.
(Applies to the linking of image processing devices.)
Remedy:
•   The signal at the TIMING IN (No. 24) terminal has to be received within 60s after the
   timing standby output TIMING WAIT OUT (No. 36) is turned ON.

•   Check the connection of the TIMING IN (No. 24) terminal on the I/O connector.

•   Check the connection with the external device.

•   Check the operation logic of the connected device.


404                                                                                                ME-NAVIS2-OP-5

---

## หน้า 405

29.15 Warning messages (E600–E799)


E624             Cause:
A communication error occurred. Marking trigger processing terminated abnormally.
(Applies to the linking of image processing devices.)
Remedy:
•   Check the Ethernet connection between the laser marking system and the external
   devices.

•   Check the status of the laser marking system and the connected external devices.

•   Check the IP address, port number and connecting status of the laser marking system
   and imagechecker.

•   Check if the imagechecker type is set correctly in the “System settings” and in “Marking
   settings” > “File settings” of Laser Marker NAVI smart.

•   LP-GS, LP-RC, LP-RF, LP-RV: While the laser marking system and LP-ABR series are
   connected for code reader integration, do not launch the Configurator LP-ABR software.


E625             Cause:
No response is returned from the imagechecker. Marking trigger processing terminated
abnormally. (Applies to the linking of image processing devices.)
Remedy:
•   Check the connecting status between the laser marking system and the imagechecker.

•   Check if the reading process of the imagechecker was successful.

•   If you use PV230/PV200, set the total judgement.


E626             Cause:
The settings on the laser marking system and imagechecker do not match. Marking trigger
processing terminated abnormally. (Applies to the linking of image processing devices.)
Remedy:
•   Check the settings for application, type number, and checker number on the laser
   marking system and imagechecker.

•   Check the Ethernet settings for PV230/PV200 and for the laser marking system.
   For PV230/PV200, “Protocol” is set to “General Com.” (general communication)
   in the Ethernet setting table. The general communication protocol is used for the
   communication with the laser marking system.


E627             Cause:
Code or character checking failed because no bar code, 2D code or character settings are
available. (Applies to the linking of image processing devices.)
Remedy:
•   Check if the number set for “Object No. to check” in the file settings is the same as the
   object number you set in the bar code, 2D code or character object settings.

•   For code checking, make sure the code type and the settings of the bar code or 2D
   code object match the code reader configuration.

•   For character checking, check if the character type and number of characters in the
   marking data are supported by the imagechecker.


ME-NAVIS2-OP-5                                                                                               405

---

## หน้า 406

29 Troubleshooting


E628                 Cause:
Code reading failed. (Applies to the linking of image processing devices.)
Remedy:
•   Check the status of the external devices.
•   Improve the marking quality of the code.

•   For file switching or character transmission by code reader, check the following:
   ‒ Make sure there are no invalid characters in the code data.

‒ If the data extraction function is used, make sure the set number of characters to be
  extracted is available in the bar code data.

‒ If the data extraction function is not used, a maximum of 299 characters can be
  transmitted.


E629                 Cause:
File switching by code reader failed. (Applies to the linking of image processing devices.)
Remedy:
•   Make sure the file name in the code data exactly matches the name of the marking file
   in the laser marking system.

•   To switch the marking file by number, always specify a 4-digit value in the code data.

•   If the specified marking file does not contain any marking data, make the desired
   settings and overwrite the file in the laser marking system.


E630                 Cause:
TRIGGER IN (X5) turned off before the minimum number of scans was reached.
Remedy:
•   Check the on/off control of the TRIGGER IN (X5) terminal on the TERMINAL connector.
•   If the TRIGGER IN (X5) terminal turns on and off properly, change the number of
   minimum scans in the file settings.


E631                 Cause:
The lasing process stopped because the maximum number of scans was reached.
Remedy:
•   Check the on/off control of the TRIGGER IN terminal on the TERMINAL connector.
•   If TRIGGER IN turns on and off properly, change the number of maximum scans in the
   file settings.


406                                                                                               ME-NAVIS2-OP-5

---

## หน้า 407

29.15 Warning messages (E600–E799)


E640–E641        Cause:
Laser radiation or the opening of the shutter was cancelled due to a system check of the
oscillator.
This warning occurs if laser pumping was off for several days. In this case up to 30s are
required for the first system check after start-up.
Remedy:
•   If the laser marking system is operated using Laser Marker NAVI smart, wait some time
   and retry the desired operation.

•   If the laser marking system is operating in remote mode, close the shutter or send the
   Alarm reset command to clear the warning status. Then retry opening the shutter or try
   to use the laser radiation for measurement.

Applies to LP-RC only.

E650             Cause:
The marking data are out of range.
Remedy:
•   Check the marking image display and adjust position and size of the marking data.
•   Adjust the values for “X-axis offset [mm]” and “Y-axis offset [mm]” in “System settings” >
   “System offset”. The system offset values are not reflected in the marking image editor.

•   If you calibrate the marking field in “System settings” > “Marking field calibration”,
   change the setting values.


E651             Cause:
The z-position of the marking data is outside the marking area.
Remedy:
•   Adjust the value for z-movement in the object group settings.
•   Adjust the value for z-movement in the file settings.

•   Adjust the value for “Z-axis offset [mm]” in “System settings” > “System offset”.

•   LP-ZV: When you use the autofocus function, check if the detected workpiece
   displacement value is correct.

Applies to LP-GS, LP-ZV only.

E652             Cause:
The font file cannot be read.
Remedy:
•   Add the font file again in the “Data management” screen.
•   Check the font file format.


ME-NAVIS2-OP-5                                                                                                407

---

## หน้า 408

29 Troubleshooting


E653                 Cause:
The graphic file cannot be read.
Remedy:
•   Add the graphic file again in the “Data management” screen.
•   Check the graphic file format.


E654                 Cause:
No font file is available at the specified font number.
Remedy:
•   Add the font file in the “Data management” screen.
•   Specify the correct font number in the character settings.


E655                 Cause:
The font file exceeds the memory capacity for font files of the laser marking system.
Remedy:
•   Reduce the number of characters in the font file.
•   Delete unnecessary font files.


E656                 Cause:
The specified graphic file is not available.
Remedy:
•   Add the graphic file in the “Data management” screen.
•   When creating a marking file using communication commands, if you prefer to ignore
   this warning for convenience in creation or control procedures, deselect the check box
   “Warning if no graphic file is specified” in “System settings” > “Operation/information” >
   “Advanced system settings”.


E657                 Cause:
The selected font is not available for the specified characters.
Remedy:
•   Change the characters, or add the required font file.
•   To use Japanese or Simplified Chinese characters, set East Asian characters in the file
   settings.


E658                 Cause:
The marking object contains too many characters.
Remedy:
•   Reduce the number of characters.
•   Distribute the characters over several objects.


408                                                                                                ME-NAVIS2-OP-5

---

## หน้า 409

29.15 Warning messages (E600–E799)


E659             Cause:
The selected font does not support bold marking.
Remedy:
•   The ORG4 font cannot be used for bold marking.
•   Use the Font Maker software to create the required font.


E660             Cause:
Bold marking is not possible due to the set combination of bold line width, character height
and character width.
Remedy:
•   Set the line width of the bold character to a half or below of the character height and
   width.

•   When marking a bold character, the ratio between character height and width should be
   1/10 to 10.


E661             Cause:
The marking data exceed the memory capacity of the marking file.
Remedy:
•   Reduce the number of characters and segments in the graphic data.
•   Reduce the number of characters and start/end points of the graphic data.

•   Reduce the number of step & repeat markings.

•   Split long segments into shorter segments.


E662             Cause:
The number of step & repeat markings exceeds the limit.
Remedy:
•   Reduce the number of steps in your step & repeat object (max. 10000).


ME-NAVIS2-OP-5                                                                                                 409

---

## หน้า 410

29 Troubleshooting


E664                 Cause:
Two or more external input functions which may not be combined are set in one file. The
following combinations are not allowed:
•   Character entry by SIN command/Register function (registered characters switching via
   I/O connector)

•   Character entry by SIN command/Marking offset via I/O signal

•   Register function (registered characters switching via I/O connector)/Marking offset by
   SEO command

•   Linking of image processing devices/Trigger mode “Continuous trigger”

•   LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV:
   Linking of image processing devices/TARGET DETECTION IN (X7) input of TERMINAL
   connector

•   LP-ZV:
   Autofocus function/Trigger mode “Continuous trigger”

•   LP-ZV:
   3D marking/Marking offset via I/O signal

•   LP-ZV:
   Bar code or 2D code objects/3D marking of the shapes “Vertical cone” or “Sphere”

•   LP-ZV:
   Bar code or 2D code objects/3D marking of the shapes “Cylinder” or “Horizontal cone”
   with “Data mapping” set to “Projection”

Remedy:
Delete any one of these functions from the file.

E665                 Cause:
The marking data include characters that cannot be converted into 2D code.
Remedy:
•   Use characters which can be converted into 2D code.
•   For QR Code, change the mode setting. For Data Matrix, change the character type
   setting. For PDF417, change the compaction mode setting.


E666                 Cause:
•   The 2D code cannot be generated with the specified settings.

•   The number of characters exceeds the upper limit of the selected 2D code.

Remedy:
Check the code settings and the number of characters.


410                                                                                              ME-NAVIS2-OP-5

---

## หน้า 411

29.15 Warning messages (E600–E799)


E667             Cause:
The filling pattern specified for the 2D code is not available in the 2D code font (font
number: 2D).
Remedy:
•   Change the filling pattern.

•   Add the required font data in the “Data management” screen.


E668             Cause:
The marking data include characters that cannot be converted into bar code.
Remedy:
Use characters which can be converted into bar code.

E669             Cause:
•   The bar code cannot be generated with the current settings.

•   The number of characters exceeds the upper limit of the selected bar code.

Remedy:
Check the code settings and the number of characters.

E670             Cause:
The set narrow element or module width for bar codes is too small.
Remedy:
Specify a value which is larger than the value set for the calculation value of the line width
in the object group settings.

E671             Cause:
Bar code inversion was selected, but inversion of the quiet zone is incorrect.
Remedy:
Correct the value for “Quiet/narrow ratio”.

E672             Cause:
The settings for “Separator height to module width ratio” or “Lower bar code height to
module width ratio” are too small.
Remedy:
•   Specify a value which is larger than the value set for the calculation value of the line
   width in the object group settings.

•   If you want to remove the separator, set 0 for “Separator height to module width ratio”.


E673             Cause:
The bar code cannot be generated due to an invalid number of characters for EAN/UPC/
JAN or GS1 DataBar code.
Remedy:
Enter the prescribed number of characters for the selected code.


ME-NAVIS2-OP-5                                                                                                  411

---

## หน้า 412

29 Troubleshooting


E674                 Cause:
A string containing “%” is not properly set.
Remedy:
•   If functional characters such as a counter or date/time are input, delete and re-enter the
   characters after “%”.

•   To mark the character “%”, enter “%%”.

•   To mark the character “+” or "/" after a counter, enter “%+” or “%/”.


E678                 Cause:
The character number specified by the SIN command has not been set in Laser Marker
NAVI smart.
Remedy:
Specify the same character number in Laser Marker NAVI smart and in the SIN command.

E679                 Cause:
Communication was interrupted. Power optimization by marking position could not be
applied.
Remedy:
•   Set the value for “Power optimization by marking position” and apply the setting again.

•   Do not turn off the power while the setting is applied.

•   Do not turn on remote mode while the setting is applied.

Applies to LP-GS, LP-RC, LP-RH only.

E680                 Cause:
The following functions are not available in RUN mode:
   “Functional characters” > “External control” > “Registered characters (via I/O connector)”
   “Functional characters” > “External control” > “Characters specified by SIN command”
   “Function settings” > “External offset” (Marking offset via I/O signal or by SEO
   command)
   “Function settings” > “Counter” > “Reset at date change”

Remedy:
•   To execute the marking in RUN mode, delete these functions from the marking data.

•   The laser marking system must be in remote mode to use these functions.


412                                                                                               ME-NAVIS2-OP-5

---

## หน้า 413

29.15 Warning messages (E600–E799)


E682             Cause:
The following functions are not available with on-the-fly marking:
   “File settings” > “Image checking before marking”, “Image checking after marking”
   “Object group” > “Overwriting interval [s]”
   2D code: “Object settings” > “Module marking order” > “Skip one”, “Skip two” (LP-ZV: If
   “LP-M/S/Z compatible” is set in the “System settings” screen: “File settings” > “ 2D code
   skip marking”)
   LP-ZV: “File settings” > “Autofocus” > “ON”
   LP-ZV: “Object group” > “Defocusing [mm]”

For marking at regular intervals and multiple trigger mode, the following functions are also
not available:
   “Functional characters” > “External control” > “Registered characters (via I/O connector)”
   “Functional characters” > “External control” > “Characters specified by SIN command”
   “Function settings” > “External offset” (Marking offset via I/O signal or by SEO
   command)
   “Function settings” > “Counter” > “Reset at date change”

Remedy:
•   To perform on-the-fly marking, delete these functions from the marking data.

•   Some functions are available with on-the-fly marking in single trigger mode.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.

E686             Cause:
The following functions are not available when “Seamless loop” is selected in the laser
settings:
   Multiple objects
   Objects consisting of unclosed lines
   Point radiation
   “Step & repeat” function

Remedy:
•   Deactivate “Seamless loop” in the laser settings.

•   If you want to radiate the laser continuously without break, create a closed line by
   setting the start and end points to the same position.


E687             Cause:
•   The width or height of the graphic exceeds 999.999mm.

•   The graphic parameters are not set because “Adjustment of size and filling” in the
   graphic object settings is set to “OFF” and “Graphic presets” for the selected DXF file is
   set to “OFF (recommended)”.

Remedy:
•   Reduce the graphic size.

•   If “Graphic presets” is set to “OFF (recommended)”, set “ON” for “Adjustment of size and
   filling” in the graphic object settings and specify the graphic parameters.


ME-NAVIS2-OP-5                                                                                               413

---

## หน้า 414

29 Troubleshooting


E688                 Cause:
The workpiece displacement exceeds the permissible range.
Remedy:
•   Check if the workpiece is in the proper position when displacement is measured.
•   Specify limit values with “Upper limit of work displacement [mm]” and “Lower limit of
   work displacement [mm]” in “File settings” to avoid this error.

•   When you use the autofocus function: Check if the sensor's detection area and the
   marking surface are identical.

Applies to LP-ZV only.

E689                 Cause:
Unable to detect the workpiece displacement.
Remedy:
When you use the autofocus function:
•   Check if the displacement sensor can detect the height without problem.

•   Check if the displacement sensor operates without error.

•   Check if the trigger of the displacement sensor is input when the workpiece is in the
   correct position.

Applies to LP-ZV only.

E690                 Cause:
The marking data is at an invalid position.
Remedy:
Check the 3D settings and move the marking data on the 3D model to the position where
the marking can be performed.
Applies to LP-ZV only.

E691                 Cause:
The 3D model contains an invalid setting.
Remedy:
•   Assign all object groups in the marking file to the 3D model.
•   If the shape of the 3D model is a vertical cone, check if the values of “Top diameter
   [mm]” and “Bottom diameter [mm]” are set correctly.

Applies to LP-ZV only.


414                                                                                               ME-NAVIS2-OP-5

---

## หน้า 415

29.15 Warning messages (E600–E799)


E692             Cause:
There are marking data outside of the marking field.
Remedy:
•   When you use the 3D marking, check the 3D settings.
•   Adjust the position (X, Y, Z) and size of the marking data located outside of the marking
   field.

•   When you use the autofocus function, check the workpiece displacement value.

•   When you use external input functions to specify the marking position or marking
   data, e.g. external offset function including SEO command or character entry by SIN
   command, make sure that the marking data are in the marking field.

Applies to LP-RH, LP-ZV only.

E699             Cause:
Some settings are incorrect.
Remedy:
•   Save the file again in the laser marking system, overwriting the corresponding file
   number.

•   If the problem persists, save a backup file and contact our service center or sales
   offices.


E710–E711        Cause:
The head fan stopped.
Remedy:
•   LP-GS, LP-RC: Clean the fan. For details, refer to the “Setup and Maintenance Guide”.
•   Check the connection of the fan.

•   LP-RC: Make sure the side covers of the laser head are properly installed.

Applies to LP-GS, LP-RC only.

E712             Cause:
The power supply voltage exceeds the permissible range.
Remedy:
Check the power supply voltage and correct it.
Applies to LP-RH, LP-ZV only.


ME-NAVIS2-OP-5                                                                                              415

---

## หน้า 416

29 Troubleshooting


E715                 Cause:
The temperature of the laser oscillator is increasing.
Remedy:
•   Make sure the operating temperature of the laser marking system does not exceed the
   permissible range.

•   Make sure the fan operates properly.

•   Clean the cooling air inlet and outlet, and the fan located at the cooling air area of the
   laser marking system.

•   If the air filter is contaminated, replace it.

Applies to LP-RC only.

E716–E717            Cause:
The rotation speed of the controller fan is decreasing.
Remedy:
•   Clean the cooling air inlet and outlet, and the fan located at the cooling air area of the
   controller.

•   If the air filter is contaminated, replace it.

•   If the fan is not working correctly, replace it.

Applies to LP-RH, LP-ZV only.

E720                 Cause:
The counter value may not be updated because the laser marking system was turned off
during the marking process.
Remedy:
•   Check the current value of the counter.

•   Do not turn off the laser marking system during the marking.


E721                 Cause:
The marking data could not be saved correctly because the laser marking system was
turned off during saving.
Remedy:
•   Check the file and the setting values.

•   Overwrite the file.

•   Do not turn off the laser marking system while saving a file.


E726–E729            Cause:
The rotation speed of the head fan is decreasing.
Remedy:
•   Clean the cooling air inlet and outlet located at the cooling air area of the laser head.
•   If the air filter is contaminated, replace it.

Applies to LP-RH only.


416                                                                                                 ME-NAVIS2-OP-5

---

## หน้า 417

29.15 Warning messages (E600–E799)


E750             Cause:
The trigger signal is invalid. The trigger signal was input during trigger processing.
Remedy:
•   To input a trigger signal, the marking trigger ready output READY OUT (Y5) must be
   ON.

•   Do not input the trigger signal while the trigger processing output PROCESSING OUT
   (Y10) is ON.

•   Make sure the switch or the sensor connected to TRIGGER IN (X5) of the I/O
   TERMINAL connector operates without chattering.

•   Check the connection of the external devices to the I/O terminals or the communication
   port.


E751             Cause:
The trigger signal is invalid. The marking trigger input is ON while the marking trigger ready
output is OFF.
Remedy:
•   To input a trigger signal, the marking trigger ready output READY OUT (Y5) must be
   ON.

•   Do not input the trigger signal while the trigger processing output PROCESSING OUT
   (Y10) is ON.

•   Make sure the switch or the sensor connected to TRIGGER IN (X5) of the I/O
   TERMINAL connector operates without chattering.

•   Check the connection of the external devices to the I/O terminals or the communication
   port.


E752             Cause:
TARGET DETECTION IN (X7) did not turn on during the lasing process.
Remedy:
•   Check the marking results before and after the error occurs.
•   Check the connection and control of the workpiece detection sensor.

•   Check the installation position of the sensor and make sure it is ON for more than 1ms
   during the lasing process.

•   When you do not use this function, disable TARGET DETECTION IN (X7) in the
   “System settings”.

Applies to LP-RC, LP-RF, LP-RH, LP-RV, LP-ZV only.


ME-NAVIS2-OP-5                                                                                              417

---

## หน้า 418

29 Troubleshooting


E760                 Cause:
•   The setting of a number input of the I/O connector failed.

•   The set input turned ON more than once before the setting completion output turned
   ON.

Remedy:
•   Keep the set input SET IN (No. 2) ON until the setting completion output SET OK OUT
   (No. 28) turns ON.

•   To set the number input again, close the shutter and reset the previous data.

•   Check the connections to external devices for faulty or loose contacts.

•   Check the operation logic of the connected device.


E770                 Cause:
Unable to communicate with Laser Marker NAVI smart because there is no connection
between the laser marking system and the PC.
Remedy:
•   Check the status of the Ethernet or USB connection.

•   For Bluetooth communication, check if there are any obstacles between the PC and the
   laser marking system and if the distance between the two devices is within the allowed
   range.

•   Save the files onto your local PC folder, and overwrite and save them on the laser
   marking system after the online connection was established.


E775                 Cause:
Unable to transmit the response data of the Marking end verification (MST) command.
Remedy:
•   When the marking interval is too short for the transmission of the MST command, the
   command cannot be used. In this case, confirm the completion of the marking process
   by I/O signals.

•   Check the operation logic of the external control.


E780                 Cause:
The unit serial numbers are mismatched.
Remedy:
•   LP-GS, LP-RC, LP-RH: It is recommended to use a laser head and a controller with the
   same serial number.

•   LP-RF, LP-RV, LP-ZV: Connect a laser head, controller and oscillator unit with the same
   serial number. If the serial numbers of the units do not match, the laser marking system
   may not maintain performance during marking.


418                                                                                                ME-NAVIS2-OP-5

---

## หน้า 419

29.15 Warning messages (E600–E799)


E781             Cause:
•   The laser head and the controller do not match.

•   The signal cable or unit power cable is not connected correctly.

Remedy:
•   We recommend that you connect a laser head and a controller which have identical
   serial numbers.

•   Check the connection of cables and signal lines, and restart the laser marking system.


E782             Cause:
The GSD file version is incorrect.
Remedy:
To use PROFINET, download the GSD file (XML file) that matches the controller version
of your laser marking system and apply it to the products. If the GSD file version is wrong,
settings from the PLC cannot be imported correctly by the laser marking system.
Applies to LP-RF, LP-RH, LP-RV, LP-ZV only.

E783             Cause:
The version of the optional expansion board is incorrect.
Remedy:
Update the firmware of your laser marking system. Download the software package Laser
Marker Firmware Updater from the following Web site:
https://industry.panasonic.com/global/en/downloads/?tab=software
In “Download Center” > “Software”, use the “Part Number Search” with your laser marking
system series name, like LP-ZV, to find the relevant software.
Applies to LP-RH, LP-ZV only.


Related topics

Alarm messages (E001–E599) (page 387)

Reset a warning message (E600–799) (page 400)


ME-NAVIS2-OP-5                                                                                             419

---

## หน้า 420

Index


Index

Numerics                                                    Alarm messages
E001–E599 387
2D code object                                                   Reset 387
2D code pattern font 189                                Align
2D code types 169                                            Character object 109
Create 181                                                   Marking objects 93
Data Matrix parameters 184                                   TrueType object 122
Data Matrix symbol sizes and data capacity 179          Application Identifiers (AIs)
Filling pattern parameters (QR Code, Data Matrix) 187        Overview 203
GS1 Data Matrix parameters 184                               Prefix codes 204
Invert a PDF417 code 197                                Assign an object group 227
Invert QR Code or Data Matrix 191                       Autofocus function 271
iQR Code parameters 182                                 Availability of screens 38
Laser correction parameters for code elements 193
Marking direction (PDF417) 198
   B
Marking direction (QR Code, Data Matrix) 185
Micro QR Code parameters 182                            Backup file
Micro QR Code versions and data capacity 179                Convert LP-400/LP-V backup files 82
Module marking order (QR Code, Data Matrix) 186             Convert LP-M/LP-S/LP-Z backup files 86
Number of overwritings for code elements 193                Create 78
Parameters for code elements 191                            Edit 79
PDF417 parameters 196                                       General information 77
Position 186                                                Initial configuration 81
QR Code Model 1 versions and data capacity 173              Restore 80
QR Code Model 2 versions and data capacity 176              Search 74
QR Code parameters 182                                  Bar code object
Quiet zone filling parameters 194                           Amend bar code data 162
Rotate 187                                                  Automatically optimize GS1 DataBar parameters 167
Structure of Data Matrix codes 173                          Bar code types 156
Structure of QR Codes 172                                   CODE128 parameters 164
3D marking                                                      CODE39 parameters 164
3D model types 217                                          CODE93 parameters 164
Coordinate systems 217                                      Composite code parameters 167
Data mapping 217                                            Create 159
3D model                                                        EAN/UPC/JAN parameters 164
Change the position 228                                     GS1 DataBar parameters 165
Create 225                                                  GS1-128 parameters 164
Object group position 228                                   Invert 161
Settings 225                                                ITF parameters 164
3D viewer                                                       Marking direction 162
3D image view 222                                           NW-7 (CODABAR) parameters 164
Editing tools overview 224                                  Position 163
Toolbar 222                                                 Rotate 163
User interface overview 222                             Basic parameters
   Character object 107
A                                                               TrueType object 121
Basic settings for 3D marking
Add                                                             Cylinder - Example 1 233
Font file 73                                                Cylinder - Example 2 235
Graphic files in the Data management screen 132             Horizontal cone 236
Graphic files using the Graphic tool 131                    Inclined plane 229
Advanced system settings 310                                    Sphere 239
Uneven plane 231


ME-NAVIS2-OP-5

---

## หน้า 421

Index


Vertical cone 238                                          Parameters 164
Bluetooth                                                   Command format settings 323
Connection 45                                          Command history 348
Settings 319                                           Communication settings
BMP file                                                        Ethernet 317
Add 131, 132                                               EtherNet/IP 320
Preset marking parameters 139                              Imagechecker 325
Preset position 137                                        PROFINET 322
Preset size 138                                            RS-232C 318
Built-in camera                                             Compatibility with former models
Camera lighting 98                                         Conversion rules for LP-400/LP-V files 84
Camera settings 96                                         Conversion rules for LP-M/LP-S/LP-Z files 88
General information 95                                     Parameters 269
Switch camera on or off 95                             Compatible mode
Troubleshooting 383                                        LP-400/V compatible 308
   LP-M/S/Z compatible 308
C                                                           Composite code
Parameters 167
Calendar settings 302                                       Control codes in bar code/2D code 323
Calibrate the marking field 332                             Controller
Calibrate the power monitor 355                                 Display 307
Camera lighting 98                                          Controller display
Camera settings 96                                              Settings 307
CD-ROM contents 22                                          Conversion rules for LP-400/LP-V files 84
Character object                                            Conversion rules for LP-M/LP-S/LP-Z files 88
Align 109                                              Convert
Basic parameters 107                                       LP-400/LP-V backup files 82
Change characters or reference character strings 107       LP-400/LP-V files (.nlm) 83
Change the position 110                                    LP-M/LP-S/LP-Z backup files 86
Character spacing 112, 115, 116                            LP-M/LP-S/LP-Z files (.zlm) 87
Character spacing for arc aligned objects 114          Coordinate systems 217
Create a character object (direct input) 104           Copy, paste and delete files 75
Create a character object (reference list) 105         Counter function 252
Line spacing 118                                       Create
Rotate 111                                                 2D code object 181
Set a user-defined character 106                           Arc (shape object) 149
Set the arrangement 108                                    Bar code object 159
Character spacing                                               Character object (direct input) 104
Arc aligned character objects 114                          Character object (reference list) 105
Character object 112, 115, 116                             Circle (shape object) 148
TrueType object 125, 127                                   Line (shape object) 147
Code elements                                                   Marking file in offline mode 64
Invert QR Code or Data Matrix 191                          Marking file in online mode 66
Laser correction parameters 193                            Object group 207
Number of overwritings 193                                 Point radiation object 153
Parameters 191                                             TrueType object 120
Code reader functions                                       Create a 3D model 225
Settings 326
CODE128                                                     D
Character set 156
Parameters 164                                         Data capacity
CODE39                                                          Data Matrix symbol sizes 179
Character set 156                                          Micro QR Code versions 179
Parameters 164                                             QR Code Model 1 versions 173
CODE93                                                          QR Code Model 2 versions 176
Character set 156


ME-NAVIS2-OP-5

---

## หน้า 422

Index


Data management screen                                         Autofocus function 271
Overview 37                                               East Asian character set 265
Data mapping 217                                               Imagechecker settings 267
Data Matrix                                                    Position, rotate and mirror all objects in a file 264
Character set 169                                         Trigger parameters 265
Filling pattern parameters 187                      Fill settings for a TrueType object 129
Marking direction 185                               Filling pattern parameters 187
Module marking order 186                            Font file
Parameters 184                                            Add 73
Quiet zone filling parameters 194                         Copy, paste and delete 75
Structure 173                                             Installed fonts 71
Symbol sizes and data capacity 179                        Search 74
Date, time and time zone 301                             Function settings
Disconnect an online connection 46                             Counter function 252
Distortion correction settings 334                             Expiry date and time function 254
Download software 21                                           External offset function 261
DXF file                                                       Lot number function 257
Add 131, 132                                              Overview 251
Edit 136                                                  Reference character strings 263
Preset marking parameters 140                             Register function (registered characters) 259
Preset position 137                                 Functional character settings
Preset size 138                                           Counter 245
Supported formats 143                                     Current or expiry date and time 242
   External control 248
E                                                              Laser settings 247
Lot number 246
EAN/UPC/JAN                                                    Use functional characters 241
Character set 156
Parameters 164                                      G
East Asian character set 265
Edit                                                     General parameters
Backup file 79                                          Marking object 101
DXF file 136                                            Object group 101
VEC file 134                                        General settings 29
Editing tools overview 91                                Graphic file
Error buzzer setting 304                                     Add 131, 132
Error codes                                                  Copy, paste and delete 75
Alarms (E001–599) 387                                   Search 74
Warnings (E600–E799) 401                            Graphic object
Error log 347                                                Add graphic files in the Data management screen 132
Ethernet                                                     Add graphic files using the Graphic tool 131
Communication settings 317                              Edit a DXF file 136
Connection 43                                           Edit a VEC file 134
EtherNet/IP                                                  Improve the marking quality 142
Communication settings 320                              Move a graphic object 133
Exit Laser Marker NAVI smart 28                              Preset marking parameters (DXF, HPGL) 140
Expiry date and time function 254                            Preset marking parameters (JPEG, BMP) 139
External control                                             Preset position (DXF, HPGL, JPEG, BMP) 137
Troubleshooting 375                                     Preset size (DXF, HPGL, JPEG, BMP) 138
External displacement sensor 327                             Reduce the marking time 142
External offset function 261                                 Rotate 134
Scale a VEC file 135
F                                                            Supported DXF file formats 143
Use a graphic object in a marking file 133
File settings                                            GS1 Data Matrix
"Compatibility with former models" parameters 269       Character set 169


ME-NAVIS2-OP-5

---

## หน้า 423

Index


Filling pattern parameters 187               J
Marking direction 185
Parameters 184                               JPEG file
Quiet zone filling parameters 194               Add 131, 132
GS1 DataBar                                         Preset marking parameters 139
Automatically optimize parameters 167           Preset position 137
Character set 156                               Preset size 138
Parameters 165
GS1-128                                          K
Character set 156
Parameters 164                               Kerning 128
Guide laser 56
L
H
Language selection 29
HPGL file                                        Laser correction parameters for a marking object 283
   Add 131, 132                                  Laser head direction 315
   Preset marking parameters 140                 Laser power correction 313
   Preset position 137                           Laser power inspection 349
   Preset size 138                               Laser power optimization 330
Human readable text                              Laser pumping
   Laser correction parameters 202                    Troubleshooting 361
   Parameters 199                                Laser settings
Fine-tune the laser settings 274
Limits for the marking energy 284
I
Parameters 273
Imagechecker                                          Smart settings for marking applications 281
Communication settings 325                      Smart settings for processing applications 282
Imagechecker functions                                Smart settings parameters 279
Settings 267                               Lasing process
Information about the laser marking system 301        Troubleshooting 364
Initial configuration using a backup file 81     Limits for the marking energy 284
Input and output settings 316                    Line spacing
Installation                                          Character object 118
Laser Marker Smart Utility 24                   Human readable text 199
USB driver 26                                   TrueType object 129
Installation of laser head                       Linking of image processing devices
Check marking position 59                       Troubleshooting 381
Guide laser 56                             Lot number function 257
Indicate marking center 60
Work distance 58                           M
Invert
Bar code object 161                        Maintenance
JPEG, BMP 139                                  Calibrate the power monitor 355
PDF417 197                                     Command history 348
QR Code, Data Matrix 191                       Error log 347
iQR Code                                             Inspect the laser power 349
Character set 169                              Operating data 345
Filling pattern parameters 187                 Output simulation 347
Marking direction 185                          Power check function 352, 353
Parameters 182                                 Power check history 357
Quiet zone filling parameters 194              Specify settings for maintenance tasks 346
ITF                                              Maintenance screen
Character set 156                              Overview 37
Parameters 164                             Marking direction
   Bar code object 162
   Data Matrix 185


ME-NAVIS2-OP-5

---

## หน้า 424

Index


GS1 Data Matrix 185                                            Versions and data capacity 179
iQR Code 185                                              Module marking order
Micro QR Code 185                                              Data Matrix 186
PDF417 198                                                     QR Code 186
QR Code 185                                               Monitor screen
Marking field                                                      Customize 339, 340
Calibrate 332                                                  Monitor the marking data 342
Distortion correction settings 334                             Overview 37
Indicate center 60
Position 314                                              N
Marking file
Copy, paste and delete 75                                 NW-7 (CODABAR)
Create and save to PC (offline mode) 64                        Character set 156
Create in online mode 66                                       Parameters 164
General information 63
Open a marking file from the laser marking system 67      O
Open a marking file from your PC 68
Open and save a file to your PC (offline mode) 65         Object group
Rename 75                                                      Create, duplicate or delete 207
Save a file to the laser marking system 69                     Editing tools 91
Search 74                                                      General parameters 101
Select a marking file on the Monitor screen 344                Parameters 209
Transfer a marking file from your PC to the laser marking      Position and rotate 207
system 69, 70, 70                                              Step & repeat function 211
Work with marking files in offline mode 64                Object list
Work with marking files in online mode 66                      Change the marking sequence 101
Marking image editor 90                                            Symbols 101
Marking object                                                Object type overview 100
Align 93                                                  Offline mode 41
Change the marking sequence 101                           On-the-fly marking
Editing tools 91                                               2 Sensors input timeout 288
General parameters 101                                         Distance line speed sensors 288
Laser correction parameters 283                                Enable 287
Modify 93                                                      Encoder resolution 288
Move 93                                                        Lasing start boundary 290
Move an object to a different object group 101                 Line speed 290
Object list 101                                                Line speed control 288
Object type overview 100                                       Line speed control setting "2 sensors input" 296
Marking position                                                   Moving direction 288
Check 59                                                       Overrun correction 290
Marking quality                                                    Setting example 296
Fine-tune the laser settings 274                               Trigger detecting position 288
Graphic object 142                                             Trigger mode 288
Inspect the laser power 349                                    Trigger mode parameters 294
Troubleshooting 367                                            Troubleshooting 372
Marking settings screen                                            Workpiece reference boundary 290
Overview 36                                                    Workpiece spacing 290
Marking time                                                  Online mode 41
Graphic object 142                                        Open
Measurement 60                                                 Existing marking file from PC (offline mode) 65
Micro QR Code                                                      Existing marking file from the laser marking system 67
Character set 169                                              Existing marking file from your PC 68
Filling pattern parameters 187                            Operating data 345
Marking direction 185                                     Outline of Laser Marker NAVI smart 20
Parameters 182                                            Output simulation 347
Quiet zone filling parameters 194


ME-NAVIS2-OP-5

---

## หน้า 425

Index


P                                                           Model 2 versions and data capacity 176
Module marking order 186
Password                                                    Parameters 182
Delete 338                                              Quiet zone filling parameters 194
Set or disable 338                                      Structure 172
PC connection                                           Quiet zone filling parameters (QR Code, Data Matrix) 194
Troubleshooting 362
PC requirements 21
R
PDF417
Character set 169                                   Reference character strings 263
Invert 197                                          Register function (registered characters) 259
Marking direction 198                               Remote mode
Parameters 196                                          Automatically at power-on 51
Permissions 339, 340                                        Settings 304
Point radiation object                                      Switching by I/O 52
Add a point 154                                         Switching by software 50
Create 153                                          Reset
Delete a point 154                                      Alarm (E400–E599) 387
Edit a point 154                                        Warning (E600–E799) 400
Position 155                                        Rotate
Rotate 155                                              2D code object 187
Position                                                    Bar code object 163
2D code object 186                                      Character object 111
3D model 228                                            Graphic object 134
Bar code object 163                                     Object group 207
Character object 110                                    Point radiation object 155
Graphic object 133                                      Shape object 151
Object group 207                                        TrueType object 124
Object group on 3D model 228                        RS-232C
Point radiation object 155                              Communication settings 318
Shape object 151                                    RUN mode 53
TrueType object 123
Position, rotate and mirror all objects in a file 264
S
Power check function
Correct the laser power 353                         Save
Measure the laser power 352                              Data to your PC or external memory 76
Power check history 357                                      Marking file 66, 69
Preferences                                                  Marking file to PC (offline mode) 64
General settings 29                                 Scale
Language selection 29                                    VEC file 135
Manage fonts that can be used in offline mode 31    Search for files 74
User interface elements 30                          Settings for maintenance tasks
Preset position                                              Air filter replacement 346
DXF, HPGL, JPEG, BMP file 137                            Laser port emission cleaning 346
Preset size                                             Shape object
DXF, HPGL, JPEG, BMP file 138                            Add a shape 151
Product configuration 23                                     Create a circle 148
PROFINET                                                     Create a line 147
Communication settings 322                               Create an arc 149
   Delete a shape 151
Q                                                            Position 151
Rotate 151
QR Code                                                 Smart settings
   Character set 169                                         Marking applications 281
   Filling pattern parameters 187                            Parameters 279
   Marking direction 185                                     Processing applications 282
   Model 1 versions and data capacity 173


ME-NAVIS2-OP-5

---

## หน้า 426

Index


Software version 28                                   Touch panel console/monitor
Start Laser Marker NAVI smart 27                           Troubleshooting 384
Start marking button 48                               Trigger parameters 265
Start-up                                              Troubleshooting
Troubleshooting 360                                   Common problems 359
Startup screen                                        TrueType object
Overview 36                                           Align 122
Step & repeat                                              Change the basic parameters 121
Basic parameters 211                                  Change the position 123
Counter parameters 212                                Character spacing 125, 127
Parameters for an element 214                         Create 120
Stop laser radiation 49                                    Fill settings 129
System settings                                            Kerning 128
Advanced system settings 310                          Line spacing 129
Bluetooth settings 319                                Rotate 124
Calendar settings 302                                 Set the arrangement 121
Calibrate the marking field 332
Code reader functions 326                        U
Command format settings 323
Compatible mode 308                              Uninstall Laser Marker NAVI smart 27
Control codes in bar code/2D code 323            USB connection 42
Controller display 307                           User interface elements
Customize the Monitor screen 339, 340                Customize 30
Date, time and time zone 301                         Overview 33
Delete a forgotten password 338                  User selection 39
Distortion correction settings 334               User-defined character 106
Error buzzer 304
Ethernet settings 317                            V
EtherNet/IP communication settings 320
External displacement sensor 327                 VEC file
Imagechecker communication settings 325             Add 131, 132
Information about the laser marking system 301      Edit 134
Input and output settings 316                       Scale 135
Laser head direction 315
Laser power correction 313                       W
Marking field position 314
Name for the laser marking system 303            Warning messages
Optimize the laser power 330                        E600–E799 401
Permissions 339, 340                                Reset 400
PROFINET communication settings 322              Work distance 58
Remote mode 304                                  Work distance offset 336
RS-232C settings 318                             Workpiece displacement 61
Set or disable a password 338
Time hold function 306
Touch panel console and monitor 312
Work distance offset 336
System settings screen
Overview 38


T
Test marking 54
Time hold function 306
Tool overview 47
Toolbar 222
Touch panel console and monitor 312


ME-NAVIS2-OP-5

---

## หน้า 427

MEMO

---

## หน้า 428

1006, Oaza Kadoma, Kadoma-shi, Osaka 571-8506, Japan
https://industry.panasonic.com/

Please visit our website for inquiries and about our sales network.
© Panasonic Industry Co., Ltd. 2020 - 2024
July, 2024

---
