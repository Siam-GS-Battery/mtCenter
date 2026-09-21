# LP-RF200P_Installation_Maintenance_TH

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\Laser_Mark\LP-RF200P_Installation_Maintenance_TH.pdf` |
| **จำนวนหน้า** | 218 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---

## หน้า 1

Laser Marker
Setup /
Maintenance Guide

LP-RF series


Please read these instructions carefully before using this
product, and save this manual for future use.


ME-LPRF-SM-11


2021. 8     panasonic.net/id/pidsx/global

---

## หน้า 2

Preface
Thank you for purchasing our product.
For full use of this product safely and properly, please read this document carefully.
This product has been strictly checked and tested prior to its delivery. However, please make sure that this product
operates properly before using it. In case that the product becomes damaged or does not operate as specified in this
document, contact the dealer you purchased from or our sales office.

The English version of this document is the original version. All other languages are translations that are based on the
original documentation.

⿎⿎General terms and conditions of this document
    1. Before using this product, or before every starting operation, please confirm the correct functioning and performance
       of this product.
    2. Contents of this document could be changed without notice.
    3. This document must not be partially or totally copied or revised.
    4. All efforts have been made to ensure the accuracy of all information in this document. If there are any questions,
       mistakes, or comments in this document, please notify us.
    5. Please remind that we assume no liability for any results arising out of operations regardless of the above clauses.

⿎⿎Disclaimer
The applications described in this document are all intended for examples only. The purchase of our products described in
this document shall not be regarded as granting of a license to use our products in the described applications. We do NOT
warrant that we have obtained some intellectual properties, such as patent rights, with respect to such applications, or that
the described application may not infringe any intellectual property rights, such as patent rights, of a third party.

⿎⿎Trademark
• Windows is a registered trademark or trademark of Microsoft Corporation in the United States and/or other countries.
• QR Code is a registered trademarks of DENSO WAVE INCORPORATED.
• Adobe, Adobe Logo, Adobe Reader, and Adobe Illustrator are either registered trademarks or trademarks of Adobe
  Systems Incorporated in the United States and/or other countries.
• EtherNet/IP is a trademark of ODVA, Inc.
• All other product names and companies provided in this document are trademarks or registered trademarks of their
  respective companies.


2                                                           ME-LPRF-SM-11

---

## หน้า 3

ALWAYS FOLLOW THESE IMPORTANT
Cautions in Handling                                           SAFETY PRECAUTIONS!

To reduce the risk of injury, loss of life, electric shock, fire, malfunction, and damage to equipment or property, always
observe the following safety precautions.

The following symbols are used to classify and describe the level of hazard, injury, and property damage caused when the
denotation is disregarded and improper use is performed.


DANGER                     Denotes a potential hazard that will result in serious injury or death.


WARNING Denotes a potential hazard that could result in serious injury or death.
 CAUTION Denotes a hazard that could result in minor injury.

The following symbols are used to classify and describe the type of instructions to be observed.


This symbol is used to alert users to a specific operating procedure that must not be performed.


This symbols is used to alert users to a specific operating procedure that must be followed in order to
operate the unit safely.


This symbols is used to alert users to a specific operating procedure that must be performed carefully.


   DANGER
• Never look at laser beam directly, through lens or
  through any other optical components. Laser beam
  radiation into the eye causes blindness or serious
  damage to the eye.
  Not only the direct beam of laser, but also diffused
  reflected beam is harmful.


• Never touch laser beam and avoid human skin, clothing and any other
  flammable object from laser beam exposure directly.
  Burning into deep skin might result and there is a risk of fire.


ME-LPRF-SM-11                                                       3

---

## หน้า 4

WARNING
• Do not use this product anywhere where fire is strictly prohibited, near inflammable gas, objects or organic
  solvents such as thinner or gasoline, or in dusty place. There is a risk of fire.

• Do not use this product except for water-resistant part in wet place. In addition, never conduct wiring or
  maintenance work with wet hands or when the product surface is wet. Otherwise, electric shock and/or
  malfunction may result.

• Never disassemble the product.
  Doing so may cause exposure to the laser beam or electric shock.

• Do not insert hands or objects between the gaps of the exhaust port or intake port. There is a risk of
  electrical shock or injury.

• Take laser protection measures required to use Class 4 laser products subject to the local laws and
  regulations of the country or region in which this laser product is used.

• To protect the operators' eyes, make it mandatory to wear goggles against laser beam
  within the laser controlled area. The protective goggles can momentarily protect the
  eyes against the scattered beam. Never look at the direct beam or reflected beam
  even when you are wearing the protective goggles.

• Set protective enclosure including a workpiece stand or terminating object of the laser beam with proper
  reflectance, durability and thermal resistance to enclose the laser radiation area without leakage.

• Construct an interlock systems such as a function to stop laser radiation for the maintenance door of the
  protective enclosure.


• After power supply of laser marker is turned off, laser safety manager must remove the key and keep it.


• Be sure to connect the head and controller of the laser marker which have the same model number or
  allowed combination of the unit model number. Otherwise there is a risk of exposure to laser radiation or
  failure.

• Read all guides and manuals thoroughly, and do not operate, install and connect the laser marker with
  any other methods except the instructions provided in the manuals. If the product is used in a manner not
  specified by the instruction, the safety protection and functions provided by the device may be impaired
  and may cause injury, electrical shock or exposure of laser beam.

• Prior to wiring, cable connecting, and/or maintenance work, ensure that all the power switches are turned
  off. Otherwise, electrical shock may result.

• The wiring and maintenance must be conducted by the electrical engineers or under their supervision.
  Incorrect work may cause electrical shock.

• Connect ground wire before using. A failure or electrical leakage that occurs when the unit is not properly
  grounded may result in electric shock.

• Perform regular maintenance (cleaning, parts replacement) on this product. Using the product with dust or
  dirt may cause a fire or electric shock.

• For LP-RF/LP-RV series, be careful neither to give strong power to the fiber cable nor to nip it for
  installation. Do not install the product to the systems that give excessive load acts on the fiber cable, such
  as head movement unit. If the fiber cable is damaged, it may cause laser exposures.


4                                              ME-LPRF-SM-11

---

## หน้า 5

WARNING
• Remove the dust and/or gas which may be generated during the laser radiation with dust collector or
  exhauster. Use an appropriate dust collector or exhauster for dust or gas generated.
  Depending on the material of the objects, harmful dust and/or gas to the human body and the laser marker
  may be generated.
Dust collector


Protective
enclosure

• When using the assist gas for laser processing, take safety precautions to protect operators from
  exposure, ignition, toxic effect, excess or lack of oxygen.

• To carry this product, wear the non-slip gloves and safety shoes. Hold the product with both hands. Do not
  hold the cables or connectors at carrying.
• To carry this product, do not hold the cut edges of metal parts, the protrusions or corners of the product
  body. It may cause injury.
• For LP-RC/LP-RF/LP-RV series, carry the controller unit with two persons. Lifting or carrying without
  assistance may cause of injury.
• Install this product in the stable place without vibration and shock.
• In case it falls down, it may cause injury.


CAUTION
• Do not touch the head surface of LP-RF/LP-RV series during and right after the operation. It becomes hot
  and may cause burn injury.


ME-LPRF-SM-11                                                         5

---

## หน้า 6

For the Proper Use of Product
• Be sure to observe the following matters to prevent a failure or a malfunction of this product and to
  maintain the product performance properly.


 Operating environment
• Do not use the product in a place with frequent vibrations or shocks. Moreover, please do not drop this product. It may
  affect the precision component and optical component inside, which could impair the performance or result in a failure.
• Do not use the system outdoors.
• This product uses the air cooling system as the laser cooling method. Please install not to bar the flow of air cooling.
  Avoid placing heat sources near the product.
• Be sure to use the product within the ambient temperature and humidity defined in the specifications.
• Be careful not to have water, oil, fingerprints, dust, or dirt attached to the laser emission port of the head. This could
  degrade the marking performance and may result in a failure. If the laser emission port becomes dirty, use a dry soft
  cloth to clean the port.
• Make sure to replace the air filter on a periodic basis. If the air filter becomes dirt and air flow is obstructed, resulting in
  failure of this product.
• Ensure that the dust or gas is removed by placing the intake duct of the dust collector or exhauster near the source of
  dust or gas. Any dust or gas contamination on the laser emission port may cause failure or decrease the laser marking
  or processing quality. In addition, when the laser beam is blocked by dust or gas, it may cause decrease in laser marking
  quality.

 Installation
• To carry this product, wear the non-slip gloves and safety shoes. Hold the product with both hands. Do not hold the fiber
  unit, cables or connectors at carrying.
• Do not touch the laser emission port on the bottom of the head. It may affect the marking quality badly.
• Carry the controller unit with two persons.
• Carry this product as shown in the figure below.

Head                                                         Controller


Laser pointer
emission port
   Fiber unit


Laser emission port


• Do not install the product to the systems that give excessive load acts on the head and cables, such as head movement
  unit. Failure to do so may damage the head precision parts or disconnect the cables, resulting in a failure.
• Be careful not to apply excess force to the cable or not to nip the cable at the installation.
• Verify the minimum bend radius of each cable and install them without excess forces being applied.
• Do not hit the device with a tool such as a hammer at the installation. Do not use excessive force while tightening the
  screws (nuts). It may cause a failure.
• Do not insert foreign objects to the exhaust port of each unit or the gaps between units.
• Use anti-reflection material (ex. black paint for metal) for an external shutter or a protective enclosure in a path of laser
  beam. It may cause a failure of the components inside the laser marker head.
• If any other devices such as a sensor or a camera are installed near the laser marker, make sure that these devices are
  installed in the place where laser beam and its reflected beam do not damage to them.


6                                                            ME-LPRF-SM-11

---

## หน้า 7

For the Proper Use of Product
• Be sure to observe the following matters to prevent a failure or a malfunction of this product and to
  maintain the product performance properly.


 Wiring
• Verify that the cables are wired correctly before powering on.
• For the connection of this product, use the dedicated cables attached to the product or the specified optional cables.
• Check the voltage fluctuations of the power supply. Do not input the power supply exceeding the rating.
• If a surge occurs in the power supplied, connect a surge absorber to a source of the surge to absorb it.
• Be sure to take measures against surge before connecting any induction load such as DC relay to the load.
• The output has no protection function for short-circuit; therefore, do not connect the power supply or capacitive load
  directly.
• Make sure to ground the frame ground (F.G.) terminal of this product.
• Install such that the controller housing and the head housing are at the same electric potential.
• Each connecting cable should not be used in the same raceway or connected in parallel to any device that generates
  high-tension wires, power lines, large switching surge or the like. There is a risk of malfunction caused by induction.
• USB cable should not be connected in parallel with the AC power cable or the motor power cable.
• Make the wiring as short as possible to prevent a malfunction by the noise.

 Operation
• Do not power off until the startup has completed since turning on the laser marker power.
• To power on the laser marker again, wait for 5 seconds or more since turning off the power, then turn it on again.
• The following items, Date, Lot, and Expiry Date are marked based on the system clock of the laser marker. The system
  clock might be deviated due to error of the internal parts or degree of the battery drain, ambient temperature and
  humidity. Therefore, be sure to check the time of the system clock before the operation without fail.

 Others
• Be sure to delete all registered data when transferring or discarding this product. Retained data might result in illegal
  read out and leaking of information by a third-party with malicious intent.


ME-LPRF-SM-11                                                         7

---

## หน้า 8

Network security
As you will use this product connected to a network, your attention is called to the following security risks.
(1) Leakage or theft of information through this product
(2) Use of this product for illegal operations by persons with malicious intent
 (3) Interference with or stoppage of this unit by persons with malicious intent
It is your responsibility to take precautions such as those described below to protect yourself against the above network
security risks.
 • Use this product in a secure network by using protection tools such as a firewall.
 • If this product is connected to a network that includes PCs, make sure that the system is not infected by computer
   viruses or other malicious entities (using a regularly updated antivirus program, anti-spyware program, etc.).
 • Use this product in an environment that has LAN, VPN (Virtual Private Network) or leased line network.
 • Use this product in an environment where only limited people concerned can enter.
 • Use this product and connected devices such as a PC and tablet securing safety.
 • Do not install this product in locations where the product or the cables can be destroyed or damaged by persons with
   malicious intent.

Note that incorrect setting of the connection to the existing LAN might cause malfunction in the devices on the network.
Consult your network administrator before connecting.


8                                                            ME-LPRF-SM-11

---

## หน้า 9

 Order Placement Recommendations and Considerations
The Products and Specifications listed in this document are subject to change (including specifications, manufacturing facility and
discontinuing the Products) as occasioned by the improvements of Products. Consequently, when you place orders for these Products,
Panasonic Industrial Devices SUNX asks you to contact one of our customer service representatives and check that the details listed in
the document are commensurate with the most up-to-date information.

SAFETY PRECAUTIONS
Panasonic Industrial Devices SUNX is consistently striving to improve quality and reliability. However, the fact remains that electrical
components and devices generally cause failures at a given statistical probability. Furthermore, their durability varies with use
environments or use conditions. In this respect, check for actual electrical components and devices under actual conditions before use.
Continued usage in a state of degraded condition may cause the deteriorated insulation. Thus, it may result in abnormal heat, smoke
or fire. Carry out safety design and periodic maintenance including redundancy design, design for fire spread prevention, and design
for malfunction prevention so that no accidents resulting in injury or death, fire accidents, or social damage will be caused as a result of
failure of the Products or ending life of the Products.

The Products are designed and manufactured for the industrial indoor environment use. Make sure standards, laws and regulations in
case the Products are incorporated to machinery, system, apparatus, and so forth. With regard to the mentioned above, confirm the
conformity of the Products by yourself.

Do not use the Products for the application which breakdown or malfunction of Products may cause damage to the body or property.
i) usage intended to protect the body and ensure security of life
ii) application which the performance degradation or quality problems, such as breakdown, of the Products may directly result in
   damage to the body or property
It is not allowed the use of Products by incorporating into machinery and systems indicated below because the conformity, performance,
and quality of Products are not guaranteed under such usage.
i) transport machinery (cars, trains, boats and ships, etc.)
ii) control equipment for transportation
iii) disaster-prevention equipment / security equipment
iv) control equipment for electric power generation
v) nuclear control system
vi) aircraft equipment, aerospace equipment, and submarine repeater
vii) burning appliances
viii) military devices
ix) medical devices (except for general controls)
x) machinery and systems which especially require the high level of reliability and safety

ACCEPTANCE INSPECTION
In connection with the Products you have purchased from us or with the Products delivered to your premises, please perform an
acceptance inspection with all due speed and, in connection with the handling of our Products both before and during the acceptance
inspection, please give full consideration to the control and preservation of our Products.

WARRANTY PERIOD
Unless otherwise stipulated by both parties, the warranty period of our Products is one year after the purchase by you or after their
delivery to the location specified by you.
The consumable items such as battery, relay, filter and other supplemental materials are excluded from the warranty.

SCOPE OF WARRANTY
In the event that Panasonic Industrial Devices SUNX confirms any failures or defects of the Products by reasons solely attributable to
Panasonic Industrial Devices SUNX during the warranty period, Panasonic Industrial Devices SUNX shall supply the replacements of
the Products, parts or replace and/or repair the defective portion by free of charge at the location where the Products were purchased or
delivered to your premises as soon as possible.
However, the following failures and defects are not covered by warranty and we are not responsible for such failures and defects.
  (1) When the failure or defect was caused by a specification, standard, handling method, etc. which was specified by you.
  (2) When the failure or defect was caused after purchase or delivery to your premises by an alteration in construction, performance,
specification, etc. which did not involve us.
  (3) When the failure or defect was caused by a phenomenon that could not be predicted by the technology at purchasing or contracted
time.
  (4) When the use of our Products deviated from the scope of the conditions and environment set forth in the instruction manual and
specifications.
  (5) When, after our Products were incorporated into your products or equipment for use, damage resulted which could have been
avoided if your products or equipment had been equipped with the functions, construction, etc. the provision of which is accepted
practice in the industry.
  (6) When the failure or defect was caused by a natural disaster or other force majeure.
  (7) When the equipment is damaged due to corrosion caused by corrosive gases etc. in the surroundings.

The above terms and conditions shall not cover any induced damages by the failure or defects of the Products, and not cover your
production items which are produced or fabricated by using the Products. In any case, our responsibility for compensation is limited to the
amount paid for the Products.

SCOPE OF SERVICE
The cost of delivered Products does not include the cost of dispatching an engineer, etc.
In case any such service is needed, contact our sales representative.


ME-LPRF-SM-11                                                                    9

---

## หน้า 10

Related Regulations and Standards
  Applicable regulations and standards
 This product meets the requirements mandated by the following regulations and standards.
 Note that our products do not conform to the regulations and standards of the countries and regions not mentioned in this
 section. When exporting this product by itself or integrated into machine or device, confirm the regulations and standards of
 the exporting country or region.

Model            Applicable regulations and standards
LP-RF200P        JIS (Japanese Industrial Standards)
   • JIS C 6802
   FDA (Food and Drug Administration) Regulations
   • 21 CFR 1040.10 and 1040.11 (except for conformance with IEC 60825-1 Ed. 3, as described in
   Laser Notice No. 56 dated May 8, 2019)
   EN Standard (CE Marking)*1
   • 2014/30/EU “EMC Directive”
   • EN 55011
   • EN 61000-6-2
   • 2006/42/EC “Machinery Directive” (for partly completed machinery)*2
   • EN ISO 11553-1
   • EN 60204-1


• 2011/65/EU as amended by (EU)2015/863 “RoHS Directive”
   • EN IEC 63000
• Technical specification
   • EN 55032
   • EN 60825-1


GB (Chinese National Standard)
• GB 7247.1-2012 (idt IEC 60825-1: 2007)
KC mark (Korea Certification)
Class A Equipment (Industrial Broadcasting & Communication Equipment)
This equipment is Industrial (Class A) electromagnetic wave suitability equipment and seller or user
should take notice of it, and this equipment is to be used in the places except for home.
A 급 기기 ( 업무용 방송통신기자재 )
이 기기는 업무용 (A 급 ) 전자파적합기기로서 판매자 또는 사용자는 이 점을 주의하시기 바라며 ,
가정외의 지역에서 사용하는 것을 목적으로 합니다 .

 *1 : Contact for CE:
Panasonic Marketing Europe GmbH, Panasonic Testing Center
Winsbergring 15, 22525 Hamburg, Germany
 *2 : The printed copy of “Declaration of Incorporation of Partly Completed Machinery” is included in the package of this
product.


• Construct a safety system before using this product as it is a class 4 laser product.
• While constructing the system, check ISO 13849-1 and ISO 11553-1, and take the required safety measures
  accordingly.
  Please see the “Laser Safety Guide” for details.


10                                                      ME-LPRF-SM-11

---

## หน้า 11

 Implementing safety measures for the laser products
This product falls into Class 4 laser product according to IEC 60825-1.
By definition, class 4 lasers are “Laser products for which intrabeam viewing and skin exposure is hazardous and for which
the viewing of diffuse reflections may be hazardous. These lasers also often represent a fire hazard.”
To protect the operator from being exposed to a laser beam, be sure to follow the instructions in attached “Laser Safety
Guide” and safety regulations in each country or region.

 Removing and eliminating dust or gas
Depending on the laser radiation objects, noxious dust or gas may generate by the laser radiation, which could harm
human body or the environment.
Eliminate dust or gas generated using a dust collector or an exhauster according to the constituent of such dust or gas.
Dispose of the exhaust gas safely and appropriately according to the laws and regulations of the country, region, or area
applicable.

 Attention for the laser marker disposal
For disposal of this product, segregate and dispose of it appropriately according to the laws and regulations of the country,
region, or area applicable.
Refer to “7-5 Disposal of Laser Marker” (P.185).


 To use the laser marker in the European region
This product is designed as a component that is incorporated into the customers’ machinery and systems, and this product
conforms to 2006/42/EC “Machinery Directive” for partly completed machinery.
Therefore, when this laser marker product is incorporated into the system and it is exported to or used in the European
region as a final system, the system designer or the end-customer should take the following measures and verify that the
whole system conforms to the Machinery Directive.
 • Install the laser maker to the system by following the requirements for the accessibility and maintenance of EN 60204-1.
 • Provide the power to the laser marker from the power supply terminals of the system.


ME-LPRF-SM-11                                                       11

---

## หน้า 12

How to Read this Document
  Symbol description

   “Notice” denotes any instructions or precautions for using this product. To prevent the damage or
ワㄐㄕㄊ㄄ㄆ
   malfunction of the product, observe these precautions fully.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ       “Reference” denotes any hints for operation, detail explanations, or references.


  Target model
 This document is subject to the following Laser Marker models.
 In this document, this product is called “laser marker”.
 If the setting contents or specifications vary by models, the target models are specified in the text.
 In the text, multiple models may be described collectively, as shown in the table below.
 Please remind that the illustration and the screen image may vary with the model.
Target model            Description in the text
LP-RF200P               LP-RF Series


  Type of manuals
 For this product, the following manuals are prepared. Read each manual and operate this product correctly and safely.
 Also, save the manuals for future use.

 Laser Safety Guide
This manual describes the items required for using this product correctly and safely. All users shall be required for
reading this manual.

 Setup/Maintenance Guide
This manual describes the items required for introduction and installation of this product as well as for the maintenance
work.
 • Product specifications, external dimensions
 • Installation and connection method
 • Signal details, I/O rating, and timing chart when I/O is used for control
 • Maintenance details
Mainly the machine builder and system integrator shall be required for reading this manual.

 Laser Marker NAVI smart Operation Manual
Instruction manual for the laser marker configuration software “Laser Marker NAVI smart”. This manual describes the
procedure and method to operate the laser marker, and the screen operations to set marking contents.

 Serial Communication Command Guide
This manual describes the communication commands to control this product externally using the serial communication
(RS-232C/Ethernet). It describes the communication settings, communication data formats, communication commands,
and the control samples.
Mainly the machine builder and system integrator shall be required for reading this manual.

 Serial Communication Command Guide: LP-400/V compatible mode
This manual describes the communication commands to control this product externally using the compatible command
format with the former models of LP-400/LP-V series.
Mainly the machine builder and system integrator shall be required for reading this manual.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The PDF data of each manual is included on an attached CD-ROM “Laser Marker Smart Utility”.
 • To read the PDF manual, Adobe Reader (Version X or later) of Adobe Systems Incorporated is required.


12                                                         ME-LPRF-SM-11

---

## หน้า 13

Contents
Preface................................................................................................................ 2
Cautions in Handling............................................................................................ 3
Related Regulations and Standards................................................................... 10
How to Read this Document............................................................................... 12

1 Product Overview……………………………………………………… 17
1-1 Product Model.............................................................................................. 18
1-2 Product Configuration.................................................................................. 19
   1-2-1 Basic composition....................................................................................... 19
   1-2-2 Optional items............................................................................................. 20
   1-2-3 Package...................................................................................................... 21
1-3 Specification................................................................................................ 23
1-4 Outer Dimensional Drawing......................................................................... 25
   1-4-1 Head........................................................................................................... 25
   1-4-2 Fiber Unit.................................................................................................... 26
   1-4-3 Controller.................................................................................................... 27
   1-4-4 Cables........................................................................................................ 28
1-5 Name of Each Component.......................................................................... 29
   1-5-1 Head........................................................................................................... 29
   1-5-2 Controller.................................................................................................... 31

2 Laser Marker Installation……………………………………………… 34
2-1 Installation Environment............................................................................... 35
2-2 Installation Space......................................................................................... 36
2-3 Head Installation.......................................................................................... 37
   2-3-1 Installation direction.................................................................................... 37
   2-3-2 Installation method..................................................................................... 38
   2-3-3 Marking field and marking center position.................................................. 40
   2-3-4 Marking position check.............................................................................. 41
   2-3-5 Detaching / attaching the fiber unit............................................................. 42
2-4 Controller Installation................................................................................... 46
2-5 Connecting Laser Marker............................................................................ 47
   2-5-1 Connection of head and controller............................................................. 47
   2-5-2 Power connection and earth (Grounding)................................................... 51
   2-5-3 Restore of circuit protector......................................................................... 53
   2-5-4 Connection of PC (Laser marker NAVI smart)........................................... 54
2-6 Construction of System............................................................................... 56

3 Operation Method…………………………………………………… 57

ME-LPRF-SM-11                                                                     13

---

## หน้า 14

3-1 Type of Operations....................................................................................... 58
3-2 Start-up & Termination................................................................................ 59
   3-2-1 Start-up procedure..................................................................................... 59
   3-2-2 Termination procedure................................................................................ 60
   3-2-3 Operation of controller display panel.......................................................... 61
3-3 Operation by PC Configuration Software.................................................... 63
   3-3-1 Operation procedure.................................................................................. 63
   3-3-2 Screen types.............................................................................................. 65
   3-3-3 How to establish online connection............................................................ 67
   3-3-4 How to disconnect online connection......................................................... 69
   3-3-5 User selection and password settings....................................................... 70
   3-3-6 Test marking and RUN mode..................................................................... 73
3-4 Operation by External Devices.................................................................... 75
   3-4-1 Operation method using external control device........................................ 75
   3-4-2 Operation procedure with external control................................................. 76
   3-4-3 General settings before external control.................................................... 77
   3-4-4 Remote mode settings............................................................................... 80

 4 External Control Using I/O…………………………………………… 81
4-1 I/O Interface Specification............................................................................ 82
4-2 Signals and Details of I/O Terminal Block.................................................... 83
4-3 Signals and Details of I/O Connector........................................................... 91
4-4 I/O Rating/Circuit......................................................................................... 98
   4-4-1 Input rating and input circuit....................................................................... 98
   4-4-2 Output rating and output circuit.................................................................. 99
   4-4-3 Interlock terminal rating and I/O circuit...................................................... 100
4-5 Connecting I/O Terminal Block................................................................... 101
   4-5-1 Factory default wiring................................................................................ 101
   4-5-2 Connecting common terminals................................................................. 102
   4-5-3 Sensor connection example...................................................................... 103
   4-5-4 Connection example of interlock terminals and laser stop terminals........ 103
   4-5-5 Checking the I/O terminal status............................................................... 104
4-6 Basic Control Timing Chart........................................................................ 106
   4-6-1 Flow from startup to marking..................................................................... 106
   4-6-2 Shutter open/close.................................................................................... 108
   4-6-3 Marking trigger input (to static object): Single trigger................................ 109
   4-6-4 Marking trigger input: Continuous trigger...................................................110
   4-6-5 On-the-fly marking: Single trigger..............................................................112
   4-6-6 On-the-fly marking: Marking at regular intervals........................................113
   4-6-7 On-the-fly marking: Multiple triggers..........................................................114
   4-6-8 On-the-fly marking: 2 sensors input...........................................................115
   4-6-9 Target detection input.................................................................................116


14                                                  ME-LPRF-SM-11

---

## หน้า 15

4-6-10 Guide laser radiation input........................................................................117
4-6-11 Select file..................................................................................................118
4-6-12 Time/date hold input and date gap output................................................119
4-6-13 Counter end output...................................................................................119
4-6-14 Count-up/count-down value correction.................................................... 120
4-6-15 Counter reset input.................................................................................. 121
4-6-16 Registered characters/external offset marking........................................ 122
4-6-17 Laser stop input....................................................................................... 123
4-6-18 Remote interlock input............................................................................. 124
4-6-19 Interlock input.......................................................................................... 125

5 External Control by Communication Commands……………… 126
5-1 Communication Interfaces.......................................................................... 127
5-2 RS-232C..................................................................................................... 128
   5-2-1 Interface specifications and connection.................................................... 128
   5-2-2 Communication settings (for command control)........................................ 130
5-3 Ethernet.......................................................................................................131
   5-3-1 Port specifications and connection............................................................131
   5-3-2 Communication settings............................................................................ 132
   5-3-3 Connecting to external control devices and its setting sample................. 133
5-4 Checking the communication commands................................................... 134

6 Link Control with External Devices……………………………… 135
6-1 Link Control with Image Checker................................................................ 136
   6-1-1 Example of image checker linkage system................................................ 137
   6-1-2 Operation flow........................................................................................... 138
   6-1-3 Connection................................................................................................ 139
   6-1-4 Set the laser marker communication settings............................................ 140
   6-1-5 Set the laser marker overall file conditions.................................................141
   6-1-6 Image checker setting............................................................................... 144
   6-1-7 Code reader (LP-ABR) setting................................................................... 148
   6-1-8 Code reader (DataMan) setting................................................................. 148
   6-1-9 Timing chart............................................................................................... 149
6-2 Link Control with Code Reader................................................................... 153
   6-2-1 Example of code reader linkage system.................................................... 153
   6-2-2 Operation flow........................................................................................... 154
   6-2-3 Connection................................................................................................ 156
   6-2-4 Preparation of readout code...................................................................... 157
   6-2-5 Setting of code reader linkage functions................................................... 158

7 Maintenance………………………………………………………… 160
7-1 Maintenance Items.......................................................................................161


ME-LPRF-SM-11                                                                     15

---

## หน้า 16

7-2 Maintenance Details of Parts...................................................................... 162
   7-2-1 Protection glass of laser emission port...................................................... 162
   7-2-2 Replacement of the protection glass.......................................................... 163
   7-2-3 Cleaning of Head....................................................................................... 165
   7-2-4 Intake/exhaust vent.................................................................................... 165
   7-2-5 Air filter...................................................................................................... 166
   7-2-6 Air-cooling fan............................................................................................ 168
   7-2-7 Laser oscillator............................................................................................171
   7-2-8 Galvano scanner.........................................................................................174
   7-2-9 Internal shutter............................................................................................175
   7-2-10 Replacement of contactor for interlock......................................................176
   7-2-11 Replacement of battery inside the controller............................................ 180
   7-2-12 Replacement of cable.............................................................................. 183
7-3 Obtaining Backup Data............................................................................... 183
7-4 Serial Number Checking Method................................................................ 184
7-5 Disposal of Laser Marker............................................................................ 185
   7-5-1 Disposal of old equipment and batteries................................................... 185

 Troubleshooting………………………………………………………… 186
Troubleshooting................................................................................................. 187
Error Indication.................................................................................................. 201
   Alarm: E001 - E599............................................................................................. 201
   Warning: E600 - E799......................................................................................... 205

 Index…………………………………………………………………… 214


16                                                   ME-LPRF-SM-11

---

## หน้า 17

1 Product Overview


ME-LPRF-SM-11

---

## หน้า 18

1-1 Product Model
 FAYb Laser Marker LP-RF series have the following models.

Model           Marking field       Laser oscillator average output    Mode of laser operation
LP-RF200P       90mm x 90mm         20W                                Pulsed operation


  Model description
 LP-RF 200 P
q        w e

 q Represents the series name. “LP-RF series” refers to the fiber laser marker.
 w Represents the laser output class and the marking field size. The following types are applicable to this product.
200:   Laser oscillator average output 20W, Marking field 90mm x 90mm
 e Represents the mode of laser operation.
P:     Pulsed operation


18                                                      ME-LPRF-SM-11

---

## หน้า 19

1-2 Product Configuration

1-2-1 Basic composition
This product is a laser marker designed to mark and process the object by radiating a laser beam to the target.
The laser marker LP-RF series consists of the following units mainly.


   w
   e
q


r


t

u

y

 No.    Name                                          Description

  q     Head                                          It is the unit that radiates the laser beam. The optical parts and the
scanner are loaded inside.

  w     Controller                                    It is the unit that generates the marking data. The laser oscillator,
the main power supply and connection interface with external
devices are loaded.

  e     Unit power cable (Attached accessory)         Cables to connect the head and controller.
Signal cable (Attached accessory)             The fiber cable delivers the laser beam from controller to head.
Fiber cable


  r     AC power cable (Optional item)                Cable to supply AC power to the controller. Purchase the specified
optional cable or a cable with the enough rating capacity to fulfil the
power voltage specification of this product, which is compliant with
the standards in the country or region where it is used.

  t     USB cable (Attached accessory)                Cable to connect the laser marker with a PC.

  y     Commercially available PC                     Install the attached software “Laser Marker Smart Utility” onto a PC
(Not included in this product.)               and set the marking data of the laser marker. You can use this PC
   as a monitor during the operation.

  u     Laser Marker Smart Utility software           This software contains the laser marker configuration software
(Attached CD-ROM)                             “Laser Marker NAVI smart” and PDF manual data.


ME-LPRF-SM-11                                                            19

---

## หน้า 20

1-2-2 Optional items
 The following optional items (sold separately) are available for this product.
 For purchasing and the detailed information, please contact our sales office.

  Option items                                                                                                     Model
  AC power cable: Rating 250V, PSE standards, compatible (Japan)                                                   LP-ACA11
  AC power cable: Rating 250V, VDE standards compatible (Europe)                                                   LP-ACA12
  Protection glass of laser emission port (for replacement)                                                        LP-ACV60
  Air filters (for replacement): 10 filters for bottom and 10 filters for upper side of controller are included.   LP-AFT80
  Cooling fans for controller (for replacement): 2 fans are included.                                              LP-AFA20
  Unit power cable (for replacement)                                                                               LP-ACP20-5
  Signal cable (for replacement)                                                                                   LP-ACS10-5
  Set of connector cover and gasket (for replacement)                                                              LP-ACC10
  Contactor unit for Interlock (for replacement)                                                                   LP-AEC10
  Battery inside the controller (for replacement)                                                                  AFPX-BATT
(CR-2450)
  Industrial network unit for EtherNet/IP                                                                          LP-ANW10
  Industrial network unit for PROFINET                                                                             LP-ANW11

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 •• For the recommended AC power cable for China (rating 250V, CCC standards compatible cable), please contact our
sales office.


20                                                          ME-LPRF-SM-11

---

## หน้า 21

1-2-3 Package
Before using this product, be sure to check the packed objects as shown below.
This product is delivered in a set of head unit and controller unit packed in one box.
If you find any missing item in the package, please contact the dealer you purchased it or our sales office.

ワㄐㄕㄊ㄄ㄆ
•• Be sure to store the packing material. Since this product is precision machinery, reuse the packing materials to prevent
   damages during transportation.


□□Laser marker (head and controller)
   1 unit


□□System key             □□Unit power cable       □□Signal cable           □□I/O connector


qty.: 2                  qty.: 1                  qty.: 1                   qty.: 1


□□I/O terminal block     □□Short bar              □□USB cable (2m)         □□Ferrite core              □□Laser Marker Smart
   (Attached to the I/O                                                          Utility (CD-ROM) *2
   terminal block partly)
qty.: 1                 qty.: 7                 qty.: 1                   qty.: 3 *1                  qty.: 1


□□Laser Safety Guide     □□ Leaflet of carrying     □□General information □□Copy of Declaration □□Warning/explanation
caution and information   for safety (For EU    of Incorporation      label


about PDF manuals         users)


qty.: 1                  qty.: 1                  qty.: 1                 qty.: 1 set                 qty.: 1


ME-LPRF-SM-11                                                          21

---

## หน้า 22

□□Air filters for          □□Connector covers      □□Scanner unit cover          □□M5 screw (for         □□Protection cap of
   replacement                of unit power cable                                   scanner unit cover)     laser emission port
and signal cable (for                                                         *3
head)
  2 filters for upper side,  1 set for each cable          qty.: 1                        qty.: 4                 qty.: 1
2 filters for bottom


 *1: Attach one ferrite core to the LAN cable (Ethernet), one to the I/O lines from the I/O terminal, and one to the I/O lines
from the I/O connector.
 *2: This CD-ROM contains the following data:

PC configuration software
Laser Marker NAVI smart
Logo Data Editing Software
ExportVec
Font Maker

PDF manuals                                               Language
Laser Safety Guide                                        English / Simplified Chinese / Japanese
Setup/Maintenance Guide
Serial Communication Command Guide
Serial Communication Command Guide: LP-400/V
compatible mode
Laser Marker NAVI smart Operation Manual
Logo Data Editing Software Operation Manual
ExportVec Operation Manual
Font Maker Operation Manual

Font files (.FON)
Fonts for alphanumeric characters and symbols: ORG1, ORG2, ORG3, ORG4, ORG5, ORG1S,
ORG2S, ORG3S, OCR1, ORG3-L1, DINLIKE1-L1
Fonts for Japanese characters: JIS1 (JIS level 1), JIS2 (JIS level 2)
Fonts for Simplified Chinese characters: GB2312-1 (GB 2312 level 1), GB2312-2 (GB 2312 level 2)
User-defined font: USER1
2D code pattern font: 2DCODE

 *3: Attached to the head with shipment. Remove this cap before operation. Do not screw the lens when removing the cap.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 •• The AC power cable is not included in this product. Purchase the specified optional cable or a cable with the enough
rating capacity to fulfil the power voltage specification of this product, which is compliant with the standards in the
country or region where it is used. For the optional cables, refer to “1-4-4 Cables” (P.28).


22                                                         ME-LPRF-SM-11

---

## หน้า 23

1-3 Specification
   Model
Item
   LP-RF200P
   Laser type                   Yb: Fiber laser, Wavelength: 1064nm, Class 4 laser
  Oscillator average
   20W
   output
Marking laser      Average output for
   17W ( ± 5%)
   marking *1
   Mode of operation                                   Pulsed oscillation
   Pulse cycle                                       5μs to 50μs
   Red semiconductor, Wavelength: 655nm, Class 2 laser
 Guide laser, laser pointer
   Max. output: 1mW or less
   Scanning system                                           Galvano scanning method
   Beam stop                                       1 Shutter is equipped inside of head
   Marking field (X, Y) *2                                          90mm × 90mm
   Work distance *2                                                   190mm
   Work piece status                                    Stationary object, Moving object
   Scan speed *3, *4                                           Max 12000 mm/sec.
  Applicable line speed *3                                         Max 240 m/min.
  No. of registerable files                                           10,000 files
 No. of marking data pieces
   2000 objects/file
(No. of registerable objects)
   West-European alphabet (A to Z, a to z, Latin-1 characters), numeric, symbol,
   user defined characters (up to 50 characters can be set)
   Character
   Japanese characters: Katakana, Hiragana, Kanji (JIS level-1 and level-2)
   Simplified Chinese characters: GB 2312 level-1 and level-2
   TrueType       TrueType fonts stored in the PC with Laser Marker NAVI smart installed *5
   CODE39, CODE93, CODE128 (GS1-128), ITF, NW-7, EAN/UPC/JAN
Marking data               Bar code                  GS1 DataBar Limited, GS1 DataBar Stacked,
   GS1 DataBar Limited CC-A, GS1 DataBar Stacked CC-A
   QR code, Micro QR code, iQR code,
   2D code
   Data Matrix, GS1 Data Matrix, PDF417
   Graphic file *6                       VEC, DXF, HPGL, BMP, JPEG, AI, EPS
   Point and shapes                             Point radiation, line, circle, arc
Character height/width *3
   0.1mm to 90mm
   (0.001mm unit)
 Character arrangement                                Straight line, Arc, Proportional, Justify
   I/O port                             I/O terminal block (40-pins), I/O connector (40-pins)
Communication interface                       EIA-RS-232C, Ethernet, EtherNet/IP *7, PROFINET *7
   Attached software              Laser Marker NAVI smart, Logo Data Editing Software, ExportVec, Font Maker
   Windows® 10 Pro 32bit, 64bit /
   Supported OS *8
   Windows® 8.1 Pro 32bit, 64bit
Laser marker NAVI smart connection
   USB, Ethernet
method
 Laser marker NAVI smart display
   English, German, Simplified Chinese, Traditional Chinese, Japanese, Korean
language
  Required time for system startup                                   Approx. 10 seconds


ME-LPRF-SM-11                                                        23

---

## หน้า 24

Model
   Item
   LP-RF200P
Required time for laser pumping                                  Approx. 7 seconds
   180V to 264V AC (including ±10% voltage fluctuations)
   Power voltage
   Frequency: 50/60Hz *9
   Power consumption
   370VA or less (2.1A or less)
  (Consumption current) *10
   Grounding method                             Direct earth for both the head and the controller

  Cooling                  Head                                     Natural air-cooling
  method                 Controller                                 Forced air-cooling
Operating ambient temperature *11,                With laser power setting 46 or more : 0°C to +36°C
   *12                                With laser power setting less than 46 : 0°C to +40°C
Ambient temperature for storage *11                                  -10°C to +60°C
  Operating ambient humidity *11                                      35 to 85%RH
   Protection degree of head *13                                           IP64
   Overvoltage category                                                 Ⅱ
   Pollution degree                                                 2
   Use location                             Indoor; at an altitude of 1000 m or below
   Fiber cable length                              3.0 ± 0.2 m, Minimum bent radius 80 mm

Installation               Head                                      In all directions
 direction               Controller                                     Vertically
   Head                                       Approx. 8.0kg
  Weight
   Controller                                   Approx. 37kg
   Type                        Manganese dioxide lithium primary battery
  Battery                 Model                                   AFPX-BATT (CR-2450)
(mounted in
  product)               Quantity                                           1
   Weight                                       Approx. 7.0g


 *1: Average output power from the laser marker at delivery time with the maximum laser power setting.
 *2: There is approx. +/-0.5mm deviation per product.
 *3: The value shown here is the configuration range that can be input. The setting values that can keep the quality of
marking or processing vary depending on the setting details and the target materials.
 *4: Depending on the setting data, the available scan speed might be limited.
 *5: Some of the languages or character types are not supported by this laser marker. Characters written from right to left
such as Arabic or Hebrew, characters based on ligature such as Indian languages cannot be input.
 *6: VEC is a graphic file format dedicated for the laser marker. To use AI or EPS files, convert them to VEC format with the
attached software “ExportVEC”.
 *7: Available when the optional network unit is installed to the controller.
 *8: OS versions of which Microsoft has ended support are excluded.
 *9: The frequency switches automatically.
 *10: The typical value of the inrush current at startup is as follows: (Duration time is 10ms or less.)
At 220V AC: 64A
 *11: Common to the controller and the head. No condensation or freezing shall be allowed. If there is a gap between the
stored temperature and operating temperature, make sure to have the product get used to the operating ambient
temperature gradually prior to use to prevent the dew condensation.
 *12: If the laser power is corrected in system offset or other detailed settings, the allowed temperature is defined with the
corrected value.
 *13: The controller is non-compliant with the ingress protection rating. The ingress protection characteristics of the head
are ensured only when the fiber unit, laser emission protection glass, cables and connector covers are installed
properly.


24                                                       ME-LPRF-SM-11

---

## หน้า 25

1-4 Outer Dimensional Drawing

1-4-1 Head
Unit: mm
260                         (392)                        (45)

(1)


   0
  00
 R10
R1


   (148)
170


   (50)
   0
r                                                     R8             1)
   (ȭ7)                  (19)


   y
t
   q


w
 (1)       135        (1)

   e
   152              20
   40 40 40 40
   62.2
40 40
   37


o                                     i
 u         60       60


 No.    Description

  q     Work distance: 190 mm

  w     Center of marking field

  e     Marking field (X, Y): 90 mm x 90 mm

  r     Laser pointer emission port: φ26 mm (Aperture diameter: φ20 mm)

  t     Laser emission port (Projecting part): φ100 mm

  y     Laser emission port height: (20) mm
+0.1
  u     Head positioning pin hole: φ4 0 , depth 5
+0.1
  i     Head positioning pin hole: Elongated hole φ4 0 x 5, depth 5

  o     Head fixing screw hole (10 holes*): M6 screw, depth 6
*: Fix the head with 6 or more screws at the installation.

  1)    Screw for frame ground: M4 screw, depth 5


  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
•• For details on the head installation, refer to “2-3-2 Installation method” (P.38).


ME-LPRF-SM-11                                                     25

---

## หน้า 26

1-4-2 Fiber Unit
 When the fiber unit is detached from the head
 Unit: mm

31                                     (397)


83.5

   94
   0
69                                                                                      R8


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 •• For the detaching of the fiber unit, refer to “2-3-5 Detaching / attaching the fiber unit” (P.42).


26                                                         ME-LPRF-SM-11

---

## หน้า 27

1-4-3 Controller
Unit: mm


q


 No.   Description

  q    Controller fixing screw hole (4 holes): M5 screw, depth 10


ME-LPRF-SM-11   27

---

## หน้า 28

1-4-4 Cables
  Unit power cable
 Unit: mm
 Minimum bent radius 100mm

ȭ


ȭ
  Signal cable
 Unit: mm
 Minimum bent radius 100mm
ȭ


  AC power cable: Optional item on request
 The AC power cable is not included in this product. Purchase the specified optional cable or a cable with the enough rating
 capacity to fulfil the power voltage specification of this product, which is compliant with the standards in the country or
 region where it is used.
 q Rating 250V, PSE standards compatible cable (Japan): LP-ACA11
 w Rating 250V, VDE standards compatible cable (Europe): LP-ACA12
 Unit: mm
 LP-ACA11: Minimum bent radius 70mm
 LP-ACA12: Minimum bent radius 50mm


q LP-ACA11                                     w LP-ACA12
NEMA L6-15P                                   CEE Public 7-7


ワㄐㄕㄊ㄄ㄆ
  •• Be sure to connect the ground pin of the AC power cable to earth permanently.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  •• For the recommended AC power cable for China (rating 250V, CCC standards compatible cable), please contact our
sales office.


28                                                      ME-LPRF-SM-11

---

## หน้า 29

1-5 Name of Each Component

1-5-1 Head
1

   2
10                     3


4

   8                 9
7 5, 6


 1.   Laser radiation indicator


      The display that shows the status of laser radiation and the laser marker.
       Laser marker status                                                              Head LED status
       Being in laser emitting                                                          Orange lighted-up
       Laser pumping is completed and internal shutter opened                           Green lighted-up
       Laser pumping is completed and internal shutter closed                           White lighted-up
       Laser pumping is in progress (uncompleted) and internal shutter opened           Green flashing
       Laser pumping is in progress (uncompleted) and internal shutter closed           White flashing
       Laser in non-pumped state                                                        Lights-out


                                           •• If the laser emission indicator is placed out of the sight of operators, place
        WARNING                               the external indicator light or warning lamp on the immediately apparent
                                              place on the system.


 2.   Signal connector: SIGNAL
      This is the terminal for communicating between head and controller.
      Connect the attached signal cable.

            ワㄐㄕㄊ㄄ㄆ
      • To ensure the ingress protection (IP64) of the head, install the attached connector cover to the cable. Refer to
        “Installing connector cover to cable” (P.48).


 3.   Power connector: POWER
      This is the connector for supplying the power to the head.
      Connect the attached unit power cable.

            ワㄐㄕㄊ㄄ㄆ
      • To ensure the ingress protection (IP64) of the head, install the attached connector cover to the cable. Refer to
        “Installing connector cover to cable” (P.48).


                                                         ME-LPRF-SM-11                                                         29

---

## หน้า 30

4.   Frame ground terminal: F.G.
       This is the terminal for ground. Ground this terminal to the earth permanently.


  5.   Laser emission port
       The emission port of the marking laser and the guide laser.


  6.   Protection glass of laser emission port
       This glass protects laser emission port from dirt or damage.
       Attach this glass always. Remove the plastic cap on this glass before operation.


  7.   Laser pointer emission port
       From this port the red laser pointer radiates in oblique direction when using the work distance indication of the guide
       laser. Refer to “2-3-4 Marking position check” (P.41).
       To use the guide laser, do not seal the laser pointer emission port at the installation.


  8.   Fiber unit
       Connection part for the laser transmission from the controller to the head.
       The fiber unit can be detached from the head. Refer to “2-3-5 Detaching / attaching the fiber unit” (P.42).


  9.   Fiber cable
       Laser transmission cable from the controller to the head. This cable cannot be detached from the fiber unit.


  10. Heat sink
       Fin for promoting heat radiation.


30                                                       ME-LPRF-SM-11

---

## หน้า 31

1-5-2 Controller
 Front


4

2

4

   6
1


5                                 3

 1.   Key switch: POWER
      The main power switch for the laser marker.
      Turn ON ( | ) the key switch to start-up the system, and turn OFF ( ○ ) to shutdown the
      system.
      Only when the key switch is turned OFF (in O position), the key can be pulled out.
      When the laser marker is not in use, the key should be in safekeeping by a laser safety
      manager.
      In case of turning ON the power supply after turning OFF, leave the interval five seconds or more between ON and
      OFF.
      Do not turn off the power supply while the system starts (while “PLEASE WAIT” is displayed on the panel).


 2.   Controller display panel
      The indicator that shows the status of the laser marker. Refer to “3-2-3 Operation of controller display panel” (P.61).

       Laser marker status and backlight color
       Normal operation: White                                      Alarm generation: Red
                                                                    Warning generation: Pink
                                                                                       (5525                

   (
w      ,17(5/2&.LVRSHQ


i


No.    Description of the icons

q     During the normal operation, the file number is displayed.

w     When any alarm or warning has been occurred, the error information is displayed.

e     Indicates laser pumping is on.

r     Indicates laser marker is in remote control mode (operated by an external device).

t     Tapping this icon moves to the model information (system clock information, model name, serial number,
   and etc.) display.

y     Tapping this icon moves to the panel language selection.


ME-LPRF-SM-11                                                          31

---

## หน้า 32

3.   USB port B: USB
       This is the connector for connecting the attached USB cable. When you connect the laser marker configuration
       software Laser Marker NAVI smart online, connect this cable to the PC.


  4.   Controller air-cooling inlet
       The air inlet for cooling the controller. Fans and filters are installed.


  5.   Circuit protector
       In case of the overcurrent, the circuit protector inside of the cover turns OFF to cutoff current. Refer to “2-5-3 Restore
       of circuit protector” (P.53).


  6.   Handle
       Hold here and support a bottom face with the other hand to lift the controller. Carry the controller unit with two
       persons. Refer to “2-4 Controller Installation” (P.46).


  Rear

10


1
   9
2
3

4
5

6

7                                             8

  1.   Power connector: POWER
       This is the connector for supplying the power to the head. Connect the attached unit power cable.


  2.   Ethernet port: LAN
       The port to connect the LAN cable used when connecting the laser marker with the following devices via Ethernet.
       • The PC with Laser Marker NAVI smart installed
       • PLC or PC for control: Externally controls the laser marker using the communication commands.
       • Specified external devices: Interfaces the specified external device (image reading equipment) with the laser marker
         and controls their operations.

  3.   RS-232C port: RS-232C
       The port to connect the following external devices for the communication control of the laser marker using RS-232C.
       • PLC or PC for control: Externally controls the laser marker using the communication commands.
       • Code reader compatible with the RS-232C communication: Modifies the data to mark by the laser marker according
         to the code details read by the code reader.

  4.   Signal connector: SIGNAL
       This is the terminal for communicating between head and controller. Connect the attached signal cable.


32                                                           ME-LPRF-SM-11

---

## หน้า 33

5.   Ports for industrial network: EtherNet/IP or PROFINET
      Available when the optional network unit (EtherNet/IP unit or PROFINET unit) is installed to the controller.
      Communication port (2-port switch) to control the laser marker by the industrial network with the control device such
      as a PLC.
      Connect a LAN cable.
      For details, refer to “EtherNet/IP Communication Guide” or “PROFINET Communication Guide”.
      If you do not install the network unit, there is no port here.

 6.   I/O terminal block: TERMINAL
      The terminal block to connect I/O signals used for the external control of the laser marker.
      Connect the attached terminal block.
      Refer to “4-2 Signals and Details of I/O Terminal Block” (P.83) for details.

 7.   I/O connector: I/O
      The connector to connect I/O signals used for the external control of the laser marker.
      For details, refer to “4-3 Signals and Details of I/O Connector” (P.91).

 8.   AC power supply terminal: AC INPUT
      Terminal for connecting AC power supply.
      Power voltage: 180V to 264V AC (including +/-10% voltage fluctuations), 50/60Hz (Frequency switches automatically.)
      Purchase the specified optional cable or a cable with the enough rating capacity to fulfil the power voltage
      specification of this product, which is compliant with the standards in the country or region where it is used.
      For the optional cables, refer to “1-4-4 Cables” (P.28).

             ワㄐㄕㄊ㄄ㄆ
      • Be sure to connect the ground pin of the AC power cable to earth permanently. Refer to “2-5-2 Power connection
        and earth (Grounding)” (P.51).

 9.   Controller air-cooling outlet
      The air-cooling outlet for the controller.

 10. Fiber cable
     Laser transmission cable from the controller to the head. This cable cannot be detached from the controller.


                                                        ME-LPRF-SM-11                                                         33

---

## หน้า 34

2 Laser Marker Installation


ME-LPRF-SM-11

---

## หน้า 35

2-1 Installation Environment
Use this product in the following environments.

  Item                                        Installation environment conditions
  Operating ambient temperature *1            With laser power setting 46 or more: 0°C to +36°C
With laser power setting less than 46: 0°C to +40°C
  Operating ambient humidity *1               35 to 85%RH
  Ambient temperature for storage *1          -10°C to +60°C *2
  Protection degree                           Head: IP64 *3


Controller: non-compliant


  Pollution degree                            2
  Use location                                Indoor; at an altitude of 1000 m or below

*1 : No condensation or freezing shall be allowed.
*2 : If there is a gap between the stored temperature and operating temperature, make sure to have the product get used
to the operating ambient temperature gradually prior to use to prevent the dew condensation.
*3 : The controller is non-compliant with the ingress protection rating. The ingress protection characteristics of the head
are ensured only when the fiber unit, laser emission protection glass, cables and connector covers are installed properly.


ワㄐㄕㄊ㄄ㄆ
 • Do not install this product at a place where vibrations and shocks can be directly transmitted to it.
 • Do not use this product at a place with oil mist.
 • In case this product is used in a dusty environment, take measures to prevent dust from entering into the controller, e.g.
   using a storage housing.
 • When installing the controller in the storage housing, use a housing equipped with panel cooler or heat exchanger to
   maintain the air-cooling performance of the laser marker according to the ambient temperature.


Panel cooler or
heat exchanger


Storage housing image

 • Remove any dust and smoke from the laser emission port and laser beam path using a dust collector. For effective dust
   collection, put the suction port of the dust collector near the lasing position. In an environment where dust and smoke
   that tend to attach to the lens surface, it is recommended to create a compression air flow to ensure thorough dust collection.
Laser marker head


   Dust collector
A
 B


A
B
 C
   D


Compressed
   A
   B
   C


air


ME-LPRF-SM-11                                                           35

---

## หน้า 36

2-2 Installation Space
 To keep the appropriate air cooling performance, provide space around the laser marker as shown in the following figure.

ワㄐㄕㄊ㄄ㄆ
 • To maintain the air-cooling performance of the laser marker, install both the head and controller in a well-ventilated
   place.
 • Installing near a heating element could cause the ambient temperature exceeding the specification range, which may
   cause malfunction of the product.

  Head

50mm
   470mm


50mm

   50mm
50mm


  Controller


   w
50mm


q                                                w

300mm

   q
50mm


   50mm
150mm                                                    q Intake
   w Exhaust


36                                                     ME-LPRF-SM-11

---

## หน้า 37

2-3 Head Installation
   • Make sure that the power is turned OFF at installing. Failure to do so may
   cause electrical shock.
WARNING                            • Install the product so that the laser beam path does not cross the eye height.
   • The laser beam path shall be enclosed with protective enclosure and make
   sure it is not exposed with direct light or reflected light.


 Carrying head part
 • To carry this product, wear the non-slip gloves. Hold the product with both hands. Do not hold the fiber unit, cables or
   connectors at carrying.
 • Do not touch the laser emission port on the bottom of the head. It may affect the marking quality badly.
 • Carry this product as shown in the figure below.


Laser pointer
emission port
   Fiber unit


Laser emission port


2-3-1 Installation direction
The head can be installed to up, down, left, and right directions.


ワㄐㄕㄊ㄄ㄆ
 • Do not move the head unit during the operation.
 • When the product is installed with the laser emission port facing upward, dust generated during marking may attach to
   the laser emission port, impairing marking quality and damage the product. Clean the laser emission port periodically
   according to the head installation conditions and environment.
 • Be sure to fix the bottom surface (the laser emission port side).


ME-LPRF-SM-11                                                        37

---

## หน้า 38

2-3-2 Installation method
  • Install the head on a plate with a thickness of 10 mm to 20 mm which is made of aluminum or other material with
radiation performance equivalent to that of aluminum.
  • For details of installation, refer to “1-4-1 Head” (P.25).
  • Fix the head in the following conditions.

Fixing surface                      Fixing screw                              Screw insert length    Tightening torque

Bottom (laser emission port side)   M6 screws at more than 6 positions        5 mm to 6 mm           3.0 N·m or below


Laser marker head                 A
 Installation plate               B


M6 screw

A : Screw insert length 5mm to 6mm
B : Plate thickness + washer thickness

M6 screw


 Fix the bottom of head with M6 screw more than 6 positions as shown below.

 Example of fixing positions


Bottom of the head


ワㄐㄕㄊ㄄ㄆ
  • Do not insert any screw of length exceeding the specification. Otherwise, the failure of
the product may be caused.
  • A protection cap is installed on the laser emission port with shipment. Remove this
cap before operation. Do not screw the lens when removing the cap.


38                                                        ME-LPRF-SM-11

---

## หน้า 39

 Example of head installation base
  Example dimensions of plate for the head are indicated below.
  For plate thickness of 10 mm
  Unit: mm
   80         80
䃥20         62.2                 q           10   4                  60      60

   w
40
37
40


䃥104
   On the laser marker side

 No.    Description

 q      Head fixing hole (6 holes): φ6.6 through hole
You can change the position of the fixing holes depending on the intended screw holes to use.

 w      Head positioning pin (2 pins): φ4 SUS pin, height 4


  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• As the laser pointer radiate the beam toward the center of the marking field, it is recommended to process the laser
  emission port and laser pointer emission port hole to link them so that the laser pointer's beam path does not interfere
  with the plate.


ME-LPRF-SM-11                                                         39

---

## หน้า 40

2-3-3 Marking field and marking center position
   Specified point                                    LP-RF200P

   q Laser emission port diameter                     φ87 mm

   w Work distance                                    190 mm

   e Marking field (X, Y)                             90 mm × 90 mm

   r Distance to center of marking field              67.5 mm

   t Distance to center of marking field              152 mm


   t
q
r                  w


e

ワㄐㄕㄊ㄄ㄆ
  • Do not place anything in the area between the laser emission port and work pieces during the lasing operation.
  • Use anti-reflection material (ex. black paint for metal) for an external shutter or a protective enclosure in a path of laser
beam. It may cause a failure of the components inside the laser marker head.
  • If any other devices such as a sensor or a camera are installed near the laser marker, make sure that these devices are
installed in the place where laser beam and its reflected beam do not damage to them.


40                                                        ME-LPRF-SM-11

---

## หน้า 41

2-3-4 Marking position check
 Guide laser
The marking position can be checked visually by using the guide function with the red laser beam.

ワㄐㄕㄊ㄄ㄆ
• Use the guide display function only as the guideline. For the appropriate marking quality, fine adjust the work distance
  and setting position of the target object by checking the actual marking results.
• When the fiber unit is removed and re-installed, the lasing position might be misaligned relative to the guide laser
  radiation position. To align the lasing position, calibrate the marking field with following the procedures described in the
  “Laser Marker NAVI smart Operation Manual”.

With the guide laser the following data can be indicated.

  Display mode              Description
  Marking field             Displays the marking field frame and center lines with the guide laser.
  Marking image             Displays the setting data in the file.
The object data with marking off setting is not displayed.
  Masked objects            Displays only the data set to Marking off and enabled guide indication.
  Work distance             The guide laser shows the rough indication of the work distance (distance from the head base to
the marking surface). The red point emitted in oblique and the red cross emitted perpendicularly
from the head are displayed. The distance where the laser point is closest to the center of the
cross represents the guide of the work distance.


Marking field indication               Marking image indication                     Work distance indication


Where the red point is closest to
the center of the cross is the rough
indication of the work distance.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For details of the guide display function, please refer to the “Laser Marker NAVI smart Operation Manual”.


ME-LPRF-SM-11                                                           41

---

## หน้า 42

2-3-5 Detaching / attaching the fiber unit
 The fiber unit of this product can be removed from the head at the installation temporarily.
 At the delivery state, the fiber unit is connected to the head.


Fiber unit


ワㄐㄕㄊ㄄ㄆ
 • The fiber cable cannot be removed from the controller side. Trying to disconnect the controller unit from the fiber cable
   forcibly may cause a failure.
 • It is recommended to connect the head and controller that have the identical serial numbers.
 • The ingress protection characteristics of the head are ensured only when the fiber unit is mounted properly. Read this
   chapter thoroughly for correct removal and installation.
 • When the fiber unit is removed and re-installed, the lasing position might be misaligned relative to the guide laser
   radiation position. To align the lasing position, calibrate the marking field with following the procedures described in the
   “Laser Marker NAVI smart Operation Manual”.


  Working conditions

   • Before the detaching or attaching the fiber unit, turn off the power supply and
WARNING                              disconnect the AC power cable. There is a risk of exposure to the laser beam
   or electrical shock.

 • Avoid oil mist, dust and dirt when removing or installing the fiber unit.

  Items to be prepared
 • Hexagon wrench (ball point, M5, L=150 mm)
 • Scanner unit protection cover (Attached accessory)
 • M5 screws (Attached accessories)
 • Clean plastic bag as a protection cover of the fiber unit
 • O-ring for fiber unit (Optional item)
 • Air duster for optics


42                                                        ME-LPRF-SM-11

---

## หน้า 43

 Procedure for fiber unit detaching

1.   Use a hexagon wrench to loose the 4 locking screws on the fiber unit. Handhold the fiber unit and remove it from the
     head.


      ワㄐㄕㄊ㄄ㄆ
• Do not remove the screws other than the specified ones. It may cause failure.
• Not to break the screw head, use the end-rounded tightening tool and insert it to the screw head as straight as possible.


2.   Attach a clean plastic bag to the fiber unit as a protection cover.


      ワㄐㄕㄊ㄄ㄆ
• Make sure that no foreign matter such as fingerprint or dust is attached to the lens of the fiber unit. It may cause
  decrease in laser marking quality or a failure.


3.   Install the scanner unit protection cover with 4 screws by using a hexagon
     wrench.
     Tightening torque: 0.7N·m to 1.3N·m


      ワㄐㄕㄊ㄄ㄆ
• Attach the protection cover always when the fiber unit is detached from the
  scanner unit.
• The protection cover is a temporary item and shows no water resistance.


Scanner unit protection cover


ME-LPRF-SM-11                                                      43

---

## หน้า 44

 Procedure for fiber unit attaching

 1.   Remove the scanner unit protection cover.
      Keep the scanner unit protection cover for the next use.


                                                                                              Scanner unit protection cover


 2.   Make sure that the O-ring is attached to the joint part
      of the fiber unit properly.


                                                                                                       O-ring


       ワㄐㄕㄊ㄄ㄆ
 • If there are signs of deterioration or damage in the O-ring, replace it. Replacement O-ring (Set of connector cover and
   gasket: LP-ACC10) is available on request. For purchasing it, contact our sales agency.


 3.   Make sure that the fiber cable is not twisted.
      If a plastic bag or other protection cover is attached to the fiber unit, remove it.

       ワㄐㄕㄊ㄄ㄆ
 • If the fiber cable is twisted, it may cause of a power decrease or a failure.


44                                                         ME-LPRF-SM-11

---

## หน้า 45

4.   Install the fiber unit to the head by using the
     positioning guide pin.


      ワㄐㄕㄊ㄄ㄆ
• Make sure that no foreign matter such as fingerprint,                                              Positioning guide pin
  dust, grease or oil is attached to the optical part of the
  fiber unit.
  If it is contaminated, blow dusts with an air duster for                                    Fiber unit
  optics.


5.   After the temporary fitting of the fiber unit by tightening loosely,
     evenly tighten the screws in a crisscross manner to the specified
     torque of 1.5 N·m.


      ワㄐㄕㄊ㄄ㄆ
• Use due caution when handling the fiber unit. Giving any shock may cause a failure.
• Not to break the screw head, use the end-rounded tightening tool and insert it to the screw head as straight as possible.
• If the O-ring is deformed by forcibly inserting the screws, the ingress protection characteristics of the head are not
  ensured. Proportionally tighten the screws with a specified torque using torque wrench or other tools.


6.   Confirm the lasing position. If there is a gap between the guide lasing position and the actual lasing position, calibrate
     the marking field.
     Refer to “Marking field calibration” of System settings in the “Laser Marker NAVI smart Operation Manual”.


                                                          ME-LPRF-SM-11                                                       45

---

## หน้า 46

2-4 Controller Installation
   • Make sure that the power is turned OFF at installing. Failure to do so may
   cause electrical shock.
   • Carry the controller unit with two persons. Lifting or carrying without
WARNING                                assistance may cause of injury.
   • To carry this product, wear the non-slip gloves and safety shoes.
   • In case it falls down, it may cause injury.


  Carrying the controller
 To carry the controller, hold the bottom of the unit with both hands.
 Do not hold the cables or connectors at carrying this product.


  Installation method
  • Install the controller vertically.
  • For details of installation, refer to “1-4-3 Controller” (P.27).
  • Fix the controller in the following conditions.

Fixing surface               Fixing screw                       Screw insert length       Tightening torque
Bottom                       M5 screws at 4 positions           5 mm to 10 mm             2.0 N·m or below


M5 screw


ワㄐㄕㄊ㄄ㄆ
  • Do not insert any screw of length exceeding the specification. Otherwise, the failure of the product may be caused.
  • Do not install the laser marker at a place where vibrations and shocks can be directly transmitted to it. In any
environment where effects of vibration are concerned, take measures against vibration on the product, e.g. fitting rubber
feet.
  • Do not install the controller laterally.


46                                                           ME-LPRF-SM-11

---

## หน้า 47

2-5 Connecting Laser Marker
   • Be sure to turn the power off before you conduct wiring or connection. Failure
   to do so may cause electrical shock.
WARNING                           • Be sure to connect the head and controller of the laser marker which have the
   same model number. Otherwise there is a risk of exposure to laser radiation
   or failure.


2-5-1 Connection of head and controller


ワㄐㄕㄊ㄄ㄆ
 • It is recommended to connect the head and controller that have the identical serial numbers.
 • For the connection of this product, use the dedicated cables attached to the product or the specified optional cables.
 • Insert the cable all the way in a straight line. Tilting and inserting the cable may cause a failure.
 • Be careful not to apply excess force to the cable or not to nip the cable at the installation.
 • Verify the minimum bend radius of each cable and install them without excess forces being applied.
 • To ensure the ingress protection (IP64) of the head, install the attached connector covers to the cables.


e

w


   q
e
   r


Rear of head                                                 Rear of controller

  No.      Cable and connector                            Connector

q    Signal cable                                   Signal connector: SIGNAL

w    Unit power cable                               Power connector: POWER

e    Connector cover                                Signal cable / Unit power cable (head side)

r    I/O terminal block                             I/O terminal block connector: TERMINAL

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Connect the following terminals of the I/O terminal block. If any of them is not connected, the laser radiation is disabled.
   When shipped, some of these terminals are connected with a shot bar. Refer to “4-5-1 Factory default wiring” (P.101).
LASER STOP IN (X10)                ―     OUT COM. 1 (X12)
LASER STOP IN (X11)                ―     OUT COM. 1 (X12)
INTERLOCK 1(+) (X16)               ―     INTERLOCK 1(-) (X17)
INTERLOCK 2(+) (X18)               ―     INTERLOCK 2(-) (X19)
REMOTE INTERLOCK (X20)             ―     OUT COM. 1 (X12)
IN COM. 1 (X2)                     ―     Power supply *1
OUT COM. 1 (Y2)                    ―     Power supply *1


*1 : Connect IN COM. 1 (X2) and OUT COM. 1 (Y2) respectively to the power supply for input and output. Refer to “4-5-2
Connecting common terminals” (P.102).


ME-LPRF-SM-11                                                         47

---

## หน้า 48

 Installing connector cover to cable
 To ensure the ingress protection (IP64) of the head, install the attached connector cover to the unit power cable and signal
 cable.

ワㄐㄕㄊ㄄ㄆ
 • If there are signs of deterioration or damage in the gaskets of the connector covers, replace them. Replacement
   connector covers and gasket (LP-ACC10) are available on request. For purchasing them, contact our sales agency.

 1.    Confirm that the all parts for the connector covers are in the package as shown below.


                              w                                                   w


                         q
                                                                                  q


                   Connector cover for unit power cable                   Connector cover for signal cable


         No.      Part name

          q       Upper cover

          w       Bottom cover


 2.    Pass the cable through the hole of the bottom cover and connect it to the head.
       Connect the unit power cable to POWER connector on the head and the signal cable to SIGNAL connector
       respectively.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • First, connect the unit power cable and set the connector cover to it. Then, connect the signal cable.

Rear of head                                               Rear of head

   Signal cable
Unit power cable


 3.    Tighten the fixing screw of the cable connector and then slide the bottom cover to the head.


48                                                        ME-LPRF-SM-11

---

## หน้า 49

4.   Tighten the two screws of the bottom cover with a M4 hex screw driver and fix the cover to the head.
     Tightening torque: 0.5N･m


5.   Insert the upper cover to the groove of the bottom cover and fit together tightly.


6.   Tighten the two screws of the upper cover with a M4 hex screw driver.
     Tightening torque: 0.5N･m


                                                         ME-LPRF-SM-11                                      49

---

## หน้า 50

 Disconnecting cable

 1.   Loosen the two screws of the upper cover with a M4 hex screw driver.


       ワㄐㄕㄊ㄄ㄆ
 • Do not remove the screws and washers from the case.


 2.   Remove the upper cover by sliding it backward.


 3.   Loosen the two screws of the bottom cover with a M4 hex screw driver.


       ワㄐㄕㄊ㄄ㄆ
 • Do not remove the screws and washers from the case.


 4.   Remove the bottom cover and loosen the fixing screw of the cable connector and disconnect the cable.


50                                                     ME-LPRF-SM-11

---

## หน้า 51

2-5-2 Power connection and earth (Grounding)
When connecting the power supply, be sure to perform earth (grounding) properly. Failure to do so may cause electrical
shock in case of a failure or electrical leakage. Further, it may cause malfunction of the device.
The power supply terminal and frame ground terminal are located as indicated below.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The AC power cable is not included in this product. Purchase the specified optional cable or a cable with the enough
   rating capacity to fulfil the power voltage specification of this product, which is compliant with the standards in the
   country or region where it is used. For the optional cables, refer to “1-4-4 Cables” (P.28).


   Rear of controller
Rear of head


   Power terminal
Frame ground terminal


   • Perform the connection of the Power Terminal with power-off state. Failure to
WARNING                            do so may cause electrical shock.


1.     Connect the frame ground terminal of the head to the grounding part.
                                                                                      Frame ground terminal


       Screw size: M4
       Tightening torque: 1.0N·m

                                                                                                                       Earth
        ワㄐㄕㄊ㄄ㄆ
 • Before connecting the power supply, connect the frame ground terminal permanently to the grounding part.
 • Install such that the controller housing and the head housing are at the same electric potential.


2.     Loosen two M3 screws of the cover of the power terminal and remove it.
                                                                                         Rear of controller


                                                                                                                     Screw


                                                                                                                   Cover


3.     Remove the resin cover on the terminal.
                                                                                                        Terminal


                                                                                          Resin cover


                                                        ME-LPRF-SM-11                                                          51

---

## หน้า 52

4.    Connect the three wires to the terminals.
       The signs of “L (black)”, “N (white)” and “PE (GND) (yellow/green)”
       show in the cables. Connect each cable to the appropriate terminal.
       Screw size: M4                                                                  L                             L
       Tightening torque: 1.2N·m                                                       N                             N
                                                                                       PE                            PE
        ワㄐㄕㄊ㄄ㄆ
  • For the AC power supply cable, use the specified optional AC power
    cable or a cable with the enough rating capacity to fulfil the power voltage
    specification of this product.
  • Please select a cable compliant with the standards in the country or region where it is used.


 5.    Attach the resin cover to the terminal.

                                                                                                          Terminal


                                                                                            Resin cover


 6.    Fix the AC power cable with the clamp.
       Screw size: M4 hex screw
       Tightening torque: 1.0N·m


 7.    Fix the cover with 2 screws.
       The AC power cable should be passed through the cable take-out hole.
       Screw size: M3
       Tightening torque: 0.5N·m


 8.    Make sure that the cables and connectors other than the power supply are connected and then connect the AC power
       cable to the AC power supply.


       Power voltage: 180V to 264V AC (including ±10% voltage fluctuations)

        ワㄐㄕㄊ㄄ㄆ

  • The earth terminal of the AC power cable must be permanently grounded.
  • Set each connecting cable away from the device that generates high voltage, power line, and large switching surge as
    far as possible. If there may be any noise effect on the power supply, use the noise cut-off transformer.


52                                                       ME-LPRF-SM-11

---

## หน้า 53

2-5-3 Restore of circuit protector
The circuit protector is mounted in the controller for the overcurrent protection.
In case of the overcurrent, it turns OFF to cutoff current.
To recover the power supply of the laser marker, turn ON the switch of the circuit protector with the following procedures.

1.   Remove causes of the overcurrent.


2.   Turn OFF the key switch of the controller, and disconnect the AC power cable.                                     ヱヰ
                                                                                                                         ヸ
                                                                                                                            ユン
                                                                                                          OFF


                                                                                                                                 ON


3.   Remove the front cover of the controller.
     Apply pressure to the tabs on the top of the cover and pull it open.

                                                                                                           Cover


                                                     Tab


                          Controller


4.   Turn on the switch of the circuit protector.


                                                                       Switch


                                 ON

                                        OFF

                                       Switch


               Side of circuit protector


5.   Attach the front cover of the controller.
     Insert the lower part of the cover to the controller and gently push the upper part until it clicks into place.


6.   Connect the AC power cable and turn on the key switch. Confirm the laser marker starts up normally.


                                                           ME-LPRF-SM-11                                                              53

---

## หน้า 54

2-5-4 Connection of PC (Laser marker NAVI smart)
 This product is set and operated with the PC with the PC configuration software “Laser Marker NAVI smart” installed and
 the laser marker connected.

  Installation of laser marker NAVI smart
  • Laser Marker NAVI smart is provided in the supplied CD-ROM “Laser Marker Smart Utility”.
  • Install the Laser Marker NAVI smart in the following environment. For details about installation, please refer to the “Laser
Marker NAVI smart Operation Manual”.

Item                         Installation requirements
OS *1                        Microsoft ® Windows® 10 Pro 32bit, 64bit
   Microsoft ® Windows® 8.1 Pro 32bit, 64bit
Free area on hard disk       512MB or more
CD-ROM drive *2              1 set or more
USB port                     USB 2.0
LAN *3                       10BASE-T or 100BASE-TX
Memory capacity              2GB or more
CPU                          Equivalent to or higher than Intel Core i3
Display resolution           1366 x 768 pixels or above
Display size                 10.6 inch or above
Others                       Pointing device such as a mouse, character input device such as a keyboard

*1 : OS versions of which Microsoft has ended support are excluded. The CPU type, memory capacity, hard-
   disk space, and display function required to operate each OS should be provided in accordance with the
   recommendation of Microsoft. Laser Marker NAVI smart can be installed in English, German, Simplified Chinese
   or Japanese. It is preferred that the OS language corresponds to the installation language. If the OS language is
   other than these supported languages, install Laser Marker NAVI smart in English.
*2 : To install “Laser Marker Smart Utility” on a PC without a CD-ROM drive, copy all CD-ROM data to the PC using
   external storage media such as a USB flash drive before installation.
*3 : Specifications to be observed for Ethernet connection.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • If PC goes into “Sleep” when the laser marker and PC are connected online, the online connection between them is
disabled.
If PC goes into sleep state in the REMOTE mode or RUN mode, the PC is disconnected but the operation state of the
laser marker (REMOTE mode or RUN mode state) are maintained.
  • To maintain the online connection, release the sleep setting of the PC.


54                                                        ME-LPRF-SM-11

---

## หน้า 55

 Connection type
With one of the following method you can connect a PC with Laser Marker NAVI smart installed and the laser marker.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• One PC can be connected with multiple laser markers. However, only one laser marker can be connected with Laser
  Marker NAVI smart online. In this case, switch the online connected model on the Laser Marker NAVI smart and perform
  setting and control for each laser marker. It is not allowed to set and control multiple laser markers simultaneously from
  one PC.
• For the procedure to connect the laser marker and Laser Marker NAVI smart online, refer to “3-3-3 How to establish
  online connection” (P.67).


q USB connection
Connect the attached USB cable to the USB port B on the
controller.
Multiple laser markers can be connected via a USB hub,
etc.

ワㄐㄕㄊ㄄ㄆ
• Do not disconnect the USB cable when the laser marker
  is connected online.


PC                         Front of controller


w Ethernet connection
Connect the LAN cable to the Ethernet port on the controller.
For details of specifications and connection of the Ethernet
port, refer to “5-3 Ethernet” (P.131).

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• For Ethernet online connection, connect the laser marker
  and PC via USB cable in advance and configure the
  laser marker communication settings. Refer to “Setting
  procedure for Ethernet online connection” (P.68).
• The Ethernet port can be connected with the following
  devices simultaneously via a HUB or a router.
   • PC configuration software                                           PC                           Rear of controller
   • External device for communication command control
(PLC and PC for control)
   • Specific image checker
• Connect the LAN cable to the port marked “LAN” on the rear of the controller. The other ports for the optional network
  unit (EtherNet/IP or PROFINET) cannot be used to operate Laser Marker NAVI smart.


ME-LPRF-SM-11                                                       55

---

## หน้า 56

2-6 Construction of System
 The following figure shows the construction sample of the system.
q
   r          1!

a

w                                                                    t


B
 C
  D


   A
   B
   C
   D
oi


   A
   B
   C
   D
uy


   A
   B
   C
   D
e


  No.      Description                                   Installation and control sample

q     Laser marker head                             -

w     Laser marker controller                       -

e     PC for laser marker setting/monitoring        -

r     Protective enclosure                          -

t     Laser protection shutter for work piece       Construct a control system which will separate (cut off) the laser beams
   gateway                                       or shut off the laser power when it is opened.

y     Emergency stop button                         Construct a control system for shutting off the laser power source when
   it is opened.
u     Safety switch

i     Door for the maintenance

o     Safety relay unit or safety PLC, etc.         Connect both INTERLOCK 1 (X16, X17) and INTERLOCK 2 (X18,
   X19) of the laser marker to the devices t to i using the relay output
   terminal of the safety relay unit or the safety PLC.
   Besides INTERLOCK terminals, it can also be connected to other I/O signals
   such as LASER STOP terminals with the devices t to i depending on
   the control specifications.

     1)    Laser radiation warning light                 To indicate the laser marker status, connect the output signals such
                                                         as ALARM OUT (Y15), LASER SUPPLY OUT (Y20) or LASING OUT
                                                         (No.40) to the light.


1!    Dust exhauster                                Place the intake vent of the exhauster as close as possible to the
   marking position of the work pieces.


ワㄐㄕㄊ㄄ㄆ
 • INTERLOCK terminals (X16, X17 and X18, X19) are connected to the operating coil of the internal contactor in the
   controller. Connect INTERLOCK (+) and INTERLOCK (-) in the I/O terminal with the non-voltage contact (dry contact)
   such as a relay or a switch. Do not connect with the voltage contact such as a transistor.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • When constructing a system compatible to ISO11553-1/ISO13849-1, construct the redundant interlock system by using
   both INTERLOCK 1 (X16, X17) and INTERLOCK 2 (X18, X19) connected to safety PLC or safety relay unit to shut off the
   laser power supply in accordance with the standards.


56                                                             ME-LPRF-SM-11

---

## หน้า 57

3 Operation Method


ME-LPRF-SM-11

---

## หน้า 58

3-1 Type of Operations
 The laser marker can be controlled by the following method:

  Control by the PC configuration software “Laser Marker NAVI smart”

 Establish an online connection of the laser marker and Laser Marker NAVI smart (PC). You can control the operations such
 as laser pumping or marking on the Laser Marker NAVI smart screen.
 To irradiate the laser by the PC configuration software control, select the marking methods from the followings:

  • Test marking
The mode where you execute the laser radiation manually.
Please use this mode when you configure the marking
conditions at the laser marker installation or when you want
to irradiate the laser while editing the marking data by Laser
Marker NAVI smart, such as during the maintenance work.                                           PC with Laser Marker
   NAVI smart installed


Laser marker


  • RUN mode
Run mode is an operation method to configure the settings of the
laser marker by Laser Marker NAVI smart and to control the marking
start signal from one of the following methods.
 • External devices such as switches or sensors connected to I/O
   terminal
 • Clicking the marking start button of the Laser Marker NAVI smart
   screen
Use this operation mode to configure the laser marker without using                                       Switch for
the external control devices as PLC.                                                                    marking trigger


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • Refer to “3-3-6 Test marking and RUN mode” (P.73).
  • You can edit marking data with Laser Marker NAVI smart even when it is not connected to the laser marker (offline).
  • For the operation method of Laser Marker NAVI smart, please refer to the “Laser Marker NAVI smart Operation Manual”.


  Control by external devices (remote control mode)


 The operation method for automatic control.
 I/O or communication commands control the operations such as
 laser pumping and marking by connecting the laser marker to the
 external control device as PLC.
 The following external control methods are available. These
 controls can be combined.
  • I/O control
  • Communication command control (RS-232C/Ethernet)
  • Link control with image checker (Ethernet)
  • Link control with code reader (RS-232C)                                                                External control
  • Control by the optional industrial network (EtherNet/IP or                                           device such as PLC
PROFINET)


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • For details on the external control, refer to “3-4 Operation by External Devices” (P.75).
  • The link control with an image checker is not available at on-the-fly marking.


58                                                        ME-LPRF-SM-11

---

## หน้า 59

3-2 Start-up & Termination
   • It is obligated by IEC/FDA/JIS that laser products shall incorporate a key-
   actuated master control. Actuation of this laser marker is basically controlled
   by the key switch located on the front of the controller box. However, in
WARNING                             considering situations when the laser marker is operating as a part of a larger
   system, the laser marker turns on if the key switch is already in ON position,
   and power is supplied. In this case, be sure that the external system controls
   the operation of the laser marker with a key-actuated master control.


3-2-1 Start-up procedure
1.    Setup the laser marker connecting head, controller and interfaces.


      Refer to “2-5 Connecting Laser Marker” (P.47).


2.    Turn ON the key switch of the controller.
      The display panel on the controller lights and shows “PLEASE
      WAIT”.


                                                                                        ヱヰ
                                                                                          ヸ
                                                                                             ユン
                                                                             OFF


                                                                                                  ON


3.    The system startup completes approximately after 10 seconds.
      The file number is displayed on the panel.


       ワㄐㄕㄊ㄄ㄆ
 • Do not set the key switch to OFF until system startup has been completed.
 • In case of turning ON the power supply after turning OFF, leave the interval five seconds or more between ON and OFF.
 • In case the file No. is not displayed on the panel after 10 second passes since turning on the key switch, contact our
   sales office or representatives.


4.    To configure and control by the PC configuration software, start Laser Marker NAVI smart and establish an online
      connection with the laser marker.
      • In Windows 10, open the start menu and select “Panasonic-ID SUNX Laser” - “Laser Marker NAVI smart”.
      • In Windows 8.1, open the start menu and select “All Apps” - “Panasonic-ID SUNX Laser” - “Laser Marker NAVI
        smart”.
      Refer to “3-3-3 How to establish online connection” (P.67).


                                                        ME-LPRF-SM-11                                                          59

---

## หน้า 60

3-2-2 Termination procedure

 1.      Turn OFF the laser pumping.                                                             “Laser pumping” tool
         • PC configuration software control: Click “Laser pumping” on the
           ribbon to turn off the laser pumping.
         • Remote control: Turn off the laser pumping by LASER SUPPLY
           IN (X6) of I/O terminal or by the laser pumping command (LSR).
                                                                                         ON status                OFF status


 2.      Overwrite the data as needed.
         Click “Save” on the ribbon and select “To laser marking system” or “To PC”.
                                                                                                                    “Save” tool
         If turning off the power of the laser marker without saving the file under dealing, the data
         being edited is deleted. Be sure to check the file saving before turning off the power.


 3.      Disconnect the online connection.
         Refer to “3-3-4 How to disconnect online connection” (P.69).

          ワㄐㄕㄊ㄄ㄆ
     • Do not turn the laser marker power OFF while being connected to online. When the power gets turned OFF during data
       communication, it may cause the data to corrupt or system failure.
 ￼

 4.      Exit from the Laser Marker NAVI smart.
         Select “X” in the upper right corner of the screen.
         Alternatively, go to the “Startup” screen and select “Exit” from the menu.


 5.      Turn OFF the key switch of the controller and remove the system key.                                       ヱヰ
                                                                                                                        ヸ
         Please have the safety manager store the system key properly.                                                   ユン
                                                                                                           OFF


                                                                                                                               ON


60                                                             ME-LPRF-SM-11

---

## หน้า 61

3-2-3 Operation of controller display panel
The display panel of the controller shows the status of the laser marker.

 Display at starting up
After turning on the power, the following screen is displayed until the system
startup completes.

Backlight color: White
Display panel


Controller

ワㄐㄕㄊ㄄ㄆ
• In case the file No. is not displayed on the panel after 10 second passes or “**00FF” is displayed on the upper right side,
  contact our sales office or representatives.

 Display under operation
The file No. is displayed at the normal operation and error information is displayed when the alarm or the warning is
generated.

Normal operation                            System clock display                  Model information display


Alarm / Warning status                      Language selection


 No.    Description

  q     Normal              Display contents: file No.
operation           Backlight color of default setting: White

  w     Alarm / Warning     Display contents:
status              • Date and time of occurrence of the error (Month/Day, Hour: minute)
   • Error code number
   • Error message
   Backlight color of default setting:
   • Alarm status: Red
   • Warning status: Pink

  e     System clock        Year / Month / Day
display *1          Hour : Minute

  r     Model               Display contents:
information         • Model
display             • Serial number (C: Controller / H: Head)
   • Version (C: Controller / H: Head)
   • Optional network *2


ME-LPRF-SM-11                                                      61

---

## หน้า 62

No.         Description

t       Language             Touch the language to select. The error information is displayed in the selected language.
   selection             • English
   • Japanese
   • Simplified Chinese

y                            Indicates laser pumping is on. (including the incomplete period)

u                            Indicates laser marker is in remote control mode (operated by an external device).

i                            Tapping this icon moves to the model information display.

o                            Tapping this icon returns to the previous display.

       1)                           Tapping this icon moves to the next display.

1!                           Tapping this icon moves to the panel language selection.

 *1 : The system clock can be adjusted in system settings screen of Laser Marker NAVI smart.
 *2 : When the optional network unit is installed to the controller, the type of the network (EtherNet/IP or PROFINET), IP
address, and the version are displayed. If the network unit is not installed, the optional network is indicated as “None”
or “-----”.


  Settings of controller display panel
 The backlight color and language of the display panel can be changed by Laser Marker NAVI smart.

 1.         Establish an online connection between your PC and the laser marking system.


 2.         Go to the “System settings” screen.


 3.         Select “Operation/information” tab.


 4.         Configure the settings under “Controller display” if needed. Select the display panel color from white, pink or red at
            following status respectively.
            • Normal status (Initial setting: white)
            • Warning status (Initial setting: pink)
            • Alarm status (Initial setting: red)

       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • When an alarm of error No. E000 to E199 occurs, the
    display color always becomes red regardless of this setting.


 5.         Select the display language of the controller panel.
            • English
            • Japanese
            • Simplified Chinese

       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • The display language can be changed also with the controller panel directly.


 6.         Select “Apply to laser marking system” on the left side of the ribbon.
                                                                                                            “Apply to laser marking
            The configured items will be applied to the laser marker.                                       system” tool


62                                                              ME-LPRF-SM-11

---

## หน้า 63

3-3 Operation by PC Configuration Software
You can configure the following settings and operations with Laser Marker NAVI smart respectively when the laser marker
is not connected (offline) and when the laser marker is connected (online).

 Offline editing
The followings are supported in the offline editing.
 • Create a new marking file or a backup file.
 • Edit the existing marking file or backup file on a local or network drive.

 Online operations
When you perform the following operations and settings, establish an online connection of the laser marker and Laser
Marker NAVI smart.
• Control the laser marker by the PC configuration software.
• Edit the data registered to the laser marker.
• Register the marking file created to the laser marker, etc.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Only one unit of laser marker can be connected to Laser Marker NAVI smart online at once. If more than one laser
  marker is connected to one PC, switch the laser marker connected online using Laser Marker NAVI smart to configure/
  control each laser marker.


3-3-1 Operation procedure
 Offline editing: Operation example from offline editing to laser marker data registration

Start up Laser Marker NAVI smart.


Select “Offline”.

• To create a new marking file: Select “New...” and select the model of the
  laser marking system.
• To edit the existing marking file: Select “Open...” and select the file to edit.


Edit the file in the “Marking settings” screen.


Save the marking file to PC (local or network drive).


Connect online to the laser marking system.


Add the marking file to the laser marking system.

• In the “Marking settings” screen, select “Open” – “From PC”. Select the file
  to add, then select the file number as the importing destination.
• In the “Data management” screen, open “Marking files” tab. In the file list,
  select the file number as the importing destination, then select “Add” in the
  ribbon and select the file to add.


ME-LPRF-SM-11                                                 63

---

## หน้า 64

 Online connection: Operation example from editing to marking

Turn on the key switch of the laser marking system.
   Start up Laser Marker NAVI smart.

For test marking                                                                                    For RUN mode


Select “Online”.


Select the laser marking system to connect.


Select a file to edit in the “Marking settings” screen.


Edit a marking file.


Save the marking file to the laser marking system.


Laser pumping ON


Start test marking                                                     Turn on the RUN mode.


Shutter open (automatic)


Input a marking trigger.

Turn on TRIGGER IN (X5) of the I/O terminal block
or click “Start marking” button of Laser Marker NAVI
smart.


Laser radiation


Save the marking file to the laser marking system.                     Turn off the RUN mode.


Turn off the laser pumping.


Disconnect the online connection.


Turn off the key switch of the laser marking system.
Exit Laser Marker NAVI smart.


64                                                              ME-LPRF-SM-11

---

## หน้า 65

3-3-2 Screen types
Laser Marker NAVI smart has the different screen mode depending on the settings and operation contents.
The availability of screens depends on the application mode and the user role (administrator or restricted user) as follows:
 • In online mode, the user is “Administrator”:
   “Startup”, “Marking settings”, “Monitor”, “Maintenance”, “Data management”, “System settings”
 • In online mode, the user is “Restricted user”:
   “Startup”, “Marking settings” (for the restricted user), “Monitor”, “Maintenance”
 • In online mode, remote mode or RUN mode is ON:
   “Startup”, “Monitor”
 • In offline mode, at backup editing:
   “Startup”, “Marking settings”, “Maintenance”, “Data management”, “System settings”
 • In offline mode, at a marking file editing:
   “Startup”, “Marking settings”

 Startup screen
This screen appears when you start up Laser Marker
NAVI smart.
Select the usage of Laser Marker NAVI smart from
“Online”, “Offline”, or “Convert”.


 Marking settings
In this screen, you can create and edit a marking file.
If the user role is “Restricted user”, only the settings
allowed to edit are available.

Main usages:
• Create new marking data.
• Edit the marking data (individual files or backup file)
  saved in external device or local folder. (offline)
• Edit the marking data registered to the laser marker
  (online).
• Execute the test marking. (online)


 Monitor
In this screen, you can monitor the operation status of
the laser marking system during remote mode or RUN
mode.

Main usages:
• Check the marking image.
• Check the settings.
• Check the ON/OFF state of I/O.


ME-LPRF-SM-11                                                      65

---

## หน้า 66

 Maintenance
 This screen is used for the maintenance of the laser
 marking system.

 Main usages:
 • Check the operating data.
 • Irradiate the laser for measurement. *
 • Simulate ON/OFF operation of the output signals
 • Confirm the communication command history.
    * To measure the laser output, you need a power meter
      available in stores.


  Data management
 This screen lists all files that are currently saved on the
 laser marking system.

 Main usages:
 • Add/delete a marking file, graphic or font file.
 • Acquire the backup of data saved in the laser marker.
 • Restore the backup data to the laser marker.


  System settings
 In this screen you set the system properties of the laser
 marking system.

 Main usages:
 • Change the time of the system clock.
 • Configure the input to and output from the external
   device and the communication settings.
 • Select the setting items to display in the “Monitor”
   screen.
 • Select the editable settings for the restricted user.
 • Configure the laser power and offset value of the
   marking position for all the data in the laser marker.


66                                                             ME-LPRF-SM-11

---

## หน้า 67

3-3-3 How to establish online connection
1.      Connect the laser marker and the PC with a USB cable. Start the laser marker.


2.      Start the Laser Marker NAVI smart. The startup screen appears.


3.      On the “Startup” screen, select “Online” to open the “Connection” dialog.
        Any laser marking system that is ready for an online connection is displayed in the list.
        If the desired laser marking system is not in the list, select “Search laser marker”.


4.      Select the laser marking system that you want to connect and select “Connect”. When the online connection is
        established, the “Marking settings” screen appears.

         ワㄐㄕㄊ㄄ㄆ
    • Do not remove the USB cable or LAN cable while the online connection with the laser marker is active.
    • Do not turn the laser marker power OFF while being connected to online.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
￼
• If PC goes into “Sleep” when the laser marker and PC are connected online, the online connection between them is
  disabled.
  If PC goes into sleep state in the REMOTE mode or RUN mode, the PC is disconnected but the operation state of the
  laser marker (REMOTE mode or RUN mode state) are maintained.
• To maintain the online connection, release the sleep setting of the PC.
• If the version of using Laser Marker NAVI smart does not support the connecting laser marker model, some functions
  and operations cannot be set or executed online.


ME-LPRF-SM-11                                                  67

---

## หน้า 68

 Setting procedure for Ethernet online connection
 For communication between the laser marker and PC terminal using Ethernet, you need to configure the following
 communication settings first.

 1.   Connect Laser Marker NAVI smart and laser marker to online via a USB cable.


 2.   Go to the “System settings” screen and select
      “Communication” tab.
      Input the Ethernet settings according to the
      network settings.
      Set a separate IP address not to overlap between
      the laser marker and PC on the network.


 3.   Select “Apply to laser marking system” on the left side of the ribbon.
                                                                                                 “Apply to laser marking
                                                                                                 system” tool


 4.   Select the “Connection” tool in the ribbon.


 5.   In the “Connection” dialog, select “Disconnect”.
      The online connection with the laser marking
      system is now disconnected.


 6.   Turn off the power of the laser marking system,
      wait five seconds and then restart the system.


 7.   On the “Startup” screen, select “Online” to open
      the “Connection” dialog.


 8.   To use the Ethernet connection, select “Including
      Ethernet connections”, and then select “Search
      laser marker”.
      Check that an Ethernet connection appears in the
      list.


 9.   Select the laser marking system that you want to
      connect and select “Connect”. When the online connection is established, the “Marking settings” screen appears.


68                                                        ME-LPRF-SM-11

---

## หน้า 69

3-3-4 How to disconnect online connection
ワㄐㄕㄊ㄄ㄆ
• Disconnect the online connection before turning the laser marker power OFF.

1.   Select the “Connection” tool in the ribbon or go to the “Startup” screen and select “Online”.   “Connection”
                                                                                                     tool

2.   In the “Connection” dialog, select “Disconnect”.
     The online connection with the laser marking system is now disconnected.


                                                        ME-LPRF-SM-11                                               69

---

## หน้า 70

3-3-5 User selection and password settings
 In online mode, you can select between two user roles “Restricted user” or “Administrator”.
 If you have configured the password on the “System settings” screen, you are required to enter the password when you log
 in as an “Administrator”.
 As “Administrator” you have access to all screens and settings. As “Restricted user” the access to screens and settings is
 restricted. The parameters allowed to edit can be configured in the “System settings” screen in advance.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • In offline mode, the user is fixed to “Administrator”.
 • The available screens of Laser Marker NAVI smart vary depending of the user role and operating mode. Refer to “3-3-2
   Screen types” (P.65).


  Configure permissions for the restricted user

 1.    Establish an online connection between your PC and the laser marking system.


 2.    Go to the “System settings” screen.


 3.    Select “Access permissions” tab and configure the permissions.
       • Set the password for administrator.
       • Add or remove a permission to edit parameters with the “Restricted user” profile.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For details, refer to the “Laser Marker NAVI smart Operation Manual”.

 4.    Select “Apply to laser marking system” on the left side of the ribbon. The
                                                                                                   “Apply to laser marking
       password and permissions will be updated in the laser marking system.
                                                                                                   system” tool


70                                                        ME-LPRF-SM-11

---

## หน้า 71

 Switch the user

1.      Select the user icon on the upper right of the screen.
        The “User selection” dialog appears.


2.      Select the user from “Restricted user” or “Administrator”, and select “OK”.
        To select the “Administrator”, enter the password if it was set and select “OK”.
        The password is also required when you establish an online connection between
        your PC and laser marking system.


 When password is forgotten
If you have forgotten the password for the administrator, delete the password according to the following procedure:

1.      If the laser marker is in the remote mode, turn the remote mode                    “Operation” tool
        OFF.
        To deactivate remote mode, select the “Operation” in the ribbon.
        In the dialog, select “Remote/RUN OFF”.                                                       Remote mode OFF
                                                                                 Remote mode ON


         ワㄐㄕㄊ㄄ㄆ
    • Do not delete the password with the remote mode ON.


2.      Exit the Laser Marker NAVI smart when it is started up.


3.      Double-click and execute “ClearPassword.exe” included in the attached CD-ROM “Laser Marker Smart Utility”.
        You can find “ClearPassword.exe” at the following location of the CD-ROM.
        CD-ROM\Tools\ClearPassword.exe

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
    • During the “ClearPassword.exe” running, it does not matter whether the laser marker and PC are connected or not.
￼


4.      Check the box next to “Clear the password” on the screen
        displayed, and then, click “OK”.


                                                           ME-LPRF-SM-11                                                 71

---

## หน้า 72

5.    Start Laser Marker NAVI smart and establish an online connection with the laser marker of which password setting
       you want to delete.
       This deletes the password, and the password will not be required to log in as an administrator.

 6.    Exit from the Laser Marker NAVI smart.


 7.    Execute ClearPassword.exe again. If “Clear the password”
       remains enabled, then, click “OK”.

        ワㄐㄕㄊ㄄ㄆ
 • If “Clear the password” remains enabled, the password will
   be deleted when connected to online even without executing
   ClearPassword.exe. Make sure to uncheck the box next to “Clear
   the password”.


 8.    To reconfigure the password, start Laser Marker NAVI smart and select the “System settings” screen. Select the
       “Access permissions” tab and enter the password for the administrator.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For details on the system settings, please refer to the “Laser Marker NAVI smart Operation Manual”.

 9.    Select “Apply to laser marking system” on the left side of the ribbon.
                                                                                                         “Apply to laser marking
       The password protection becomes valid.                                                            system” tool


72                                                        ME-LPRF-SM-11

---

## หน้า 73

3-3-6 Test marking and RUN mode
When you execute marking using the PC configuration software control, the laser irradiates in the following methods:

 Test marking procedure
Test marking is a marking method of radiating laser by the operations on the Laser Marker NAVI smart.

1.   Establish an online connection between your PC and the laser marking system and go to the “Marking settings”
     screen.


2.   Select “Laser pumping” in the ribbon to turn on the laser pumping.                  “Laser pumping” tool


                                                                                  ON status                OFF status


3.   Click “Test marking” in the ribbon.
                                                                                           “Test marking” tool
     The “Test marking/guide laser” dialog appears.


4.   Specify the laser settings such as “Laser power” and
     “Scan speed [mm/s]”, then select “Start marking”.


5.   A confirmation dialog of the laser radiation appears. Click “Yes” to start
     radiating the laser.


                                           • Take appropriate protective measures during laser radiation such as wearing
        WARNING                              laser protective goggles or using a protective enclosure.


                                                         ME-LPRF-SM-11                                                     73

---

## หน้า 74

 RUN mode procedure
 In RUN mode, either a signal from Laser Marker NAVI smart or from an external device starts the laser radiation.

 1.   Establish an online connection between your PC and the laser marking system.


 2.   Select “Laser pumping” in the ribbon to turn on the laser pumping.                     “Laser pumping” tool


                                                                                      ON status                OFF status


 3.   Select “Operation” in the ribbon and select “RUN ON”.
                                                                                                    “Operation” tool

                                                                                            Remote mode OFF/
                                                                                             RUN mode OFF


 4.   When you turn ON the RUN mode, the laser marker enters into
      the marking start signal standby state.
      Enter the marking start signal (marking trigger) in any of the
      following methods to irradiate the laser beam.
      • Switches or sensors connected to TRIGGER IN (X5) on the I/O
        terminal block
      • “Start marking” button in Laser Marker NAVI smart
                                                                                                             Switch for
                                                                                                           marking trigger
               “Start marking” button


74                                                        ME-LPRF-SM-11

---

## หน้า 75

3-4 Operation by External Devices

3-4-1 Operation method using external control device
To control the laser marker with the external control device, the following connecting methods are applicable:

 Control by I/O (remote mode)

Controls the laser marker from external devices such as PLC using I/O signals loaded into the laser marker.
For details, refer to “4 External Control Using I/O” (P.81).


I/O terminal block
I/O connector

Laser marker


PLC, etc.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • To input marking trigger with I/O and configure other settings with a screen operation manually, use Run mode. For
   details, refer to “3-3-6 Test marking and RUN mode” (P.73).
 • When the optional network unit is installed to the controller, controlling the laser marker with EtherNet/IP or PROFINET
   unit is available. For details, refer to “EtherNet/IP Communication Guide” or “PROFINET Communication Guide”.


 Control by communication commands (remote mode)

To control the laser marker by communication commands from external devices such as PLC, use RS-232C or Ethernet
connection.
For details, refer to “5 External Control by Communication Commands” (P.126) and “Serial Communication Command
Guide”.


   RS-232C or
   Ethernet
Laser marker

External control
   device


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • It is available to the external control combining I/O and communication commands.
 • For LP-RF/LP-RV series, if the optional network unit is installed to the controller, you can send the commands via
   EtherNet/IP or PROFINET.


 Link control with external devices (remote mode or RUN mode)

Connect the external devices, such as an image checker or a code reader, to the laser marker and control them together.
 • Link control (Ethernet) with specific external devices (i.e. image checker) *1
 • Link control with a code reader (RS-232C)
For details, refer to “6 Link Control with External Devices” (P.135).
*1 : The link control with an image checker is not available at on-the-fly marking.


ME-LPRF-SM-11                                                          75

---

## หน้า 76

3-4-2 Operation procedure with external control

 ⿎⿎Operation example when controlling the laser marker from external control devices such as
   PLC

Turn ON key switch of laser marker controller


Remote mode ON

Refer to “3-4-4 Remote mode settings” (P.80).


   Control by communication
I/O control
   commands


Select file


Laser pumping ON


OPEN shutter                                                                     Control by using I/O or
   communication commands

Confirm READY OUT is ON.

The device is ready for receiving the marking starting signal (trigger).


Trigger Input ON


Marking


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • It is available to the external control combining I/O, and communication commands.
 • You need to configure the system settings on the I/O communication in advance before using external control. Refer to
   “3-4-3 General settings before external control” (P.77).
 • For details on the operation procedure when you link an image checker or a code reader, refer to “6 Link Control with
   External Devices” (P.135).


76                                                         ME-LPRF-SM-11

---

## หน้า 77

3-4-3 General settings before external control
To control the laser marker via I/O or communication commands, configure the following items in advance at the system
settings of Laser Marker NAVI smart.

1.     Establish an online connection between your PC and the laser marking system.


2.     Go to the “System settings” screen.


3.     Select the “Operation/Information” tab. Configure the
       settings under “Operation” and “Compatibility with former
       models”.


4.     Select the switching method of the remote mode.
       • PC configuration software (initial setting)
       • I/O


5.     When PC configuration software is selected, select the remote mode status at power-on.
       • Remote mode ON
       • Remote mode OFF (initial setting)


6.     Select the control method for the following operations between I/O or communication commands.
       As the default, I/O control is selected to all settings.
       • Laser pumping control
       • Shutter control
       • Guide laser control


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • To use “Laser Radiation for Measurement Command (SPT)” of the communication commands, set the shutter control
   method to “communication commands”.
 • If you want to control these I/O operations via optional network unit (EtherNet/IP or PROFINET), select “I/O” here.


7.     If you want to use the same command format with the former models of LP-400/LP-V series, enable “LP-400/V
       compatibility”.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For the details of the compatible command format with the former models, refer to the “Serial Communication Command
   Guide: LP-400/V compatible mode”.
 • If you use the optional network (EtherNet/IP or PROFINET) for the command control, deactivate “LP-400/V
   compatibility”.


8.     Select “Apply to laser marking system” on the left side of the ribbon.
                                                                                                “Apply to laser marking
system” tool


ME-LPRF-SM-11                                                77

---

## หน้า 78

9.     When using I/O, click the “Inputs/outputs” tab and configure the following items:
        • One-shot pulse duration:
           Configure the output time of the signal being output as one-shot, such as PROCESSING END OUT (Y11).
           Setting range: 2 to 510ms (initial value is 40ms)
        • Warning at invalid trigger signal:
           Configure if you will output (Enabled) or will not output (Disabled) the warning for the invalid trigger. With enabling
           this setting, the warning is output when the marking trigger that cannot be accepted was input.
           (Initial setting: Enabled)
        • TARGET DETECTION IN (X7):
           Select whether or not to use TARGET DETECTION IN on I/O terminal.


           (Initial setting: Disabled)
           When enabling this terminal, connect a sensor which detect the work piece is in position for lasing.
        • Assignment of counter end outputs:
           Assign the counter No. to COUNT END A OUT to COUNT END D OUT (I/O pin No. 30 to 33).
           As the default setting, counter No. 0 to 3 are assigned to COUNT END A OUT to COUNT END D OUT respectively.


       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • These settings are also applied to the communication by the optional network (EtherNet/IP or PROFINET).


 10. Select “Apply to laser marking system” on the left side of the ribbon.                             “Apply to laser marking
                                                                                                        system” tool


 11. When using communication commands, select the “Communication” tab to set communication details of the interfaces
        you will use.
        • For Ethernet:
           Configure the communication settings according to
           the network settings.
        • For RS-232C:
           Configure the communication settings of the laser
           marker corresponding to the external control device.


                           Set “Communication commands” to the
                           RS-232C usage.


78                                                         ME-LPRF-SM-11

---

## หน้า 79

12. Under “Command format”, specify the communication command format.
       • Start code: STX (initial setting) / None
       • Include command in response: ON (initial setting) / OFF
       • Sub-command for response data: Any single byte character of ASCII code from 01(HEX) to 7F(HEX) can be
         specified.
         • Initial setting of positive response code: A
         • Initial setting of negative response code: E
         • Initial setting of read request response code: A
       • Encoding for non-ASCII characters: Shift-JIS (initial setting) / GB 2312 / Latin-1


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For details of the command format, refer to the “Serial Communication Command Guide”.
 • The command format settings here are applied to the standard communication format, but not applied to LP-400/LP-V
   compatible format. For the details of the compatible mode with the former models of LP-400/LP-V series, refer to the
   “Serial Communication Command Guide: LP-400/V compatible mode”.
 • “Encoding for non-ASCII characters” is used for the European special characters, Japanese and Chinese characters
   which cannot be specified by the ASCII codes. Select “Shift JIS” for Japanese characters and “GB 2312” for simplified
   Chinese. If you use European special characters such as À or Ä, select “Latin-1”.


13. To input the control codes in the barcode/2D code strings using the communication commands, click “Open settings”
       of “Input method for control codes” and select the input method.


14. Select “Apply to laser marking system” on the left side of the ribbon.                           “Apply to laser marking
                                                                                                     system” tool


15. Disconnect the online connection with the laser marker.


16. Turn off the power of the laser marking system, wait five seconds and then restart the system.
       The configured items will be reflected to the laser marker.

        ワㄐㄕㄊ㄄ㄆ
 • Do not turn the laser marker power OFF while being connected to online.


17. The control by the external device starts by switching the laser marker to the remote mode.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For the details of the System settings, refer to the “Laser Marker NAVI smart Operation Manual”.
 • For the configuration of the optional network (EtherNet/IP or PROFINET), refer to “EtherNet/IP Communication Guide”
   or “PROFINET Communication Guide”.


                                                          ME-LPRF-SM-11                                                        79

---

## หน้า 80

3-4-4 Remote mode settings
 To control the laser marker externally via I/O or communication commands, set the operation mode to the remote mode
 with one of the following methods.
 Select the method to switch to the remote mode on the system settings screen of Laser Marker NAVI smart. Refer to “3-4-3
 General settings before external control” (P.77).


Remote mode switching by Laser Marker NAVI smart

Select “Operation” in the ribbon.                                                        “Operation” tool
In the dialog, select “Remote ON” and select “Yes” to confirm.


Remote mode ON            Remote mode OFF


Startup the laser marker in the remote mode (Laser Marker NAVI smart can switch the remote mode)

  When you turn ON the key switch of the laser marker, the system starts in the remote mode. Use the operation tool of
  Laser Marker NAVI smart for releasing and resetting the remote mode.
  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If you want to start up the laser marker in the remote mode, you need to configure the settings on the system settings
  screen of Laser Marker NAVI smart in advance.
• If you have configured the laser marker to start up in the remote mode, you cannot switch the remote mode from I/O.
 ￼

Remote mode switching using I/O

Turn ON REMOTE IN (X4) of the I/O terminal block on the                                                  X1         Y1
controller.
   X2         Y2
   PLC, etc.
   X3         Y3
   OUTPUT
   REMOTE IN
   X4         Y4
   X5         Y5
   X6         Y6
   X7        Y7
   I/O terminal block

  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• To enable switching to the remote mode by REMOTE IN (X4) on the I/O terminal block, you need to configure the
  settings on the system settings screen of Laser Marker NAVI smart in advance.
• If you have configured the remote mode switching method to the I/O terminal block, you cannot switch the remote mode
  from the Laser Marker NAVI smart screen.


   • If the laser marker is set to enter the remote mode at startup or by I/O control,
WARNING                             construct a manual resetting system to re-pump the laser when the laser
   pumping is turned to off due to an emergency stop or an interlock.


80                                                         ME-LPRF-SM-11

---

## หน้า 81

4 External Control Using I/O


ME-LPRF-SM-11

---

## หน้า 82

4-1 I/O Interface Specification
 The I/O terminal block and the I/O connector are available as the external control I/O interface of this product.
  • I/O terminal block: Loaded with the basic input/output to control the laser marker.
  • I/O connector: Loaded with the input/output for data configuration such as selecting a file number and the input/output
for the specific functions.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Before using I/O, configure the system settings. Refer to “3-4-3 General settings before external control” (P.77).


   X1      Y1
   X2      Y2
   X3      Y3
   X4      Y4
   1                 2
   X5      Y5
   X6      Y6
   X7      Y7
   X8      Y8
   X9      Y9
   X10     Y10
   X11     Y11
   X12     Y12
   X13     Y13
   Hook                                X14     Y14
The I/O terminal block can be             X15     Y15
   X16     Y16                                                39              40
removed by holding down the
   X17     Y17
hooks.
   X18     Y18
   X19     Y19
   Rear of controller
   X20     Y20

   I/O connector
I/O terminal block
   (Laser marker)

  Connector specifications and models
Connector position                  Connector specifications       Model                            Manufacturer name
I/O terminal      On the laser      Dedicated connector            15EDGRHCM-THR-3.5-40P-1          Degson Electronics
block             marker side                                                                       Co., Ltd
   User side                                        Accessories: 15EDGKNHG-
   3.5-40P-14-00A
I/O Connector     On the laser      MIL connector                  XG4A-4034                        OMRON Corporation
   marker side       40-pin/male
   User side         MIL connector                  Accessories: XG4M-4030-T
   40-pin/female


  Wiring of input/output lines
 Install one of the ferrite cores included in this product to the wirings from the I/O                  Rear of controller
 terminal and another one to the lines from the I/O connector.
 If the diameter of the ferrite core is too large, turn the I/O lines around the ferrite
 core as shown in the figure.


Ferrite cores


82                                                           ME-LPRF-SM-11

---

## หน้า 83

4-2 Signals and Details of I/O Terminal Block
The I/O terminal block is loaded with the basic input/output to control the laser marker.

 List of signals
 No.             Name                                              No.             Name
 X1              24V OUT                                           Y1              0V OUT
Internal power 24V                                                Internal power 0V
 X2              IN COM. 1                                         Y2              OUT COM. 1
Input common 1                                                    Output common 1
 X3              0V OUT                                            Y3              24V OUT
Internal power 0V                                                 Internal power 24V
 X4              REMOTE IN                                         Y4              REMOTE OUT
 X5              TRIGGER IN                                        Y5              READY OUT
 X6              LASER SUPPLY IN                                   Y6              LASER STANDBY OUT
 X7              TARGET DETECTION IN                               Y7              SYSTEM STANDBY OUT
 X8              SHUTTER IN                                        Y8              SHUTTER CLOSE 1 OUT
 X9              SHUTTER ENABLE IN                                 Y9              SHUTTER CLOSE 2 OUT
 X10             LASER STOP IN                                     Y10             PROCESSING OUT
 X11             LASER STOP IN                                     Y11             PROCESSING END OUT
 X12             OUT COM. 1                                        Y12             PROCESSING FAIL OUT
Output common 1
   Y13             RESERVE
 X13             ENCODER A IN                                                      System reservation
 X14             ENCODER B IN                                      Y14             WARNING OUT
 X15             ALARM RESET IN                                    Y15             ALARM OUT
 X16             INTERLOCK 1(+)                                    Y16             INTERLOCK 1 MONITOR
 X17             INTERLOCK 1(-)                                    Y17             INTERLOCK 1 MONITOR COM.
 X18             INTERLOCK 2(+)                                    Y18             INTERLOCK 2 MONITOR
 X19             INTERLOCK 2(-)                                    Y19             INTERLOCK 2 MONITOR COM.
 X20             REMOTE INTERLOCK IN                               Y20             LASER SUPPLY OUT


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Use the internal power (X1, X3, Y1, Y3) as the power supply when operating the laser marker alone. Do not connect
  anything when using the external power supply.
• Do not connect anything to RESERVE terminals.
• Some terminals are already connected by the short bars with shipment. Refer to “4-5-1 Factory default wiring” (P.101).
• For details on the terminal block connection, refer to “4-5 Connecting I/O Terminal Block” (P.101).


ME-LPRF-SM-11                                                      83

---

## หน้า 84

 Input signal operation on the I/O terminal block
ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The ON/OFF listed in this section refers to the ON/OFF operations. It does not refer to the voltage level (High/Low).

  No.       Name and description

  X1        24V OUT: Internal power (power for input/output) + 24V DC (max. output current 300mA)
Power to operate the laser marker independently.
X1 and Y3 are the common terminal connected internally.

   ワㄐㄕㄊ㄄ㄆ
• Make sure to use X3 or Y1 for the 0V of the internal power 24V OUT (X1 and Y3). Do not mix up with the
  external and internal power supplies.
• Do not connect anything to this terminal when using the external power supply.
• When using the internal power supply (X1, X3, Y1, Y3), the total current of the power supply for the external
  device and the consumption current for the I/O control should be less than 300mA.

  X2        IN COM. 1: Input common 1
The common terminal for each input of the I/O terminal block.
For NPN connection, this terminal is connected to the “+ (plus)” side of power which is used for control. For
PNP connection, this terminal is connected to the “- (minus)” side of power which is used for control.
For details, refer to “4-5-2 Connecting common terminals” (P.102).

  X3        0V OUT: Internal power (power supply for input/output) 0V
Power to operate the laser marker independently.
Y1 and X3 are the common terminal connected internally.

   ワㄐㄕㄊ㄄ㄆ
• Make sure to use X1 or Y3 for the internal power 0V OUT (X3 and Y1). Do not mix up with the external and
  internal power supplies.
• Do not connect anything to this when using the external power supply.

  X4        REMOTE IN: Remote mode input
While the input is turned on, the laser marker operates in the remote mode which can be controlled externally
by I/O and communication commands.
To transit to the remote mode using this terminal, you will need to configure the communication setting of
Laser Marker NAVI smart in advance.
Refer to “3-4-4 Remote mode settings” (P.80).

  X5        TRIGGER IN: Marking trigger input
The signal to start marking (laser radiation). Starts marking by edge of input ON. This signal can be accepted
while READY OUT (Y5) is turned ON.
The operation behavior of TRIGGER IN signal varies depending on Trigger mode settings as follows.
 • For marking to static object:
   • Single trigger: One lasing operation is executed by the edge of turning on of TRIGGER IN signal.
   • Continuous trigger: Lasing operation is repeated while TRIGGER IN signal is on.
 • For on-the-fly marking:
   • Single trigger: One lasing operation is executed by the edge of turning on of TRIGGER IN signal.
   • Marking at regular intervals: Marking operation is executed at regular intervals while TRIGGER IN is ON.
   • Multiple triggers: It allows to accept the multiple marking triggers in advance. Max. 16 triggers can be
   accepted while PROCESSING OUT (Y10) is ON.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• You can set the trigger mode with Laser Marker NAVI smart. For the marking to static object, it is specified
  in “File settings” by each file. For on-the-fly marking, it is specified in “Motion settings to all files” and this
  one setting is applied to all files.
• When the trigger delay time is set in the selected file, trigger processing (lasing) operation starts after the
  delay time.
• When on-the-fly marking is set, lasing operation starts when the work piece comes to the preset marking
  position after TRIGGER IN is accepted.
• If you are using the link control function with the image checker, the link control (a series of control
  operations including external device operation, laser radiation, laser marker internal processing) starts by
  the edge of input ON of TRIGGER IN. Refer to “6-1 Link Control with Image Checker” (P.136).


84                                                        ME-LPRF-SM-11

---

## หน้า 85

No.    Name and description

X6     LASER SUPPLY IN: Laser pumping input
While this input is turned on, the laser is pumped to enable the radiation.
It takes approximately 7 seconds from turning on LASER SUPPLY IN to completion of laser pumping.
This terminal is available when the laser pumping control method is set to I/O at the system settings of Laser
Marker NAVI smart.

X7     TARGET DETECTION IN
Connect a sensor which detect the work piece is in position for lasing.
According to the ON/OFF state of this terminal, CHECK OK OUT (No.34) or CHECK NG OUT (No.35) of I/O
connector turns on for one-shot pulse duration after the trigger processing (lasing) operation.
 • When TARGET DETECTION IN (X7) turns ON for more than 1ms during lasing operation: CHECK OK
   OUT (No.34) turns ON.
 • When TARGET DETECTION IN (X7) did not turn ON during lasing operation: CHECK NG OUT (No.35)
   turns ON.
This terminal is available when TARGET DETECTION IN (X7) is set to “Enabled” at the system settings of
Laser Marker NAVI smart.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• TARGET DETECTION IN is not available when you use the link control with an image checker.


X8     SHUTTER IN: Shutter open input
While this input is turned on, the internal shutter opens. The control of this terminal is enabled when
SHUTTER ENABLE IN (X9) is ON.
There is a delay time of around 200ms to max. 1 second from turning ON/OFF of SHUTTER IN for the actual
shutter open / close operation time.
This terminal is available when the shutter open/close control method is set to I/O at the system settings of
Laser Marker NAVI smart.


X9     SHUTTER ENABLE IN: Shutter open enable input
Control by SHUTTER IN (X8) is available while SHUTTER ENABLE IN is turned ON. To control opening and
closing the shutter by SHUTTER IN (X8) only, short-circuit SHUTTER ENABLE IN (X9) and OUT COM.1 (Y2
or X12).

   • Do not use SHUTTER IN (X8) and SHUTTER ENABLE IN (X9) as an
WARNING                          emergency stop or the interlock. Turning OFF these terminals during laser
   radiation will not close the shutter until the marking completes.


X10    LASER STOP IN
X11    LASER STOP IN
Use these terminals when you want to stop the laser radiation or disable the laser radiation temporarily.
When between LASER STOP IN and OUT COM. 1 is disconnected, the laser radiation will be disabled.
The laser marker operation varies depending on its condition as shown below. For details, refer to “Laser
marker operation when functions for safety measures are input” (P.90).
   Terminal connection   Status when the terminal is open           Shutter         Laser pumping
   LASER STOP IN -             Laser is not radiating               Close              Hold ON
   OUT COM.1                  Radiating the laser                 Close                OFF

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• The function relating to safety must be shut off mechanically. Therefore, wire these terminal at no-voltage
  contact (dry contact).
• If you need to shut off the laser pumping physically, user INTERLOCK 1 (X16, X17) and INTERLOCK 2 (X18,
  X19) instead of these terminals.

X12    OUT COM. 1: Output common 1
The common terminal for each output of the I/O terminal block. X12 and Y2 are the common terminal
connected internally.
For NPN connection, this terminal is connected to the “- (minus)” side of power which is used for control. For
PNP connection, this terminal is connected to the “+ (plus)” side of power which is used for control.


ME-LPRF-SM-11                                                        85

---

## หน้า 86

No.   Name and description

 X13   ENCODER A IN
 X14   ENCODER B IN
Input the signals from an encoder or two sensors which detect the line speed for on-the-fly marking.
When using an encoder, input A-phase to ENCODER A IN (X13) and B-phase to ENCODER B IN (X14). Up
to 100kHz can be input respectively. If only one phase is used, connect the encoder signal to ENCODER A IN
(X13) and connect ENCODER B IN (X14) to IN COM. 1 (X2).
When using two sensors for measuring the line speed, connect the upward sensor to ENCODER A IN (X13),
and connect the downward sensor to ENCODER B IN (X14).


 X15   ALARM RESET IN
The reset input for restoring the system from the alarm status.
Make sure to verify the safety by eliminating the alarm causes before turning this input ON.
The errors you can restore by using this terminal are as follows:
 • E400 to E499
 • E500 to E599
For the alarms you are unable to reset such as the ones caused by hardware or system error, restart the laser
marker.

 X16   INTERLOCK 1(+)
 X17   INTERLOCK 1(-)
 X18   INTERLOCK 2(+)
 X19   INTERLOCK 2(-)
The terminal used as the interlock, which is connected to the door or switches of the safety device.
When the connection between INTERLOCK (+) and INTERLOCK (-) is opened, the shutter is closed and the
laser pumping is turned OFF physically. For details, refer to “Laser marker operation when functions for safety
measures are input” (P.90).
To enable the laser radiation, connect INTERLOCK (+) and INTERLOCK (-) with the non-voltage contact (dry
contact) such as a relay or a switch.
Using both INTERLOCK 1 and INTERLOCK 2 with a safety relay unit, the safety designed system with the
double-circuit of the interlock can be constructed.
   INTERLOCK connection                Shutter          Laser pumping
   X16 - X17: Open
   Close                  OFF
   X18 - X19: Open

   ワㄐㄕㄊ㄄ㄆ
• INTERLOCK terminals (X16, X17 and X18, X19) are connected to the operating coil of the internal contactor
  in the controller. Connect INTERLOCK (+) and INTERLOCK (-) with the non-voltage contact (dry contact)
  such as a relay or a switch. Do not connect with the voltage contact such as a transistor.


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Between INTERLOCK(+) and INTERLOCK(-) are wired by a short bar for the shipment.
• For the connection of INTERLOCK terminals (X16, X17 and X18, X19), refer to “2-6 Construction of System”
  (P.56) and “4-5-4 Connection example of interlock terminals and laser stop terminals” (P.103).

 X20   REMOTE INTERLOCK IN
Use this terminal when you want to stop the laser radiation or disable the laser radiation temporarily.
When between REMOTE INTERLOCK IN (X20) and OUT COM. 1 is disconnected, the internal shutter is
closed and laser pumping is turned to off. For details, refer to “Laser marker operation when functions for
safety measures are input” (P.90).
This terminal can be used as the “Remote interlock connector” required by IEC 60825-1.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If you need to shut off the laser pumping physically, user INTERLOCK 1 (X16, X17) and INTERLOCK 2 (X18,
  X19) instead of this terminal.


86                                                ME-LPRF-SM-11

---

## หน้า 87

 Output signal operation on the I/O terminal block
  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• The ON/OFF listed in this section refers to the ON/OFF operations. It does not refer to the voltage level (High/Low).

 No.       Name and description
 Y1        0V OUT: Internal power (power supply for input/output) 0V
Power to operate the laser marker independently.
Y1 and X3 are the common terminal connected internally.

   ワㄐㄕㄊ㄄ㄆ
• Make sure to use X1 or Y3 for the internal power 0V OUT (X3 and Y1). Do not mix up with the external and
  internal power supplies.
• Do not connect anything to this when using the external power supply.
 Y2        OUT COM. 1: Output common 1
The common terminal for each output of the I/O terminal block. X12 and Y2 are the common terminal
connected internally.
For NPN connection, this terminal is connected to the “- (minus)” side of power which is used for control. For
PNP connection, this terminal is connected to the “+ (plus)” side of power which is used for control.
For details, refer to “4-5-2 Connecting common terminals” (P.102).
 Y3        24V OUT: Internal power (power for input/output) + 24V DC (max. output current 300mA)
Power to operate the laser marker independently.
X1 and Y3 are the common terminal connected internally.

   ワㄐㄕㄊ㄄ㄆ
• Make sure to use X3 or Y1 for the 0V of the internal power 24V OUT (X1 and Y3). Do not mix up with the
  external and internal power supplies.
• Do not connect anything to this when using the external power supply.
• When using the internal power supply (X1, X3, Y1, Y3), the total current of the power supply for the external
  device and the consumption current for the I/O control should be less than 300mA.
 Y4        REMOTE OUT: Remote mode output
The output is ON during the remote mode.
Make sure that this terminal is turned ON and start the external control by I/O or communication commands.
 Y5        READY OUT: Marking trigger ready output
When TRIGGER IN (X5) becomes acceptable (the laser radiation becomes ready), this output turns ON.
To turn on READY OUT, the following conditions are required:
 • No error has occurred (Except E700 to E799)
 • Not in trigger processing operation (Except the multiple triggers of on-the-fly marking)
 • Laser pumping has completed
 • Internal shutter is open
 • The file number switching process has completed
 • With the file using “registered characters via I/O” or “external offset function”, the data number and SET IN
   (No.2) of I/O signals have been input.
 • With the file using “characters specified by SIN command” or external offset function with “Using SEO
   command”, SIN or SEO command has been sent.
 • When the command reception permission (MKM command) is used, the reception permission state is
   turned OFF.
 Y6        LASER STANDBY OUT: Laser pumping completion output
The output is ON after the laser pumping completes and until the laser pumping turns OFF.
The output turns ON approximately 7 seconds after the laser pumping started.


 Y7        SYSTEM STANDBY OUT: System startup completed output
After the laser marker is turned ON, the output remains turned ON during the time since the system startup
has completed until the power is turned OFF.
Output ON in approximately 10 seconds after key switch is turned ON.


ME-LPRF-SM-11                                                          87

---

## หน้า 88

No.   Name and description
 Y8    SHUTTER CLOSE 1 OUT
 Y9    SHUTTER CLOSE 2 OUT
Output ON during internal shutter of the head is closed.
Two sensors mounted inside of the head detect the shutter status and output them as SHUTTER CLOSE 1
OUT and SHUTTER CLOSE 2 OUT respectively.
Connect these signals to the external safety control unit to ensure the shutter status of the laser system.
SHUTTER CLOSE 1 OUT and SHUTTER CLOSE 2 OUT will be output by the same operation, but their
output timing has a margin of error.
There is a delay time of around 200ms to max. 1 second from turning ON/OFF of SHUTTER IN (X8) to turning
ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER CLOSE 2 OUT (Y9).

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• To confirm the shutter open status, use SHUTTER OPEN OUT (No.39) on the I/O connector.


 Y10   PROCESSING OUT: Trigger processing output
When TRIGGER IN (X5) is accepted, this terminal turns ON. The output time of PROCESSING OUT (Y10)
includes the trigger delay time, marking preparation time, laser radiation time, and processing time after
marking has completed.
In case the trigger processing time is shorter than the set one-shot pulse duration, the trigger processing
output remains ON until the one-shot output time ends. *1

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If you are not using the link control function with the image checker, output time of PROCESSING OUT (Y10)
  is almost the same as the total duration of the trigger delay time and LASING OUT (No.40).
• When on-the-fly marking with multiple triggers is set, PROCESSING OUT (Y10) remains ON until the all
  trigger processing operation has been completed.
• If you are using the link function with external devices, output time of PROCESSING OUT (Y10) includes
  operation time of the external device, laser radiation time, and internal processing time of the laser marker.
 Y11   PROCESSING END OUT: Trigger processing completed output
Output ON when the input marking trigger processing (such as laser radiation) is completed. You can use this
output for confirmation of the marking completion.
This is One-shot output. *1
 Y12   PROCESSING FAIL OUT: Trigger processing abnormal end output
Output ON when the input marking trigger processing (such as laser radiation) did not end normally.
This will be output when the trigger processing operation including marking was stopped by an alarm or a
warning during the trigger processing. This is One-shot output. *1

   ワㄐㄕㄊ㄄ㄆ
• PROCESSING END OUT (Y11) and PROCESSING FAIL OUT (Y12) indicate that the marking processing
  has ended. They do not mean whether the marking quality is normal or abnormal.
 Y13   RESERVE: System reservation
Do not connect externally.
 Y14   WARNING OUT
Output OFF at warning occurrence.
Refer to “Error Indication” (P.201) for contents of warning.
 Y15   ALARM OUT
Output OFF at alarm occurrence. When an alarm occurs, laser pumping turns OFF.
Refer to “Error Indication” (P.201) for contents of alarm.


88                                                  ME-LPRF-SM-11

---

## หน้า 89

No.        Name and description
 Y16        INTERLOCK 1 MONITOR: Interlock 1 monitoring
 Y17        INTERLOCK 1 MONITOR COM.: Interlock 1 monitoring common
 Y18        INTERLOCK 2 MONITOR: Interlock 2 monitoring
 Y19        INTERLOCK 2 MONITOR COM.: Interlock 2 monitoring common
INTERLOCK 1 MONITOR (Y16 - Y17) monitors the contact status of INTERLOCK 1 (X16 - X17). INTERLOCK
2 MONITOR (Y18 - Y19) monitors the contact status of INTERLOCK 2 (X18 - X19). For details, refer to “4-4-3
Interlock terminal rating and I/O circuit” (P.100).
   State of INTERLOCK terminals            Operation of INTERLOCK MONITOR terminals
   X16 - X17: OPEN                                  Y16 - Y17: CLOSE
   X16 - X17: CLOSE (Short-circuited)                        Y16 - Y17: OPEN
   X18 - X19: OPEN                                  Y18 - Y19: CLOSE
   X18 - X19: CLOSE (Short-circuited)                        Y18 - Y19: OPEN
Interlock monitor is switched open and closed with a delay of approx. 50ms with reference to each interlock
input as shown below.
   CLOSE
   INTERLOCK(+) - INTERLOCK(-)
   (X16 - X17, X18 - X19)
   OPEN
   50ms                    50ms
   CLOSE
 INTERLOCK MONITOR - INTERLOCK MONITOR COM.
   (Y16 - Y17, Y18 - Y19)
   OPEN


 Y20        LASER SUPPLY OUT
Output ON during LASER SUPPLY IN (X6) is ON including the preparing time of the laser pumping.
To show the on/off state of the laser supply by using the external warning light or other indicator, connect this
terminal to them.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Use LASER STANDBY OUT (Y6) for the confirmation of laser pumping completion.


*1 : Set the output time of the one-shot output on the system settings screen of Laser Marker NAVI smart. The setting
range is 2 to 510ms. The initial setting value is 40ms. One-shot output time has a small margin of error for the setting
value.


ME-LPRF-SM-11                                                           89

---

## หน้า 90

 Laser marker operation when functions for safety measures are input
 If INTERLOCK (X16, X17, X18, X19) or REMOTE INTERLOCK IN (X20) is opened, regardless laser emission ON/OFF
 status, the laser is powered OFF and the shutter is closed.
 The operation behavior of LASER STOP IN (X10, X11) varies depending on the laser emission ON/OFF status.

  Safety function                      Laser marker operation                Release method              Remarks
  INTERLOCK 1 (X16, X17)                • Laser Pumping: OFF                 Close both                  The power supply of
  INTERLOCK 2 (X18, X19)                • Internal Shutter: CLOSE            INTERLOCK 1 and             laser source is shut
• Status: Alarm E400, E401 *1        INTERLOCK 2                 down by the contactor
   connections                 operation (hardware
   respectively and input      control).
   alarm reset.


  LASER STOP IN (X10, X11)             Opened during laser emission          Close LASER STOP IN         The power supply of
• Laser Pumping: OFF                  connection and input        laser source is shut
• Internal Shutter: CLOSE             alarm reset.                down through the
• Status: Alarm E402                                              internal circuit by the
   software control.
Opened at non-emitting with           Close LASER STOP IN
opened shutter                        connection.
 • Laser Pumping: Hold ON
 • Internal Shutter: CLOSE
 • Status: Warning E600
  REMOTE INTERLOCK IN (X20)             • Laser Pumping: OFF                 Close REMOTE
• Internal Shutter: CLOSE            INTERLOCK IN
• Status: Alarm E405, E503 *1        connection and input
   alarm reset.


 *1 : The error will not occur if the shutter is closed (laser is not radiating) with the PC configuration software control
enabled.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For the alarm of the interlock functions controlled by I/O signals REMOTE INTERLOCK IN, INTERLOCK 1 and
   INTERLOCK 2, you can select when an alarm should be detected from “Activate always under remote mode” or
   “Deactivate while shutter closed”. Configure it in “System settings” > “Operation/information” > “INTERLOCK alarm
   detection”.


90                                                         ME-LPRF-SM-11

---

## หน้า 91

4-3 Signals and Details of I/O Connector
The I/O connector is loaded with the input/output for data setting such as selecting a number and the input/output for the
specific functions.

 List of signals
 No.        Name                                                 No.        Name
 1          IN COM. 2                                            27         OUT COM. 2
Input common 2                                                  Output common 2
 2          SET IN                                               28         SET OK OUT
 3          D0 IN                                                29         DATE GAP OUT
 4          D1 IN                                                30         COUNT END A OUT
 5          D2 IN                                                31         COUNT END B OUT
 6          D3 IN                                                32         COUNT END C OUT
 7          D4 IN                                                33         COUNT END D OUT
 8          D5 IN                                                34         CHECK OK OUT
 9          D6 IN                                                35         CHECK NG OUT
 10         D7 IN                                                36         TIMING WAIT OUT
 11         D8 IN                                                37         SCRIPTING OUT
 12         D9 IN                                                38         DATA WAIT OUT
 13         D10 IN
39         SHUTTER OPEN OUT
 14         D11 IN
40         LASING OUT
 15         D12 IN
 16         D13 IN
 17         D14 IN
 18         D15 IN
 19         SELECT 0 IN
 20         SELECT 1 IN
 21         SELECT 2 IN
 22         TIME HOLD IN
 23         GUIDE IN
Guide laser radiation input

 24         TIMING IN
 25         RESERVE
 26         System reservation


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• IN COM. 1, OUT COM. 1 of the I/O terminal block and IN COM. 2, OUT COM. 2 of the I/O connector are independent.
  If you use the I/O connector terminal, connect input common/output common of the I/O terminal block and the I/O
  connector to power supply respectively.
• Do not connect anything to RESERVE terminals.
• For the pin arrangement of the I/O connector, refer to “4-1 I/O Interface Specification” (P.82).


ME-LPRF-SM-11                                                         91

---

## หน้า 92

 Input signal operation on the I/O connector
ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The ON/OFF listed in this section refers to the ON/OFF operations. It does not refer to the voltage level (High/Low).

  No.        Name and description
  1          IN COM. 2: Input common 2
The common terminal for each input of the I/O connector.
For NPN connection, this terminal is connected to the “+ (plus)” side of power which is used for control. For
PNP connection, this terminal is connected to the “- (minus)” side of power which is used for control.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• IN COM. 1, OUT COM. 1 of the I/O terminal block and IN COM. 2, OUT COM. 2 of the I/O connector are
  independent.
  If you use the I/O connector terminal, connect input common/output common of the I/O terminal block and
  the I/O connector to power supply respectively.
• For details on the connection, refer to “4-5-2 Connecting common terminals” (P.102).

  2          SET IN
Turn ON this signal when executing the input of D0 IN to D15 IN (No.3 to 18) and SELECT 0 IN to SELECT 2
IN (No.19 to 21).
Turn ON SET IN with maintaining the input status of D0 IN to D15 IN and SELECT 0 IN to SELECT 2 IN. The
input operation is executed at the timing of the edge of turning ON.
SET IN is required to control the following operations by I/O.
 • Select file number
 • Correct the count-up/count-down value of the counter function
 • Reset the count value of the counter function
 • Switch marking characters of the registered characters via I/O
 • Switch marking position of the external offset function
  3 to 18    D0 IN to D15 IN : Number input
Set the number for one of the following targets selected at SELECT 0 IN to SELECT 2 IN (No.19 to 21).
q File No.
w Count-up value correction
e Count-down value correction
r Counter number to reset
t Data number for the registered characters/external offset function
q File No. (SELECT 0 IN to SELECT 2 IN: All OFF)
   Input when changing the file number of 0 to 9999.
   Specify the file number in the binary system as D0 to D15 and turn ON SET IN (No.2).
   Indicate values in the binary system as ON/OFF of D0 to D15 with D0 being the lowest digit value.

Example: When selecting the file No. 618
Select “0000 0010 0110 1010”, which represents 618 in a 16-bit binary system, by specifying ON/OFF of
D0 to D15 as shown in the below table.
   Terminal   File No. (binary)       Input           Terminal    File No. (binary)        Input
   D0             0                OFF                D8              0                 OFF
   D1             1                 ON                D9              1                  ON
   D2             0                OFF               D10              0                 OFF
   D3             1                 ON               D11              0                 OFF
   D4             0                OFF               D12              0                 OFF
   D5             1                 ON               D13              0                 OFF
   D6             1                 ON               D14              0                 OFF
   D7             0                OFF               D15              0                 OFF
￼


92                                                       ME-LPRF-SM-11

---

## หน้า 93

No.   Name and description

w Count-up value correction (SELECT 1 IN: ON)
e Count-down value correction (SELECT 0 IN, SELECT 1 IN: ON)
  Input this number when you change the next marking value of the counter function. The counter value
  is specified by the step times of count-up or count-down. The step value indicates a value to increase or
  decrease per one counting-up or counting-down.
  Specify the count-up/count-down with SELECT 0 IN to SELECT 2 IN.
  Specify the target counter number and step times as D0 to D15 and turn ON SET IN (No.2).
   • How to select the counter number:
   Select a value from D0 to D7 for the counter number to correct the count-up/count-down value.
   The counter No. 0 to 3 is assigned at D0 to D3 and the common counter No. 16 to 19 is assigned at D4
   to D7 respectively.
   In case two or more counter numbers are specified, counter values of all the specified counter numbers
   are changed.
   • How to specify the step times:
   Specify a value in D8 to D15 for the step times of count-up or count-down in the binary system. Indicate
   values in the binary system as ON/OFF of D8 to D15 with D8 being the lowest digit value.

Example: Count up or count down the counter of the counter number 3 by two steps
• Turn ON D3 which represents the counter number 3.
• Select “0000 0010”, which represents the step times 2 in a 8-bit binary system, by specifying ON/OFF
  of D8 to D15 as shown in the below table.
   D0 to D7: Counter No. 0 to 3, 16 to 19                   D8 to D15: Step times
   Terminal     Counter No.        Input                    Terminal     Step times (binary)       Input
   D0            0              OFF                         D8                0                 OFF
   D1             1             OFF                         D9                1                  ON
   D2             2             OFF                        D10                0                 OFF
   D3             3              ON                        D11                0                 OFF
   D4            16             OFF                        D12                0                 OFF
   D5            17             OFF                        D13                0                 OFF
   D6            18             OFF                        D14                0                 OFF
   D7            19             OFF                        D15                0                 OFF
   Counter No. 16 to 19 are the common counters you can use with all the files.

r Counter No. to reset (SELECT 2 IN: ON)
  Input this number when you restore the present counter value to the initial value for files with the counter
  function applied.
  Specify the target counter number as D0 to D15 and turn ON SET IN (No.2).
   • How to select the counter number:
   Select the counter number to reset from D0 to D15.
   The following counter numbers are assigned to D0 to D15 respectively.
   D0 to D3: Counter No. 0 to 3
   D4 to D7: Common Counter No. 16 to 19
   D8 to D11: Counter No. 4 to 7
   D12 to D15: Common Counter No. 20 to 23
   In case two or more counter numbers are specified, all counters specified are reset.

Example: When the counter No. 0 to 3 are reset.
Turn ON D0, D1, D2, and D3 which represent the counter No. 0, 1, 2, and 3.
D0 to D7: Counter No. 0 to 3, 16 to 19               D8 to D15: Counter No. 4 to 7, 20 to 23
   Terminal      Counter No.         Input                 Terminal     Counter No.        Input
   D0             0                ON                      D8             4             OFF
   D1             1                ON                      D9             5             OFF
   D2             2                ON                     D10             6             OFF
   D3             3                ON                     D11             7             OFF
   D4             16              OFF                     D12            20             OFF
   D5             17              OFF                     D13            21             OFF
   D6             18              OFF                     D14            22             OFF
   D7             19              OFF                     D15            23             OFF
Counter Nos. 16 to 23 are the common counters you can use with all the files.


ME-LPRF-SM-11                                                       93

---

## หน้า 94

No.   Name and description

t Data number to switch when using the registered characters/external offset function (SELECT 0 IN: ON)
  The registered characters/external offset function is a function that switches marking characters (registered
  characters) or the position (external offset) using the input terminal D0 to D15. Configure the character or
  coordinate patterns to the data number corresponding to D0 to D15 in advance. Specify which pattern you
  will mark from D0 to D15.
  Specify the data number in the binary system as D0 to D15 and turn ON SET IN (No.2).
  The data numbers corresponding to D0 to D15 are defined as follows according to the settings.
   I/O input condition settings *       Terminal                Data number target           Data number
   Registered characters: 4-bit × 4       D0 to D3            Registered character table 0         0 to 15
   D4 to D7            Registered character table 1         0 to 15
   D8 to D11           Registered character table 2         0 to 15
   D12 to D15           Registered character table 3         0 to 15
   Registered characters: 8-bit × 2       D0 to D7            Registered character table 0        0 to 255
   D8 to D15           Registered character table 1        0 to 255
   External offset: Lower 4 bits          D0 to D3                  External offset                0 to 15
   External offset: Lower 8 bits          D0 to D7                  External offset               0 to 255
   External offset: Lower 10 bits         D0 to D9                  External offset              0 to 1023
          * You can also use the registered characters via I/O together with the external offset function. If you use
            the same terminal for both the registered characters and external offset at this time, the input status will
            be reflected to the data number of both functions.

Example: Specify data number 15 when using lower 8 bits
Select “0000 1111”, which represents 15 in a 8-bit binary system, by specifying ON/OFF of D0 to D7 as
shown in the below table. (D0 is the lowest digit number.)
D0 to D7: Data number of registered characters/external offset (the lower 8 bits are used)
   Terminal          Data number (binary)            Input
   D0                     1                        ON
   D1                     1                        ON
   D2                     1                        ON
   D3                     1                        ON
   D4                     0                       OFF
   D5                     0                       OFF
   D6                     0                       OFF
   D7                     0                       OFF


94                                                ME-LPRF-SM-11

---

## หน้า 95

No.        Name and description
19 to 21   SELECT 0 IN to SELECT 2 IN
With SELECT 0 IN to SELECT 2 IN, the setting target of D0 IN to D15 IN and Guide laser indication target
are specified.
 • Select the setting target of D0 IN to D15 IN
   Specify SELECT 0 IN to SELECT 2 IN corresponding to the setting target shown below. Keeping the input
   of SELECT 0 IN to SELECT 2 IN and D0 IN to D15 IN (No.3 to 18), turn ON SET IN (No.2).
   Setting target of D0 IN to D15 IN       SELECT 0 IN       SELECT 1 IN       SELECT 2 IN
   File No.                                         OFF               OFF               OFF
   Count up value correction                        OFF               ON                OFF
   Count down value correction                      ON                ON                OFF
   Counter number to reset                          OFF               OFF                ON
   Data number of registered characters/
   ON                OFF               OFF
   external offset


• Select guide laser indication target
  Specify SELECT 0 IN to SELECT 2 IN corresponding to the indication target of guide laser as shown
  below. Keeping the input of SELECT 0 IN to SELECT 2 IN, turn ON GUIDE IN (No.23).
   Indication by guide laser        SELECT 0 IN        SELECT 1 IN      SELECT 2 IN
   Work distance                             OFF               OFF               OFF
   Marking image                             ON                OFF               OFF
   Marking field                             OFF               ON                OFF
   Masked objects                            ON                ON                OFF

22         TIME HOLD IN: Time/date hold input
Performs marking of date and lot, reflecting the time when the input is turned ON.
While this input is turned on, the laser marker retains the time and date of the system clock at the point when
the input was turned ON, then it marks the functional characters for current date, expiry date, and lot.
TIME HOLD IN is available even when the remote mode is turned off.
If TIME HOLD IN is turned ON when powering on the laser marker, it retains the system startup time.
23


GUIDE IN: Guide laser radiation input
The guide laser irradiates while the input is turned ON. (Up to one minute)
Determine the guide laser radiation details by the combination of SELECT 0 IN to SELECT 2 IN (No.19 to
No.21). Keep the input state of SELECT 0 IN to SELECT 2 IN while GUIDE IN is turned ON.
This terminal is available when the guide laser control method is set to I/O at the system settings of Laser
Marker NAVI smart.
Input this terminal with the shutter closed.


24         TIMING IN
This is the terminal you will use when the link control function with the image checker is configured.
Turn this terminal ON when you instruct the operation timing to the laser marker or to the target device
controlled by the link function. Starts the link control processing by edge of input ON.
Input this terminal within 60 seconds from turning ON of TIMING WAIT OUT (No.36).
For details, refer to “6-1 Link Control with Image Checker” (P.136).
25, 26     RESERVE: System reservation
Do not connect externally.


ME-LPRF-SM-11                                                         95

---

## หน้า 96

 I/O connector output signal operation
ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The ON/OFF listed in this section refers to the ON/OFF operations. It does not refer to the voltage level (High/Low).

  No.        Name and description

  27         OUT COM. 2: Output common 2
The common terminal for each output of the I/O connector.
For NPN connection, this terminal is connected to the “- (minus)” side of power which is used for control. For
PNP connection, this terminal is connected to the “+ (plus)” side of power which is used for control.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• IN COM. 1, OUT COM. 1 of the I/O terminal block and IN COM. 2, OUT COM. 2 of the I/O connector are
  independent.
  If you use the I/O connector terminal, connect input common/output common of the I/O terminal block and
  the I/O connector to power supply respectively.
• For details on the connection, refer to “4-5-2 Connecting common terminals” (P.102).

  28         SET OK OUT: Setting completion output
The output turns ON when the setting has completed for SET IN (No.2).
Output ON when number inputs such as file No. and counter reset are set. This is one-shot output. *1

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• SET OK OUT is a response to SET IN (No.2). To verify if the laser marker has entered into the marking
  ready state (trigger input acceptance state), check by READY OUT (Y5).

  29         DATE GAP OUT: Date gap output
This terminal turns ON when the date of the system clock has changed (passed the midnight) while TIME
HOLD IN (No.22) is ON.
This is the output to notify you that the laser marker is marking the different date from that of the system clock
while TIME HOLD IN is turned ON.

  30         COUNT END A OUT: Counter end A output
  31         COUNT END B OUT: Counter end B output
  32         COUNT END C OUT: Counter end C output
  33         COUNT END D OUT: Counter end D output
Each output turns ON when the count value of the specified counter numbers has marked the end value.
Assign the counter No. to COUNT END A OUT to COUNT END D OUT in system settings of Laser Marker
NAVI smart.
The counter end output remains turned ON with the shutter open until the next marking trigger is input. When
you close the shutter, the counter end output turns OFF.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• As the default setting, counter No. 0 to 3 are assigned to COUNT END A OUT to COUNT END D OUT
  respectively.
• The counter value will not be updated at test marking.
• It starts counting from the initial value again once the counter reaches to the end value.
• The counter end output is disabled when “counter update per step” is configured at Step & repeat.
• The counter end output is available when you set the functional character of the counter in a string of the
  objects such as character or barcode.


96                                                       ME-LPRF-SM-11

---

## หน้า 97

No.        Name and description

 34         CHECK OK OUT: Check OK output
 35         CHECK NG OUT: Check NG output


These outputs are available when the following functions are configured. This is One-shot output. *1
 • When the link control function with the image checker is configured:
   Check results by the linked image checker, such as a camera or a code reader are output.
   • CHECK OK OUT: Output when the check result is positive
   • CHECK NG OUT: Output when the check result is negative

• When TARGET DETECTION IN (X7) is used:
  According to the ON/OFF state of TARGET DETECTION IN (X7), CHECK OK OUT (No.34) or CHECK NG
  OUT (No.35) turns on for one-shot time after the trigger processing (lasing) operation.
  • CHECK OK OUT: Output when TARGET DETECTION IN (X7) turns ON for more than 1ms during
   lasing operation.
  • CHECK NG OUT: Output when TARGET DETECTION IN (X7) did not turn ON during lasing operation.


 36         TIMING WAIT OUT: Timing wait output
This is the terminal you will use when the link control function with the image checker is configured.
This terminal turns ON when the laser marker enters into the link function operation trigger (TIMING IN)
standby state.
Input TIMING IN (No.24) after making sure that this terminal is turned ON.

 37         SCRIPTING OUT: Scripting output
This is the terminal you will use when the link control function with the image checker is configured.
This terminal turns ON while executing scripting (laser marker's internal processing to perform the link control
of the external devices) upon receiving TRIGGER IN (X5). The output time of SCRIPTING OUT does not
include the laser radiation time.

 38         DATA WAIT OUT
When using either of the following functions, this terminal turns ON to notify the waiting status of the data
input. Confirm this output is ON and then input the corresponding data.
 • Characters specified by SIN command: Waiting for character input by SIN command
 • External offset function with “Using SEO command” : Waiting for marking position input by SEO command
 • Registered characters via I/O: Waiting for registered characters input and SET IN (No.2) by I/O
 • External offset function: Waiting for marking position input and SET IN (No.2) by I/O

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• After inputting the required data, this output turns OFF and then READY OUT (Y5) turns ON.


 39         SHUTTER OPEN OUT
Output ON during internal shutter of the head is open.
There is a delay time of around 200ms to max. 1 second from turning ON/OFF of SHUTTER IN (X8) to
turning ON/OFF of SHUTTER OPEN OUT.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• To monitor the shutter operation for the safety control system, use SHUTTER CLOSE 1 OUT (Y8) and
  SHUTTER CLOSE 2 OUT (Y9).
• The output timing of SHUTTER OPEN OUT (No.39), SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
  CLOSE 2 OUT (Y9) has a margin of error.


 40         LASING OUT: Laser radiation output
Output ON during laser radiation.
In case the lasing time is shorter than the set one-shot output time, the lasing output remains ON until the
one-shot output time ends. *1

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Use PROCESSING END OUT (Y11) and PROCESSING FAIL OUT (Y12) for the confirmation of marking
  completion.


*1 : Set the output time of the one-shot output on the system settings screen of Laser Marker NAVI smart. The setting range is
2 to 510ms. The initial setting value is 40ms. One-shot output time has a small margin of error for the setting value.


ME-LPRF-SM-11                                                       97

---

## หน้า 98

4-4 I/O Rating/Circuit

 4-4-1 Input rating and input circuit
 This section shows the input rating and the input circuit for the I/O terminal block input and the I/O connector input. Note
 that the input rating and circuit of INTERLOCK terminals (X16, X17, X18, X19) are different from those shown here. Refer to
 “4-4-3 Interlock terminal rating and I/O circuit” (P.100).

  Input rating
   Item                             I/O terminal block input, I/O connector input
   Input form                         Bidirectional photo coupler insulation input
   Input ON voltage              Difference of voltages between input and input common: 19V or more
   Input OFF voltage          Difference of voltages between input and input common: No more than 3V or open
Rated input voltage                                                 +24V DC+/-10%


  Input circuit
Internal circuit


INPUT


Input common
(IN COM.)

 ￼
  NPN sample                                                          PNP sample
   External power
   supply
   Input common                                                                            (+24V DC)
   External power
   (IN COM.)           supply                                                              PNP open
INPUT


(+24V DC)                              Each input                   collector output
   INPUT


Each input
   NPN open                              Input
   collector output                      common
   (IN COM.)


   ワㄐㄕㄊ㄄ㄆ
• This product supports both the NPN transistor output and the PNP transistor output. However, the wiring from I/O
  terminal block and the I/O connector respectively cannot be used as NPN/PNP mixed. Operate the product after
  selecting either NPN or PNP.
• Do not short-circuit 24V OUT (X1, Y3) and 0V OUT (Y1, X3). Also, do not short-circuit IN COM. 1 (X2) and OUT COM.1
  (Y2, X12). Starting the laser marker with these terminals short-circuited will cause the laser marker to malfunction.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Respective inputs are bidirectional photo-coupler inputs. The regulation for input ON is based on the ON status of photo-
  coupler.
• IN COM. 1, OUT COM. 1 of the I/O terminal block and IN COM. 2, OUT COM. 2 of the I/O connector are independent.
  If you use the I/O connector terminal, connect input common/output common of the I/O terminal block and the I/O
  connector to power supply respectively.
• DC 2-wire sensor cannot be connected to any input.


98                                                             ME-LPRF-SM-11

---

## หน้า 99

4-4-2 Output rating and output circuit
This section shows the output rating and the output circuit for the I/O terminal block output and the I/O connector output.
Note that the output rating and circuit of INTERLOCK MONITOR terminals (Y16, Y17, Y18, Y19) are different from those
shown here. Refer to“4-4-3 Interlock terminal rating and I/O circuit” (P.100).

 Output rating
   Item                            I/O terminal block output                      I/O connector output
   Output form                                     NPN/PNP Photo-coupler (insulated output)
Protection function for short-circuit                                                None
   Max. output current                                50mA                                        20mA
   Max. applied voltage                                                      +30V DC
   Residual voltage                                                    +2.0V DC or less


 Output Circuit


OUTPUT
Internal circuit


Output common
(OUT COM.)


 NPN Sample                                                                    PNP Sample

   External power                                                      External power
   supply                            Output common                     supply
   Load
Each output                          +30V DC MAX                       (OUT COM.)                        +30V DC MAX
   OUTPUT
 OUTPUT


   Each output
Output common
(OUT COM.)                                                                                        Load


I: I/O terminal block output        MAX 50mA
  I/O connector output              MAX 20mA

ワㄐㄕㄊ㄄ㄆ
• This product supports both the NPN transistor output and the PNP transistor output. However, the wiring from I/O terminal
  block and the I/O connector respectively cannot be used as NPN/PNP mixed. Operate the product after selecting either
  NPN or PNP.
• Do not short-circuit 24V (X1, Y3) and 0V (Y1, X3). Also, do not short-circuit IN COM. 1 (X2) and OUT COM.1 (Y2, X12).
  Starting the laser marker with these terminals short-circuited will cause the laser marker to malfunction.
• The applied voltage and input/output current to each terminal must not exceed each maximum value shown above.
  Exceeding the maximum applied voltage and the maximum output current will cause the laser marker to malfunction.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Respective outputs are photo-coupler outputs. The regulation for output ON is based on the ON status of photo-coupler.
• IN COM. 1, OUT COM. 1 of the I/O terminal block and IN COM. 2, OUT COM. 2 of the I/O connector are independent.
  If you use the I/O connector terminal, connect input common/output common of the I/O terminal block and the I/O
  connector to power supply respectively.


ME-LPRF-SM-11                                                          99

---

## หน้า 100

4-4-3 Interlock terminal rating and I/O circuit
 This section shows the following interlock terminals and I/O circuit loaded onto the I/O terminal block.
  Interlock input terminals:          Interlock monitoring terminals:
  INTERLOCK 1(+) (X16)                INTERLOCK 1 MONITOR (Y16)
  INTERLOCK 1(-) (X17)                INTERLOCK 1 MONITOR COM. (Y17)
  INTERLOCK 2(+) (X18)                INTERLOCK 2 MONITOR (Y18)
  INTERLOCK 2(-) (X19)                INTERLOCK 2 MONITOR COM. (Y19)


ワㄐㄕㄊ㄄ㄆ
 • INTERLOCK terminals (X16, X17 and X18, X19) are connected to the operating coil of the internal contactor in the
   controller. Connect INTERLOCK (+) and INTERLOCK (-) with the non-voltage contact (dry contact) such as a relay or a
   switch. Do not connect with the voltage contact such as a transistor.


Laser marker internal circuit

ヌビフヷチュヤ

   Pin X16 INTERLOCK 1 (+)
Laser oscillator                  Contactor
power                                                        Pin X17 INTERLOCK 1 (-)
   ヒブㄎモチ


   Contact
   Pin Y16 INTERLOCK 1 MONITOR            capacity:
   Pin Y17 INTERLOCK 1 MONITOR COM.       +24V DC
   1A
ヌビフヷチュヤ

   Pin X18 INTERLOCK 2 (+)
Contactor
   Pin X19 INTERLOCK 2 (-)
   ヒブㄎモチ


   Contact
Pin Y18 INTERLOCK 2 MONITOR            capacity:
Pin Y19 INTERLOCK 2 MONITOR COM.       +24V DC
   1A

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For the connection examples of the interlock terminals, refer to “4-5-4 Connection example of interlock terminals and
   laser stop terminals” (P.103).
 • INTERLOCK 1(+) (X16) and INTERLOCK 2(+) (X18) are connected to the interlock dedicated power supply +24DVC
   internally. This power supply is independent from 24V OUT (X1, Y3) in I/O terminal.


100                                                         ME-LPRF-SM-11

---

## หน้า 101

4-5 Connecting I/O Terminal Block

WARNING                         • Make sure that the power is turned OFF at wiring.


4-5-1 Factory default wiring
The following terminals are connected by short bars at the factory default. Remove these short bars when you connect
them to an external device.


   X1        Y1
   X2        Y2
   X3        Y3
   X4        Y4
   X5        Y5
   X6        Y6
   X7        Y7
   X8        Y8
   X9        Y9
   LASER STOP IN
   X10       Y10
Short-circuited   LASER STOP IN
   X11       Y11
Short-circuited   OUT COM. 1
   X12       Y12
   X13       Y13
   X14       Y14
   Short-circuited
   X15       Y15
   INTERLOCK 1(+)
   X16       Y16
Short-circuited   INTERLOCK 1(-)
   X17       Y17
   INTERLOCK 2(+)
   X18       Y18
Short-circuited   INTERLOCK 2(-)
   X19       Y19
   X20       Y20
   REMOTE INTERLOCK IN
   I/O terminal block


ワㄐㄕㄊ㄄ㄆ
 • Do not short-circuit 24V OUT (X1, Y3) and 0V OUT (X3, Y1). Also, do not short-circuit IN COM. 1 (X2) and OUT COM.1
   (Y2, X12). Starting the laser marker with these terminals short-circuited will cause the laser marker to malfunction.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • To enable the laser radiation, connect IN COM. 1 (X2) and OUT COM. 1 (Y2) respectively to the internal of external
   power supply. Refer to “4-5-2 Connecting common terminals” (P.102).
 • The following terminals of the I/O terminal block are the common terminals connected internally.
• X1 and Y3: 24V OUT
• X3 and Y1: 0V OUT
• Y2 and X12: OUT COM. 1


ME-LPRF-SM-11                                                    101

---

## หน้า 102

4-5-2 Connecting common terminals
 Connect IN COM. 1 (X2) and OUT COM. 1 (Y2) respectively to the power supply for input and output.
 For the I/O connector terminals, connect IN COM. 2 and OUT COM. 2 respectively to the power supply in the same
 manner.

Use the internal power                       Use the external power
IN COM. 1 (X2)        -    24V OUT (X1)      IN COM. 1 (X2)        -    24V
   NPN connection
OUT COM. 1 (Y2)       -    0V OUT (Y1)       OUT COM. 1 (Y2)       -    0V
IN COM. 1 (X2)        -    0V OUT (X3)       IN COM. 1 (X2)        -    0V
   PNP connection
OUT COM. 1 (Y2)       -    24V OUT (Y3)      OUT COM. 1 (Y2)       -    24V

ワㄐㄕㄊ㄄ㄆ
  • Do not short-circuit 24V OUT (X1, Y3) and 0V OUT (Y1, X3). Also, do not short-circuit IN COM. 1 (X2) and OUT COM. 1
(Y2, X12). Starting the laser marker with these terminals short-circuited will cause the laser marker to malfunction.
  • Do not mix up with the external and internal power supplies.
  • Do not mix the NPN and PNP connecting patterns.
  • When using the internal power supply (X1, X3, Y1, Y3), the total current of the power supply for the external device and
the consumption current for the I/O control should be less than 300mA.
  • If you control the laser marker by the external power such as PLC, do not connect anything to the internal power 24V
OUT (X1, Y3) or 0V OUT (X3, Y1) of the I/O terminal block. If a short bar is installed, remove it.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • IN COM. 1 and OUT COM. 1 of the I/O terminal block are independent from IN COM. 2 and OUT COM. 2 of the I/O
connector. If you use the I/O connector terminal, connect input common/output common of the I/O terminal block and the
I/O connector to power supply respectively.

  To use the internal power (the I/O terminal block is not connected to an external control device)
 NPN connection                                                    PNP connection

24V OUT         X1           Y1    0V OUT                                   X1         Y1
 Short-                                                  Short-
 circuited IN COM. 1                          OUT COM. 1 circuited IN COM. 1                             OUT COM. 1
  X2           Y2                                             X2         Y2
   Short-    0V OUT                               24V OUT      Short-
  X3           Y3                circuited                    X3         Y3                  circuited
  X4           Y4                                             X4         Y4
  X5           Y5                                             X5         Y5
I/OX6        Y6
   terminal block                                         I/OX6        Y6
   terminal block

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • The dotted line indicates that the terminals are connected inside of the laser marker.
  • When connecting the internal power supply to IN COM. 1 and OUT COM. 1, use the attached short bars.


  To use the external power (connected to an external control device such as PLC)
 NPN connection                                                    PNP connection
   OUT COM. 1                                    IN COM. 1
0V                                                                                                 0V

   X1         Y1                              X1        Y1
   IN COM. 1                                                                     OUT COM. 1
24V                    X2         Y2                              X2        Y2                    24V

External power             X3         Y3                              X3        Y3                 External
supply                     X4         Y4                              X4        Y4                 power supply
   I/OX5        Y5
   terminal block                           I/OX5
   terminal Y5
   block


102                                                       ME-LPRF-SM-11

---

## หน้า 103

4-5-3 Sensor connection example
 Use the sensor as a marking trigger (operate the sensor by the internal power)
NPN connection                                                   PNP connection

Sensor                                                           Sensor
24V OUT        X1          Y1     0V OUT                        24V OUT          X1         Y1
 VDD                                                              VDD
IN COM. 1                         OUT COM. 1                    IN COM. 1                            OUT COM. 1
 OUT                         X2          Y2                       OUT                          X2         Y2
0V OUT                                                          0V OUT                               24V OUT
  0V                         X3          Y3                        0V                          X3         Y3
   X4          Y4                                                    X4         Y4
TRIGGER IN                                                        TRIGGER IN
   X5          Y5                                                    X5         Y5
   X6          Y6                                                    X6         Y6
   X7          Y7                                                    X7         Y7
   I/OX8
   terminal block
   Y8                                                   I/OX8
   terminal block
   Y8
   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• The dotted line indicates that the terminals are connected inside of the laser marker.


4-5-4 Connection example of interlock terminals and laser stop terminals
The following terminals are used to stop the laser radiation or disable the laser radiation temporarily.
When any of these terminals are disconnected, the laser radiation will be disabled and laser marker becomes in alarm or
warning status.
 LASER STOP IN (X10)               ―     OUT COM. 1 (X12)
 LASER STOP IN (X11)               ―     OUT COM. 1 (X12)
 INTERLOCK 1(+) (X16)              ―     INTERLOCK 1(-) (X17)
 INTERLOCK 2(+) (X18)              ―     INTERLOCK 2(-) (X19)
 REMOTE INTERLOCK (X20)            ―     OUT COM. 1 (X12)

   X7         Y7
   X8         Y8
   X9         Y9
*1             LASER STOP IN
   X10       Y10
*1             LASER STOP IN
   X11       Y11
   X12       Y12
   OUT COM. 1
   X13       Y13
   X14       Y14
*2             INTERLOCK 1(+)
   X15       Y15                                            Input to PLC
   N.O.                                                        INTERLOCK 1 MONITOR
   X16       Y16
   INTERLOCK 1(-)                                    INTERLOCK 1 MONITOR COM.                Monitor 1
   X17       Y17
*2             INTERLOCK 2(+)                                    INTERLOCK 2 MONITOR
   X18       Y18
   N.O.      INTERLOCK 2(-)                                    INTERLOCK 2 MONITOR COM.                Monitor 2
   X19       Y19
   X20       Y20
*1          REMOTE INTERLOCK IN
   I/O terminal block

*1 : Connect stop terminals such as a laser stop switch between LASER STOP IN and OUT COM. 1 as well as REMOTE
INTERLOCK IN and OUT COM. 1 respectively.
*2 : Connect non-voltage contact such as a relay output terminal including a safety device door, switches, safety relay
units between INTERLOCK 1(+) (X16) and INTERLOCK 1(-) (X17) as well as between INTERLOCK 2(+) (X16) and
INTERLOCK 2(-) (X19) respectively.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• For details on the I/O circuit of the interlock terminals, refer to “4-4-3 Interlock terminal rating and I/O circuit” (P.100).
• For details on the operation of input terminals for safety measurement, refer to “Laser marker operation when functions
  for safety measures are input” (P.90).


ME-LPRF-SM-11                                                        103

---

## หน้า 104

4-5-5 Checking the I/O terminal status
 Check the I/O connection status and its operation using the functions in the PC configuration software “Laser Marker NAVI
 smart” Operation procedure.

  I/O monitor
 I/O monitor indicates ON/OFF status of the I/O terminals on the laser marker.
 Open the I/O monitor with the following procedure.

 1.    Establish an online connection between your PC and the laser marking system.


 2.    Go to the “Monitor” screen.


 3.    Select “I/O monitor” in the ribbon. The I/O monitor appears.
                                                                                                     “I/O monitor” tool


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The input and output status of the I/O monitor is updated every 500ms.
 • There is a margin of error between the actual input/output time and the ON/OFF time displayed on the screen.


 4.    To close the “I/O monitor” dialog, select “Close” or “X”.


104                                                        ME-LPRF-SM-11

---

## หน้า 105

 Output simulation
With the output simulation you can check the output signals of the laser marker without an actual operation.
Use this function to confirm the operation of the external devices connected with the laser marker.
Output simulation starts with the following procedure.

1.     Establish an online connection between your PC and the laser marking system.


2.     Go to the “Maintenance” screen.


3.     Select “Output simulation” in the ribbon.
                                                                                                          “Output simulation”
                                                                                                          tool


4.     Output simulation dialog appears.
       Click the output terminal name to simulate, then the output status of the laser marker changes.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • You can use the I/O monitor and output simulation also for the control via optional network unit (EtherNet/IP or
   PROFINET).


5.     Select “Reset” to terminate the output simulation and reset the status of the output signals to the actual settings.


6.     To close the “Output simulation” dialog and terminate the simulation, select “Close” or “X”.


                                                          ME-LPRF-SM-11                                                         105

---

## หน้า 106

4-6 Basic Control Timing Chart
ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • ON/OFF on the timing chart refers to ON/OFF operations. It does not refer to the voltage level (High/Low).
 • In the following timing charts, the timing of output operation corresponding to the each input has a small delay of 0ms or
   more.


 4-6-1 Flow from startup to marking
   ON                                                                                        *1
   Key Switch
   OFF
   ON
   REMOTE IN (X4)
   OFF
   ON
   LASER SUPPLY IN (X6)
   OFF
   ON
SHUTTER ENABLE IN (X9)
   OFF
   ON (Open)
   SHUTTER IN (X8)
   OFF (Close)
   ON
   T5
   TRIGGER IN (X5)
   OFF

SYSTEM STANDBY OUT ON                          T1
   (Y7)
   OFF
   ON
   REMOTE OUT (Y4)
   OFF
   ON
   LASER SUPPLY OUT (Y20)
OFF
ON
  LASER STANDBY OUT (Y6)                            T2
OFF                                       T3               T3                        T3
ON (Close)
 SHUTTER CLOSE 1 OUT (Y8)                                                T3
 SHUTTER CLOSE 2 OUT (Y9)
   OFF (Open)
   ON (Normal)
   WARNING OUT (Y14)
   OFF (Error)
   ON (Normal)
   ALARM OUT (Y15)
   OFF (Error)
   ON
   READY OUT (Y5)                                 T4                          T4
   OFF
   ON
PROCESSING OUT (Y10)                                                                       T6
   OFF
   ON
   LASING OUT (No.40)
   OFF
   ON
 PROCESSING END OUT                                                                          T7
   (Y11)
   OFF

 *1 : Turn off the key switch with the laser pumping turned off or with the shutter closed.


106                                                      ME-LPRF-SM-11

---

## หน้า 107

Item   Time              Remarks
T1     Approx. 10 sec.   Time for system startup. Turn ON the remote mode upon verifying SYSTEM STANDBY
OUT (Y7).
T2     Approx. 7 sec.    Time for completion of laser pumping.


T3     Max. 1 sec.       There is a delay time of around 200ms to max. 1 second from turning ON/OFF of
SHUTTER IN (X8) to turning ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
CLOSE 2 OUT (Y9).
SHUTTER CLOSE 1 OUT and SHUTTER CLOSE 2 OUT will be output by the same
operation, but their output timing has a margin of error.

T4     ―                 Setup time of the laser marker to start the marking trigger processing.
• In the laser pumping completed state: Total time for shutter opening (T3) and marking
  data creation. It varies depending on the quantity of the setting data.
• When the laser pumping is not completed: Total time for shutter opening (T3) and
  marking data creation, or time for laser pumping, whichever is longer.
T5     2ms or more       Keep the ON status for 2ms or more.
T6     ―                 When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON. The output time
of PROCESSING OUT (Y10) includes the trigger delay time, marking preparation time,
laser radiation time, and processing time after marking has completed.
If you are not using the link function with external devices, output time of PROCESSING
OUT (Y10) is almost the same as the total duration of the trigger delay time and LASING
OUT (No.40).

T7     2 to 510ms        One-shot output. Set the output time on the environment setting screen.
There is a small margin of error for the setting value.


ME-LPRF-SM-11                                                      107

---

## หน้า 108

4-6-2 Shutter open/close

   ON
LASER STANDBY OUT (Y6)
   OFF
   ON
   TRIGGER IN (X5)                                                                     T3
   OFF
   ON
SHUTTER ENABLE IN (X9)
   OFF                        T1            T1                                      T1
   ON (Open)       *1                                                 *2
   SHUTTER IN (X8)
   OFF (Close)

   T1         T1             T1
   T1
   ON (Close)
SHUTTER CLOSE 1 OUT
   (Y8) OFF (Open)

   ON (Close)
SHUTTER CLOSE 2 OUT
   (Y9) OFF (Open)

   ON (Open)
SHUTTER OPEN OUT
   (No.39) OFF (Close)

   ON
   READY OUT (Y5)                             T2         T2            T2                                  T2
   OFF
   ON
PROCESSING OUT (Y10)                                                                      T4
   OFF
   ON
 PROCESSING END OUT                                                                                   T5
   (Y11) OFF


 *1 : SHUTTER IN (X8) is accepted and the shutter opens only when SHUTTER ENABLE IN (X9) is turned on.
 *2 : If SHUTTER IN (X8) was turned off during the trigger processing, the shutter closes after the trigger processing has
completed.


   Item       Time                 Remarks
   T1         Max. 1 sec.          There is a delay time of around 200ms to max. 1 second from turning ON/OFF of
SHUTTER IN (X8) to turning ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
CLOSE 2 OUT (Y9).
The output timing of SHUTTER OPEN OUT, SHUTTER CLOSE 1 OUT and SHUTTER
CLOSE 2 OUT has a margin of error.


   T2         ―                    Total time for shutter opening (T1) and marking data creation. It varies depending on the
quantity of the setting data.
   T3         2ms or more          Keep the ON status for 2ms or more.
   T4         ―                    When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON. The output time
of PROCESSING OUT (Y10) includes the trigger delay time, marking preparation time,
laser radiation time, and processing time after marking has completed.
If you are not using the link function with external devices, output time of PROCESSING
OUT (Y10) is almost the same as the total duration of the trigger delay time and LASING
OUT (No.40).

   T5         2 to 510ms           One-shot output. Set the output time on the environment setting screen.
There is a small margin of error for the setting value.


108                                                        ME-LPRF-SM-11

---

## หน้า 109

4-6-3 Marking trigger input (to static object): Single trigger
When the trigger mode is set to “single trigger” in the file settings, one lasing operation is executed by the edge of turning
on of TRIGGER IN (X5).

   ON
READY OUT (Y5)
   OFF
   T1
   ON
TRIGGER IN (X5)                     T1                                                     T1
   OFF
   Marking
   ON
   PROCESSING OUT                                                                                                interruption
   T2                       T2
(Y10)
   OFF
   Marking
   ON
   interruption
 LASING OUT (No.40)                       T3                     T3                             T3
OFF
ON                        T4                       T4
   PROCESSING END
OUT (Y11)
   OFF

ON                                                                            T6
   PROCESSING FAIL
OUT (Y12)
   OFF

ON (Normal)
 WARNING OUT (Y14)                                                    T5
OFF (Error)

ON (Normal)
   ALARM OUT (Y15)
OFF (Error)


 Item     Time                  Remarks
 T1       2ms or more           Keep the ON status for 2ms or more.
 T2       ―                     When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON. The output time
of PROCESSING OUT (Y10) includes the trigger delay time, marking preparation time,
laser radiation time, and processing time after marking has completed.
If you are not using the link function with external devices, output time of PROCESSING
OUT (Y10) is almost the same as the total duration of the trigger delay time and LASING
OUT (No.40).

 T3       0 to 9999ms           When the trigger delay time is set in the selected file, trigger processing (lasing) operation
starts after the delay time.
 T4       2 to 510ms            This is the output to notify that the marking trigger processing completed normally. This
is One-shot output. Set the output time on the system settings screen. There is a small
margin of error for the setting value.
 T5       Approx. 3 sec.        It outputs a warning to notify that an invalid trigger was input when TRIGGER IN (X5) was
input during trigger processing. This is One-shot output. You can turn this warning off by
the settings.
 T6       2 to 510ms            If the trigger processing was stopped by an alarm or a warning, PROCESSING FAIL OUT
(Y12) turns on during the one-shot output period. PROCESSING END OUT (Y11) will not
be output at this time.


ME-LPRF-SM-11                                                          109

---

## หน้า 110

4-6-4 Marking trigger input: Continuous trigger
  Without “allow to stop halfway” setting
 When the trigger mode is set to “continuous trigger” in the file settings, lasing operation is repeated while TRIGGER IN
 (X5) is on. Without “allow to stop halfway” setting if TRIGGER IN turns OFF when the lasing operation is running, the lasing
 operation is terminated after finishing the running operation.

   ON                                                            T6
  READY OUT (Y5)
   OFF
   T1
   ON
  TRIGGER IN (X5)                                     *1             *1   *2
   OFF
   Marking
   interruption
   ON
PROCESSING OUT
   (Y10)
   OFF                          T3            T3
   T2                                                            T2
   ON
   LASING OUT
   (No.40)
   OFF

PROCESSING END ON                                                                         T4
   OUT (Y11)
   OFF

PROCESSING FAIL ON                                                                                                T7
   OUT (Y12)
   OFF
   ON (Normal)
   WARNING OUT (Y14)                                                                       T5
   OFF (Error)
   ON (Normal)
ALARM OUT (Y15)
   OFF (Error)


 *1 : If TRIGGER IN (X5) is still ON at the completion of the lasing operation, the lasing operation starts again.
 *2 : If TRIGGER IN (X5) turns OFF when the lasing operation is running, the lasing operation is terminated after finishing
the running operation.

  Item       Time                   Remarks
  T1         2 ms or more           Keep the ON status for the duration of repeating the lasing operation.
  T2         0 to 9999 ms           When the trigger delay time is set in the selected file, trigger processing (lasing) operation
starts after the delay time.
  T3         0.0 to 60.0 sec.       When the scanning interval is set, the next lasing operation starts after a lapse of the
setting period.
  T4         2 to 510 ms            This is the output to notify that the marking trigger processing completed normally. This
is One-shot output. Set the output time on the system settings screen. There is a small
margin of error for the setting value.
  T5         Approx. 3 sec.         It outputs a warning to notify that an invalid trigger was input when TRIGGER IN (X5) was
input during trigger processing. This is One-shot output. You can turn this warning off by
the settings.
  T6         ―                      Time for marking data creation. It varies depending on the quantity of the setting data. This
time is required at every marking.
  T7         2 to 510ms             If the trigger processing was stopped by an alarm or a warning, PROCESSING FAIL OUT
(Y12) turns on during the one-shot output period. PROCESSING END OUT (Y11) will not
be output at this time.


110                                                         ME-LPRF-SM-11

---

## หน้า 111

 With “allow to stop halfway” setting
When the trigger mode is set to “continuous trigger” in the file settings, lasing operation is repeated while TRIGGER IN (X5)
is on. With “allow to stop halfway” setting, the lasing operation is terminated immediately when TRIGGER IN turns OFF.

   ON                                                      T5
  READY OUT (Y5)
   OFF
   T1
   ON
  TRIGGER IN (X5)
   OFF
   Marking
   interruption
   ON
PROCESSING OUT
   (Y10)
   OFF                          T3            T3
   T2                                                             T2
   ON
   LASING OUT
   (No.40)
   OFF

PROCESSING END ON                                                                 T4
   OUT (Y11)
   OFF

PROCESSING FAIL ON                                                                                              T6
   OUT (Y12)
   OFF
   ON (Normal)
ALARM OUT (Y15)
   OFF (Error)


 Item       Time                 Remarks
 T1         2 ms or more         Keep the ON status for the duration of repeating the lasing operation.
 T2         0 to 9999 ms         When the trigger delay time is set in the selected file, trigger processing (lasing) operation
starts after the delay time.
 T3         0.0 to 60.0 sec.     When the scanning interval is set, the next lasing operation starts after a lapse of the
setting period.
 T4         2 to 510 ms          This is the output to notify that the marking trigger processing completed normally. This
is One-shot output. Set the output time on the system settings screen. There is a small
margin of error for the setting value.
When the marking operation stops halfway because TRIGGER IN turns OFF, it is treated
as normal operation end.
 T5         ―                    Time for marking data creation. It varies depending on the quantity of the setting data. This
time is required at every marking.
 T6         2 to 510 ms          If the trigger processing was stopped by an alarm or a warning, PROCESSING FAIL OUT
(Y12) turns on during the one-shot output period. PROCESSING END OUT (Y11) will not
be output at this time.


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If the executed number of lasing operation are less than the specified minimum number, warning E630 occurs after the
  marking operation.
• If TRIGGER IN signal remains ON though the executed number of lasing operation reaches the specified maximum
  number, warning E631 occurs and the subsequent lasing is canceled.


ME-LPRF-SM-11                                                         111

---

## หน้า 112

4-6-5 On-the-fly marking: Single trigger
   ON (Open)
   SHUTTER OPEN OUT
   (No.39) OFF (Close)           T1
   ON
   READY OUT (Y5)                                                   T5                                     T5
   OFF
   ON
   TRIGGER IN (X5)                               T2                                    T2
   OFF
   ON
PROCESSING OUT (Y10)
   OFF                              T3                                    T3
   ON
   LASING OUT (No.40)
   OFF
   ON
PROCESSING END OUT
   (Y11)                                                          T4                                    T4
   OFF


  Item      Time                    Remarks
  T1        ―                       Time for marking data creation. It varies depending on the quantity of the setting data.
  T2        2ms or more             Keep the ON status for 2ms or more.
  T3        ―                       Time from when TRIGGER IN (X5) is turned on till when the work piece comes to the
preset marking position.
  T4        2 to 510ms              This is the output to notify that the marking trigger processing completed normally. This is
One-shot output. Set the output time on System settings screen. There is a small margin of
error for the setting value.
  T5        ―                       Time for marking data creation.
When the next marking data is not ready during the marking operation, this is the rest time
for data creation.
When the next marking data is ready during the marking operation, this takes less than
1ms.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • If the counter is reset during on-the-fly marking operation, READY OUT (Y5) turns off momentary and there is a case
   that the next marking could not be executed due to Warning E751.


112                                                         ME-LPRF-SM-11

---

## หน้า 113

4-6-6 On-the-fly marking: Marking at regular intervals
   ON (Open)
  SHUTTER OPEN OUT
   (No.39) OFF (Close)        T1
   ON
   READY OUT (Y5)                                                                                          T5
   OFF
   ON
   TRIGGER IN (X5)                                                                                   *1
   OFF
   ON
PROCESSING OUT (Y10)
   OFF
   T2              T3                 T3
   ON
   LASING OUT (No.40)
   OFF
   ON
PROCESSING END OUT
   (Y11)                                                      T4                   T4                  T4
   OFF


*1 : If TRIGGER IN (X5) turns off when the trigger processing operation is running, on-the-fly marking at regular intervals
is terminated after finishing the running operation.

 Item     Time                 Remarks
 T1       ―                    Time for marking data creation. It varies depending on the quantity of the setting data.
 T2       ―                    Time from when TRIGGER IN (X5) is turned on till when the work piece comes to the
preset marking position.
 T3       ―                    Time it takes the workpiece to move to the setting intervals [mm].
 T4       2 to 510ms           This is the output to notify that the marking trigger processing completed normally. This is
One-shot output. Set the output time on System settings screen. There is a small margin of
error for the setting value.
 T5       ―                    Time for marking data creation.
When the next marking data is not ready during the marking operation, this is the rest time
for data creation.
When the next marking data is ready during the marking operation, this takes less than
1ms.


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If the counter is reset during on-the-fly marking operation, there is a case that the next marking could not be executed
  due to Warning E751.


ME-LPRF-SM-11                                                         113

---

## หน้า 114

4-6-7 On-the-fly marking: Multiple triggers
   ON (Open)
  SHUTTER OPEN OUT
   (No.39) OFF (Close)        T1
   ON
   READY OUT (Y5)
   OFF                              T4
   ON                                                    *1
   TRIGGER IN (X5)                            T2          T2          T2
   OFF
   ON
PROCESSING OUT (Y10)
   OFF
   T3
   T3
   T3

   T4
   ON
   LASING OUT (No.40)
   OFF
   ON
PROCESSING END OUT
   (Y11)                                                                T5       T5          T5
   OFF

 *1 : When trigger mode is set to Multiple triggers at on-the-fly marking, max. 16 triggers can be accepted while
PROCESSING OUT (Y10) is ON.

  Item     Time                 Remarks
  T1       ―                    Time for marking data creation. It varies depending on the quantity of the setting data.
  T2       2ms or more          Keep the ON status for 2ms or more.
  T3       ―                    Time from when TRIGGER IN (X5) is turned on till when the work piece comes to the
preset marking position
  T4       ―                    The total time of lasing time and preparing time for next marking is needed for the input
interval of TRIGGER IN.
If this interval is too short, warning E618 occurs and subsequent marking will be canceled.
  T5       2 to 510ms           This is the output to notify that the marking trigger processing completed normally. This is
One-shot output. Set the output time on System settings screen. There is a small margin of
error for the setting value.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • If the counter is reset during on-the-fly marking operation, READY OUT (Y5) turns off momentary and there is a case
   that the next marking could not be executed due to Warning E751.
 • If any of the following operations are executed while the trigger processing operations of multiple triggers are running,
   on-the-fly marking is terminated after finishing the running marking, and subsequent triggers will be canceled.
• Closing the shutter
• Sending MKM command with “command reception permission ON”
• Changing the file
• Changing the marking characters by code reader linkage function


114                                                     ME-LPRF-SM-11

---

## หน้า 115

4-6-8 On-the-fly marking: 2 sensors input
When trigger mode is set to Single trigger

Speed A              Speed B        Speed C

   ON
ENCODER A IN (X13)                  T1                              T6
   OFF
   ON               T3
ENCODER B IN (X14)
   OFF
   ON
   TRIGGER IN (X5)                            T4                       T4

OFF
ON
  SHUTTER OPEN OUT (No.39)
   OFF
   ON    T2
   READY OUT (Y5)
   OFF
   ON
PROCESSING OUT (Y10)
   OFF
   ON                           T5                       T5                T5
   LASING OUT (No.40)
   OFF

Applied line speed          Undefined *1         Speed A              Speed B *2             Speed C


*1 : If TRIGGER IN (X5) is turned ON without proper detection of the line speed, warning E607 occurs.
*2 : When ENCODER B IN (X14) is input during the trigger processing operation, the line speed is updated after the
running trigger processing.

 Item     Time                     Remarks
 T1       0ms or more              Turn on ENCODER A IN (X13) with the shutter opened.
 T2       ―                        Time for marking data creation. It varies depending on the quantity of the setting data.
 T3       Max. 10 sec.             If ENCODER B IN (X14) does not turn on within 10 seconds from turnig on of ENCODER A
IN (X13), time-out error (E607) occurs when TRIGGER IN (X5) is input.
 T4       1 to 10 sec.             If TRIGGER IN (X5) is not turned on within the setting time-out period from turning on
or                       ENCODER B IN (X14), time-out error (warning E607) occurs.
Not specified            This time-out can be disabled by setting.
(No time-out)
 T5       ―                        Time from when TRIGGER IN (X5) is turned on till when the work piece comes to the
preset marking position.
 T6       0ms or more              ENCODER A IN (X13) for the next marking can be accepted after inputting ENCODER B
IN (X14).


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• It is recommended to set the sensors to detect the line speed and the trigger input position as close as possible to
  reduce the difference between the detected line speed and the actual line speed at the marking.


ME-LPRF-SM-11                                                   115

---

## หน้า 116

4-6-9 Target detection input
   ON
   READY OUT (Y5)
   OFF
   ON        T1                                         T1
   TRIGGER IN (X5)
   OFF
   ON
TARGET DETECTION IN (X7)                          T3                   T3
   OFF
   ON
   PROCESSING OUT (Y10)
   OFF
   ON        T2                    T2                   T2
   LASING OUT (No.40)
   OFF
   ON                       T4                   T4                    T4
  PROCESSING END OUT (Y11)
OFF
ON
  PROCESSING FAIL OUT (Y12)
   OFF
   ON
   T5                   T5
CHECK OK OUT (No.34)
   OFF
   ON                                                                  T5
CHECK NG OUT (No.35)
   OFF
   ON (Normal)                                                                  T6
  WARNING OUT (Y14)
   OFF (Error)


  Item     Time                     Remarks
  T1       2ms or more              Keep the ON status for 2ms or more.
  T2       0 to 9999 ms             When the trigger delay time is set in the selected file, trigger processing (lasing) operation
starts after the delay time.
  T3       1 ms or more             When TARGET DETECTION IN (X7) turns ON for more than 1ms while LASING OUT
(No.40) is ON, it is judged as success of the target detection.
  T4       2 to 510 ms              This is the output to notify that the marking trigger processing completed normally. Even
when the workpiece could not be detected, PROCESSING END OUT (Y11) turns on unless
the trigger processing operation is interrupted. This is One-shot output. Set the output time
on System settings screen. There is a small margin of error for the setting value.
  T5       2 to 510 ms              According to the ON/OFF state of TARGET DETECTION IN (X7), CHECK OK OUT (No.34)
or CHECK NG OUT (No.35) turns on for one-shot time after the trigger processing (lasing)
operation. The one-shot output time is set on the system settings screen. There is a small
margin of error for the setting value.
 • When TARGET DETECTION IN (X7) turns ON for more than 1ms during lasing
   operation: CHECK OK OUT (No.34) turns ON.
 • When TARGET DETECTION IN (X7) did not turn ON during lasing operation: CHECK
   NG OUT (No.35) turns ON.
  T6       Approx. 3 sec.           When TARGET DETECTION IN (X7) did not turn ON during lasing operation, the warning
E752 is output for 3 seconds.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Before using TARGET DETECTION IN (X7), set X7: TARGET DETECTION IN to “Enabled” at the system settings of
   Laser Marker NAVI smart.


116                                                          ME-LPRF-SM-11

---

## หน้า 117

4-6-10 Guide laser radiation input
   ON
SHUTTER ENABLE IN (X9)
   OFF

   ON
   SHUTTER IN (X8)
   OFF
   *2
   ON
SELECT 0 - 2 IN (No.19-21)                                       *1

   OFF
   ON                                  T3
GUIDE IN (No.23)                                                             T4
   T2
   OFF

   ON
   READY OUT (Y5)
   OFF
   ON (Close)
SHUTTER CLOSE 1 OUT (Y8)                                 T1
SHUTTER CLOSE 2 OUT (Y9)
   OFF (Open)


  Item       Time                    Remarks
  T1         Max. 1 sec.             There is a delay time of around 200ms to max. 1 second from turning ON/OFF of
SHUTTER IN (X8) to turning ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
CLOSE 2 OUT (Y9).
SHUTTER CLOSE 1 OUT and SHUTTER CLOSE 2 OUT will be output by the same
operation, but their output timing has a margin of error.

  T2         0ms or more             Turn on GUIDE IN (No.23) with the shutter closed.
  T3         0.5ms or more           After a lapse of 0.5ms or more from specifying SELECT 0 IN to SELECT 2 IN, turn on
GUIDE IN.
  T4         Max. 60 sec.            The guide laser is stopped automatically after passing 1 minute from start-up.

*1 : Select the indication contents of the guide laser with SELECT 0 IN to SELECT 2 IN as follows.
Radiation details         SELECT 0 IN (No. 19)            SELECT 1 IN (No. 20)          SELECT 2 IN (No. 21)
  Work distance                            OFF                                OFF                       OFF
  Marking image                             ON                                OFF                       OFF
  Marking field                            OFF                                ON                        OFF
  Masked objects                            ON                                ON                        OFF

*2 : Keep the input state of SELECT 0 IN to SELECT 2 IN (No.19-21) while GUIDE IN (No.23) is turned ON.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • To use a guide laser in remote mode while any of the INTERLOCK inputs (REMOTE INTERLOCK IN, INTERLOCK
   1, INTERLOCK 2) is open, set “Deactivate while shutter closed” in “System settings” > “Operation/information” >
   “INTERLOCK alarm detection”.


 • If you have configured the guide laser control method of external control to communication commands by the system
   settings of Laser Marker NAVI smart, the guide laser radiation by I/O is not possible.
 • Do not execute any other operation while the guide laser is emitted.


ME-LPRF-SM-11                                                117

---

## หน้า 118

4-6-11 Select file
   ON
   SELECT 0 - 2 IN                    *1
   (No.19-21)
   OFF
   ON
   File                                     File
D0 - D15 IN (No.3-18)
   number A                                 number B
   OFF
   T6
   ON                                                        T1
   T1                                              *2
   SET IN (No.2)
   OFF
   T2                                                   T2
   ON                                                      T5
   TRIGGER IN (X5)
   OFF
   ON
SET OK OUT (No.28)                           T3                                         T3

OFF

   ON
READY OUT (Y5)                                   T4      File number A                           T4     File number B
   ready                                          ready
   OFF

ON
  PROCESSING OUT (Y10)                                                                        File
   number A
OFF


  Item     Time                      Remarks
  T1       0.5ms or more             After a lapse of 0.5ms or more from specifying SELECT 0 IN to SELECT 2 IN and D0 IN to
D15 IN, turn on SET IN (No.2).
  T2       0ms or more               Keep the input until SET OK OUT (No.28) turns on.
  T3       2 to 510ms                One-shot output. Set the output time on the system settings screen. There is a small
margin of error for the setting value.
  T4       ―                         • In the laser pumping completed and shutter opened state: Time for marking data
  creation. It varies depending on the quantity of the setting data.
• When the laser pumping is not completed and shutter is closed: Total time for shutter
  opening and marking data creation, or time for laser pumping, whichever is longer.
  T5       2ms or more               Keep the ON status for 2ms or more.
  T6       0ms or more               To input the next file number right after TRIGGER IN (X5), input SET IN (No.2) after
PROCESSING OUT (Y10) turns ON.

 *1 : Turn off SELECT 0 IN to SELECT 2 IN when you specify a file number.
 *2 : You can input the next file number during the trigger processing. If the trigger processing was being executed when
you turned on SET IN (No.2), the file number changes after the trigger processing completes.


118                                                          ME-LPRF-SM-11

---

## หน้า 119

4-6-12 Time/date hold input and date gap output
Actual date                   Day 1                                                   Day 2

   8 o’clock of day 2
Example: at 15 o’clock of day 1

   ON
TIME HOLD IN (No.22)
   OFF

   ON
TRIGGER IN (X5)
   OFF

ON
   Mark                          Mark
  PROCESSING OUT (Y10)
   retained time                 retained time
   OFF
   (15 o’clock of day 1)       (15 o’clock of day 1)            (Mark 8 o’clock of day 2)
   ON
READY OUT (Y5)
   OFF

   ON
DATE GAP OUT (No.29)
   OFF


Date change


  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• TIME HOLD IN (No.22) is available even when the remote mode is turned OFF.
• If TIME HOLD IN (No.22) is turned ON when powering on the laser marker, it retains the system startup time.
• While TIME HOLD IN (No.22) is turned on, the time will be retained regardless of the file number, remote mode ON/OFF
  status, or error status.
• If you turn on/off TIME HOLD IN (No.22) continuously, keep the OFF time at least for two seconds.


4-6-13 Counter end output
   ON
READY OUT (Y5)

   OFF
   ON
   T1                 T1              T1               T1
TRIGGER IN (X5)
   OFF
   ON
  PROCESSING OUT (Y10)

OFF
   Mark the counter end value
ON
 COUNT END A/B/C/D OUT
(No.30/31/32/33)
   OFF


Item      Time                   Remarks
T1        2ms or more            Keep the ON status for 2ms or more.


  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Assign the counter No. to COUNT END A OUT to COUNT END D OUT (No.30 to 33) in system settings of Laser Marker
  NAVI smart.
• COUNT END A/B/C/D OUT remains turned ON with the shutter open until the next marking trigger is input. When you
  close the shutter, COUNT END A/B/C/D OUT turns OFF.
• COUNT END A/B/C/D OUT is disabled when “counter update per step” is configured at Step & repeat.


ME-LPRF-SM-11                                                                    119

---

## หน้า 120

4-6-14 Count-up/count-down value correction
   ON
SELECT 0 - 2 IN (No.19-21)                      *1
   OFF

   ON
D0 - D7 IN (No.3-10)                      *2
   OFF

   ON
D8 - D15 IN (No.10-18)                      *3
   OFF

   ON
   T1
   SET IN (No.2)
   OFF
   T2
   ON
SET OK OUT (No.28)                              T3
   OFF
   T4
   ON
   TRIGGER IN (X5)                                              T5

OFF

   ON
READY OUT (Y5)
   OFF

   ON
PROCESSING OUT (Y10)
   OFF


  Item      Time                    Remarks
  T1        0.5ms or more           After a lapse of 0.5ms or more from specifying SELECT 0 IN to SELECT 2 IN and D0 IN to
D15 IN, turn on SET IN (No.2).
  T2        0ms or more             Keep the input until SET OK OUT (No.28) turns on.
  T3        2 to 510ms              One-shot output. Set the output time on the system settings screen.
There is a small margin of error for the setting value.
  T4        0ms or more             Turn on TRIGGER IN (X5) after SET OK OUT (No.28) turns on.
  T5        2ms or more             Keep the ON status for 2ms or more.

 *1 : Select the number input target with SELECT 0 IN to SELECT 2 IN as follows.
Number input target             SELECT 0 IN (No. 19)      SELECT 1 IN (No. 20)        SELECT 2 IN (No. 21)
  Count-up value correction                      OFF                        ON                            OFF
  Count-down value correction                    ON                         ON                            OFF

 *2 : Select a value from D0 to D7 for the counter number to correct the count-up/count-down value. The counter No. 0 to 3
is assigned at D0 to D3 and the common counter No. 16 to 19 is assigned at D4 to D7 respectively.
 *3 : Specify a value in D8 to D15 for the step times of count-up or count-down in the binary system.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • To specify the next counter value during the trigger processing, input SET IN (No.2) after PROCESSING OUT (Y10)
   turns ON.
 • If the count-up/count-down correction is input during on-the-fly marking operation, READY OUT (Y5) turns off
   momentary and there is a case that the next marking could not be executed due to Warning E751.


120                                                         ME-LPRF-SM-11

---

## หน้า 121

4-6-15 Counter reset input
ON
   SELECT 0 - 2 IN (No.19-21)                                           *1
OFF

   ON
D0 - D15 IN (No.3-18)                                           *2
   OFF
   ON
   T5
   SET IN (No.2)
   OFF
   T2
   ON                     T1                                         T1
   TRIGGER IN (X5)
   OFF

   ON
SET OK OUT (No.28)                                                       T3
   OFF


   ON
READY OUT (Y5)
   T4
   OFF

   ON
PROCESSING OUT (Y10)
   OFF


 Item    Time                   Remarks
 T1      2ms or more            Keep the ON status for 2ms or more.
 T2      0ms or more            Keep the input until SET OK OUT (No.28) turns on.
 T3      2 to 510ms             One-shot output. Set the output time on the system settings screen. There is a small
margin of error for the setting value.
 T4      0ms or more            Turn on TRIGGER IN (X5) after SET OK OUT (No.28) turns on.
 T5      0.5ms or more          After a lapse of 0.5ms or more from specifying SELECT 0 IN to SELECT 2 IN and D0 IN to
D15 IN, turn on SET IN (No.2).

*1 : To reset the counter, set SELECT 0 IN to SELECT 2 IN as follows.
SELECT 0 IN (No.19): OFF, SELECT 1 IN (No.20): OFF, SELECT 2 IN (No.21): ON
*2 : Specify the counter number to reset by using D0 IN to D15 IN (No.3 to 18). The following counter numbers are
 assigned to D0 IN to D15 IN respectively.
• D0 to D3: Counter No. 0 to 3
• D4 to D7: Common Counter No. 16 to 19
• D8 to D11: Counter No. 4 to 7
• D12 to D15: Common Counter No. 20 to 23


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If the counter is reset during on-the-fly marking operation, READY OUT (Y5) turns off momentary and there is a case
  that the next marking could not be executed due to Warning E751.


ME-LPRF-SM-11                                                    121

---

## หน้า 122

4-6-16 Registered characters/external offset marking
   ON
SELECT 0 - 2 IN
   *1
   (No.19-21)
   OFF

   ON
D0 - D15 IN (No.3-18)                         *2
   Data B              Data C
   Data A
   OFF
   T1                                     T1                  T1
   ON
   T6            T2                 T6               T2        T6        T2
   SET IN (No.2)
   OFF

   ON
TRIGGER IN (X5)                                                  T5                                    T5                    T5
   OFF

ON
 DATA WAIT OUT (No.38)
OFF

   ON
   T3                                  T3                  T3
SET OK OUT (No.28)
   OFF
   ON
   READY OUT (Y5)                                      T4                                 T4
   OFF

ON
 PROCESSING OUT (Y10)                                                   Data A                              Data B              T7   Data C
OFF


  Item       Time                    Remarks
  T1         0.5ms or more           After a lapse of 0.5ms or more from specifying SELECT 0 IN to SELECT 2 IN and D0 IN to
D15 IN, turn on SET IN (No.2).
  T2         0ms or more             Keep the input until SET OK OUT (No.28) turns on.
  T3         2 to 510ms              One-shot output. Set the output time on the system settings screen. There is a small
margin of error for the setting value.
  T4         ―                       Time for data creation. It varies depending on the quantity of the setting data.
  T5         2ms or more             Keep the ON status for 2ms or more.
  T6         0ms or more             Input SET IN (No.2) after DATA WAIT OUT (No.38) turns ON.


  T7         ―                        • When the next marking data compiling has finished within the trigger processing time:
  1ms or less
• When the next marking data compiling did not finish within the trigger processing time:
  The remaining time of the marking data compiling (T4)

 *1 : To specify the registered characters/external offset data number, set SELECT 0 IN to SELECT 2 IN as follows.
SELECT 0 IN (No.19): ON, SELECT 1 IN (No.20): OFF, SELECT 2 IN (No.21): OFF
 *2 : Specify the data number of registered characters/external offset by using D0 IN to D15 IN. Refer to “4-3 Signals and
Details of I/O Connector” (P.91).

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • SET IN (No.2) for the registered characters/external offset is acceptable when the laser pumping is completed, and the
   internal shutter opens.
 • If you have configured the registered characters/external offset function, READY OUT (Y5) will not be output until the
   data number and SET IN (No.2) are input.
 • Enter the data number input and SET IN (No.2) every time for each marking trigger even there is no change to the
   marking data.
 • Close the shutter if you want to reset the data number after turning on SET IN (No.2).
 • READY OUT (Y5) will be output even when specified the data number without any settings.


122                                                                     ME-LPRF-SM-11

---

## หน้า 123

4-6-17 Laser stop input


If LASER STOP IN is released when laser is not radiating, the shutter is closed keeping the laser pumping on.
If LASER STOP IN is released when laser is radiating, the laser pumping is turned off, and the shutter is closed.
Refer to “Laser marker operation when functions for safety measures are input” (P.90).

   ON
   LASER SUPPLY IN (X6)
   OFF
   ON
 SHUTTER ENABLE IN (X9)
   SHUTTER IN (X8)
   OFF
   ON                                 T3
   TRIGGER IN (X5)
   OFF
   ON (Close)
LASER STOP IN (X10, X11)
   OFF (Open)
   ON                                                                      T5
   ALARM RESET IN (X15)
   OFF

   ON                                                                           T6
  LASER STANDBY OUT (Y6)
   OFF                   T1
SHUTTER CLOSE 1 OUT (Y8) ON (Close)                         T1                    T1                       T1
SHUTTER CLOSE 2 OUT (Y9)
   OFF (Open)
   ON
   T7
   READY OUT (Y5)                                     T2
   OFF
   Marking
   ON                                                       interruption
   PROCESSING OUT (Y10)
   OFF
   ON                                          T4
PROCESSING FAIL OUT (Y12)
   OFF
   ON (Normal)
   WARNING OUT (Y14)
   OFF (Error)
   ON (Normal)
   ALARM OUT (Y15)
   OFF (Error)


  Item      Time                     Remarks
  T1        Max. 1 sec.              There is a delay time of around 200ms to max. 1 second from turning ON/OFF of
SHUTTER IN (X8) to turning ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
CLOSE 2 OUT (Y9).
SHUTTER CLOSE 1 OUT and SHUTTER CLOSE 2 OUT will be output by the same
operation, but their output timing has a margin of error.

  T2        ―                        Total time for shutter opening and marking data creation. It varies depending on the
quantity of the setting data.
  T3        2ms or more              Keep the ON status for 2ms or more.
  T4        2 to 510ms               This is One-shot output. Set the output time on the environment setting screen. There is
a small margin of error for the setting value.
  T5        100ms or more            Keep the ON status for 100ms or more.
  T6        Approx. 7 sec.           Time for completion of laser pumping.


  T7        ―                        Total time for shutter opening and marking data creation, or time for laser pumping,
whichever is longer.


ME-LPRF-SM-11                                                        123

---

## หน้า 124

4-6-18 Remote interlock input


 If REMOTE INTERLOCK IN is released, the laser pumping is turned off and the shutter is closed, regardless of whether or
 not the laser is radiating. Refer to “Laser marker operation when functions for safety measures are input” (P.90).

   ON
   LASER SUPPLY IN (X6)
   OFF
   ON
   SHUTTER ENABLE IN (X9)
   SHUTTER IN (X8)
   OFF
   ON                                                    T5
   TRIGGER IN (X5)
   OFF
   ON (Close)
REMOTE INTERLOCK IN (X20)
   OFF (Open)
   ON                     T2                                               T2
   ALARM RESET IN (X15)
   OFF

   ON                          T3                                               T3
  LASER STANDBY OUT (Y6)
   OFF
SHUTTER CLOSE 1 OUT (Y8) ON (Close)
   T1                 T1                             T1                T1
SHUTTER CLOSE 2 OUT (Y9)
   OFF (Open)
   ON
   READY OUT (Y5)                                   T4                                               T4
   OFF
   Marking
   ON
   interruption
   PROCESSING OUT (Y10)
   OFF
   ON
PROCESSING END OUT (Y11)
   OFF
   ON                                                             T6
PROCESSING FAIL OUT (Y12)
   OFF
   ON (Normal)
   ALARM OUT (Y15)
   OFF (Error)


   Item      Time                     Remarks
   T1        Max. 1 sec.              There is a delay time of around 200ms to max. 1 second from turning ON/OFF of
SHUTTER IN (X8) to turning ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
CLOSE 2 OUT (Y9).
SHUTTER CLOSE 1 OUT and SHUTTER CLOSE 2 OUT will be output by the same
operation, but their output timing has a margin of error.

   T2        100ms or more            Keep the ON status for 100ms or more.
   T3        Approx. 7 sec.           Time for completion of laser pumping.


   T4        ―                        Total time for shutter opening and marking data creation, or time for laser pumping,
whichever is longer.
   T5        2ms or more              Keep the ON status for 2ms or more.
   T6        2 to 510ms               This is One-shot output. Set the output time on the environment setting screen. There is
a small margin of error for the setting value.


124                                                        ME-LPRF-SM-11

---

## หน้า 125

4-6-19 Interlock input
If INTERLOCK (X16 - X17 and X18 - X19) is opened, the laser pumping is turned off and the shutter is closed, regardless of
whether or not the laser is radiating. Refer to “Laser marker operation when functions for safety measures are input” (P.90).

   ON
   LASER SUPPLY IN (X6)
   OFF
SHUTTER ENABLE IN (X9) ON
   SHUTTER IN (X8)
   OFF
   ON                                                        T6
   TRIGGER IN (X5)
   OFF
   CLOSE
  INTERLOCK 1 (X16-X17)
   OPEN
   CLOSE
  INTERLOCK 2 (X18-X19)                                T1                                                 T1
   OPEN          T1                                                 T1
   CLOSE
  INTERLOCK 1 MONITOR
   (Y16-Y17) OPEN
   T1              T1
   CLOSE
  INTERLOCK 2 MONITOR
   (Y18-Y19) OPEN
   ON                      T3                     T3                           T3
   ALARM RESET IN (X15)
   OFF
   ON                             T4                   T4                            T4
   LASER STANDBY OUT (Y6)
OFF
ON (Close)
 SHUTTER CLOSE 1 OUT (Y8)                          T2             T2     T2            T2             T2             T2
 SHUTTER CLOSE 2 OUT (Y9)
   OFF (Open)
   ON
   READY OUT (Y5)                                    T5                   T5                            T5
   OFF
   Marking
   ON                                                                                interruption
PROCESSING OUT (Y10)
   OFF
   ON                                                                T7
 PROCESSING FAIL OUT (Y12)
   OFF
   ON (Normal)
ALARM OUT (Y15)
   OFF (Error)


 Item      Time                      Remarks
 T1        Approx. 50ms              INTERLOCK MONITOR is switched open and closed with a delay of approx. 50ms with
reference to each INTERLOCK input.
 T2        Max. 1 sec.               There is a delay time of around 200ms to max. 1 second from turning ON/OFF of
SHUTTER IN (X8) to turning ON/OFF of SHUTTER CLOSE 1 OUT (Y8) and SHUTTER
CLOSE 2 OUT (Y9). SHUTTER CLOSE 1 OUT and SHUTTER CLOSE 2 OUT will be
output by the same operation, but their output timing has a margin of error.

 T3        100ms or more             Keep the ON status for 100ms or more.
 T4        Approx. 7 sec.            Time for completion of laser pumping.


 T5        ―                         Total time for shutter opening and marking data creation, or time for laser pumping,
whichever is longer.
 T6        2ms or more               Keep the ON status for 2ms or more.
 T7        2 to 510ms                This is One-shot output. Set the output time on the environment setting screen. There is
a small margin of error for the setting value.


ME-LPRF-SM-11                                                       125

---

## หน้า 126

5 External Control by
  Communication Commands


ME-LPRF-SM-11

---

## หน้า 127

5-1 Communication Interfaces
This product has the following communication interfaces on the controller.


w

q
 e


Rear of Controller


 No.    Name                            Description

  q     RS-232C port                    For the connection details, refer to “5-2 RS-232C” (P.128).
To use the RS-232C port, select the RS-232C usage from communication
command control or code reader linkage function in the system settings screen in
advance.

  w     Ethernet port                   For the connection details, refer to “5-3 Ethernet” (P.131).
The Ethernet port can be connected with the following devices simultaneously via
a HUB or a router.
 • Laser Marker NAVI smart (PC configuration software)
 • External device for communication command control (PLC and PC for control)
 • Specific image checker

  e     Ports for industrial network:   Available when the optional network unit (EtherNet/IP unit or PROFINET unit) is
EtherNet/IP or PROFINET         installed to the controller.
   Communication port (2-port switch) to control the laser marker by the industrial
   network with the control device such as a PLC.
   Connect a LAN cable.
   For details, refer to “EtherNet/IP Communication Guide” or “PROFINET
   Communication Guide”.
   If you do not install the network unit, there is no port here.


ME-LPRF-SM-11                                                      127

---

## หน้า 128

5-2 RS-232C
 To control the laser marker by communication commands, use RS-232C or Ethernet connection.
 For the control by communication commands, configure the communication settings in advance at the system settings of
 Laser Marker NAVI smart. Refer to “3-4-3 General settings before external control” (P.77).

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • The laser marker can be controlled by I/O and communication commands combined.
  • For communication commands, refer to “Serial Communication Command Guide”.


 5-2-1 Interface specifications and connection
 To execute command communication control with RS-232C, connect the RS-232C port on the controller to the external
 control device.


1              6


5              9

RS-232C port
  (female)

On the laser marker
  controller side
   Rear of controller

   Connector position     Connector specifications                        Model                             Manufacturer name
   On the laser marker    D-sub 9-pin, female                             -                                 -
   side                   Screw type: No.4-40UNC inch screw, female
   User side              D-sub 9-pin, male                               Recommended connector             OMRON
Screw type: No.4-40UNC inch screw, male         XM3A-0921                         Corporation
   Recommended connector cover
   XM2S-0913


 ⿎⿎Signals and Details of RS-232C connector

   Terminal No.    Signal                 Description

   1               N.C.                   Do not use this signal.
   2               TxD (SD)               Transmission data: Connect RxD (RD) of the external control device
   3               RxD (RD)               Receiving data: Connect TxD (SD) of the external control device
   4               N.C.                   Do not use this signal.
   5               GND (SG)               Signal ground: Connect GND (SG) of the external control device
   6               N.C.                   Do not use this signal.
   7               N.C.
   8               N.C.
   9               N.C.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • On the system settings screen, select communication command control or code reader linkage function that you use
with the RS-232C port.
  • The GND pin of the RS-232C connector is common to the body of the laser marker.


128                                                       ME-LPRF-SM-11

---

## หน้า 129

⿎⿎Connecting to external control devices
• To connect the laser marker to the PC for control, use a commercially available RS-232C straight cable (laser marker
  side: 9pin male).
• In case of connecting to PLC, a type of the cable (straight or cross) differs depending on a manufacturer or a model.
  Please follow the PLC manual.
• To connect RS-232C terminal without using a commercially available RS-232C cable, connect only 3 signals of RxD,
  TxD and GND and do not use other signals on the laser marker side.
• You may need a signal line connection (loop back line) other than RxD (RD), TxD (SD) or GND on the external control
  device side depending on the specifications of the external control device. Read the instruction manual of the external
  control device and connect it to the laser marker appropriately.

  Connection example
 RS-232C port
(Laser marker)                                   External control devise

Terminal No. Signal                                Signal Terminal No.
   Straight cable
   2        TxD                                  RxD           2
   3        RxD                                  TxD           3
   5        GND                                  GND           5
   DCD           1
   DTR           4
   DSR           6
   *
   RTS           7
   CTS           8

* The loop back wiring on the external control device side shown in the above figure is just an example. The wiring method
  varies depending on the specifications of each external control device. Read the instruction manual of the external
  control device and connect it to the laser marker appropriately.


                                                      ME-LPRF-SM-11                                                     129

---

## หน้า 130

5-2-2 Communication settings (for command control)
   Item                           RS-232C communication settings (for command control)
   Synchro system                 Start-stop method
   Communication type             Full-duplex transmission
   Baud rate                      1200 / 2400 / 4800 / 9600 / 19200 / 38400 / 57600 / 115200 bps (initial setting: 9600 bps)
   Data length                    8-bit fixed
   Parity                         None / Even / Odd (initial setting: None)
   Stop bits                      1-bit / 2-bit (initial setting: 1-bit)
   Flow control                   None
   Check sum                      OFF / ON (initial setting: OFF)
   End code                       CR / CR + LF (initial setting: CR)
   Start code *                   ON (STX) / OFF (initial setting: STX)


   Response data command *        ON / OFF (initial setting: ON)
   Response data sub              Any single byte character of ASCII code from 01 (HEX) to 7F (HEX) can be specified.
   command *                      • Initial setting of positive response code: A
• Initial setting of negative response code: E
• Initial setting of read request response code: A


   Character code                 ASCII code
   Encoding for non-ASCII         Shift-JIS / GB 2312 / Latin-1 (initial setting: Shift-JIS)
   characters *


   Reception timer                Timeout monitoring ON (10 sec.)

  * If you set “LP-400/V compatibility” in the system settings of Laser Marker NAVI smart, the same command format
    with the former models of LP-400/LP-V series is applied regardless these settings. For the details, refer to the “Serial
    Communication Command Guide: LP-400/V compatible mode”.


       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • For the details of the communication settings, refer to “3-4-3 General settings before external control” (P.77).
  • When using RS-232C, specify the “Flow control” to “None” at the communication port settings of the external control
device.


130                                                           ME-LPRF-SM-11

---

## หน้า 131

5-3 Ethernet

5-3-1 Port specifications and connection
To control the laser marker by Ethernet communication, use an Ethernet port on the controller.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• The Ethernet port of this product is compatible with both straight cable and cross cable.
• Although the maximum length of cables connecting devices permitted by the standards of Ethernet is 100 m, in order to
  prevent communication failure due to noise or breakdown of the device, it is recommended to keep the length to 10 m or
  less.
• The Ethernet port can be connected with the following devices simultaneously via a HUB or a router.
   • PC configuration software
   • External device for communication command control (PLC and PC for control)
   • Specific image checker


Orange LED


Green LED
 RJ-45 8-pole connector
 AUTO-MDIX compatible

On the laser marker controller side
   Rear of controller


 Light up color    Description

 Green             The indicator lights up while connected normally. It blinks during communication.
 Orange            Lights up only when the baud rate is 100 megabits/sec.


⿎⿎LAN cable connection
When you connect a LAN cable to the Ethernet port, attach the ferrite core included to a position as close as possible to
the Ethernet port on the LAN cable controller side.
Turn the LAN cable 3 times around the ferrite core as shown below figure.

Laser marker controller


Ferrite core
   LAN cable


ME-LPRF-SM-11                                                    131

---

## หน้า 132

5-3-2 Communication settings
   Item                                    Ethernet communication settings
   Communication protocol                  TCP/IP
   Standards                               IEEE802.3 (10BASE-T) / IEEE802.3u (100BASE-TX)
   Applicable cable                        Category 5 or higher
   Applicable HUB (or rooter)              10BASE-T / 100BASE-TX compatible
   IP address                              1.0.0.0 to 223.255.255.255 * (Initial value: 192.168.1.5)
   Subnet mask                             128.0.0.0 to 255.255.255.254 (Initial value: 255.255.255.0)
   Default gateway                         1.0.0.0 to 223.255.255.255 * (Initial value: 0.0.0.0 (Unspecified))
   PC configuration software port          1025 to 65534, except 9090 (Initial value: 9093)
   Command communication port              1025 to 65534, except 9090 (Initial value: 9094)

  * Do not use “127” in the first octet.

       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • The communication control of the laser marker through the Ethernet should be performed in a secure network settings.
  • Even the IP Address and Subnet Mask values are within the configurable range, they may not be available depending
on the combination.
  • For the details of the communication settings, refer to “3-4-3 General settings before external control” (P.77).

 ⿎⿎Ethernet communication settings for communication command control
   Item                            Ethernet communication settings
   Start code *                    ON (STX) / OFF (initial setting: STX)


   Response data command *         ON / OFF (initial setting: ON)
   Response data sub               Any single byte character of ASCII code from 01 (HEX) to 7F (HEX) can be specified.
   command *                       • Initial setting of positive response code: A
• Initial setting of negative response code: E
• Initial setting of read request response code: A


   Character code                  ASCII code
   Encoding for non-ASCII          Shift-JIS / GB 2312 / Latin-1 (initial setting: Shift-JIS)
   characters *


   Check sum                       OFF
   End code                        CR
   Reception timer                 Timeout monitoring ON (10 sec.)

  * If you set “LP-400/V compatibility” in the system settings of Laser Marker NAVI smart, the same command format
    with the former models of LP-400/LP-V series is applied regardless these settings. For the details, refer to the “Serial
    Communication Command Guide: LP-400/V compatible mode”.


132                                                           ME-LPRF-SM-11

---

## หน้า 133

5-3-3 Connecting to external control devices and its setting sample
Connect the two or more laser markers and an external device via a HUB or a router:
Use a HUB (or a rooter) that supports 100BASE-TX/10BASE-T and a cable of Category 5 or higher for the connection.


External controller (PC, etc.)                          HUB (or rooter)


 Laser marker controller
(Several units connected)

Example of communication system settings:
Set a separate IP address not to overlap between the laser marker and PC on the network.

PC            Laser marker A      Laser marker B       Laser marker C
 IP address                       192.168.1.10       192.168.1.5          192.168.1.6         192.168.1.7
 Subnet mask                                                 255.255.255.0
 Default gateway                                                   None
 Command control port                  —                                     9094

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• When the laser marker is connected the external control device one to one, no HUB is necessary.


ME-LPRF-SM-11                                               133

---

## หน้า 134

5-4 Checking the communication commands
 Check the communication commands transmitted and received by the laser marker using the command history function in
 the PC configuration software “Laser Marker NAVI smart”.
 The command history is displayed with the following procedures.


 1.     Establish an online connection between your PC and the laser marking system.


 2.     Go to the “Maintenance” screen.


 3.     Select “Command history” tab. Up to 100 command messages received or sent by the laser marker are shown in the
        list.


       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
  • When a code reader is connected to the RS-232C port of the laser marker, the transmitted and received data with the
    code reader is not recorded in the command history.
  • In the command history you can also confirm the commands transmitted via optional network unit (EtherNet/IP or
    PROFINET).


134                                                    ME-LPRF-SM-11

---

## หน้า 135

6 Link Control with External
  Devices


ME-LPRF-SM-11

---

## หน้า 136

6-1 Link Control with Image Checker
 This product can be connected with specific image checker and code reader via Ethernet and control the laser marker
 linking with these devices.
 The following series of operations related to marking can be controlled from the laser marker when the image checker
 linkage function is used.

  Position correction → Marking
 According to information imported by the image checker's camera, the marking position of the laser marker is changed.

  Marking → Image checking (code symbol or character checking)
 After the marking by the laser marker, the image checker reads the marked code symbols or characters. The readout data
 and marking data are collated by the image checker and the checkup result is output from the laser marker.

  Marking → Image checking (image capturing and inspection)
 After the marking by the laser marker, the image checker captures the marked image. The captured image is determined by
 the image checker and the checkup result is output from the laser marker.

  Position correction → Marking → Image checking
 The image checking operation before marking (postion correction) and after marking (code/character checking or image
 capturing) can be combined.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • When you use the link control with an image checker, the following functions are not available.
   • “Continuous trigger” of trigger mode
   • On-the-fly marking
   • TARGET DETECTION IN of the I/O terminal


136                                                    ME-LPRF-SM-11

---

## หน้า 137

6-1-1 Example of image checker linkage system
Image checker camera
   Illumination
   Laser marker head


Code reader


Laser marker controller


   Checkup result display
Image checker controller
   HUB (for Ethernet connection)


   • Detect the work position
Image checker
   • Transmit the detected position information to the laser marker


   • Correct the marking position
Laser marker          • Perform marking on the corrected position
   • Transmit the marked code string to the code reader


   • Readout the marked code and check the read contents against the string
Code reader             transmitted by the laser marker
   • Transmit the checkup results to the laser marker


   • Output the consistent (OK)/inconsistent (NG) results transmitted by the code
Laser marker
   reader (I/O connector)


ME-LPRF-SM-11                                                137

---

## หน้า 138

6-1-2 Operation flow
  Example of operations for Position correction → Marking → Code checking

Start the image checker and laser marker


Start up and online connect the Laser Marker NAVI smart


Remote mode ON


Select File


Laser pumping ON


Shutter open


Check the marking ready output ON


Laser marker marking trigger input


Image checker: Operation start
  • Execution of shooting and checker
  • Output of inspection results


Laser marker: Change of coordinates                                    Repeat this procedure

TIMING IN signal input *

Laser marker: Laser radiation

TIMING IN signal input *

Code reader: Operation start
  • Reading and checkup of the marked code
  • Output of checkup results


Laser marker: Output of checkup results

      * If it is set to use the TIMING IN signal, enter TIMING IN as a next operation trigger.
ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Confirm the laser marker and image checker communication settings in advance.
 • Set the conditions of files to use the image checker linkage function.
 • The image checker linkage function can be used while the laser marker is under the remote control mode.


138                                                        ME-LPRF-SM-11

---

## หน้า 139

6-1-3 Connection
ワㄐㄕㄊ㄄ㄆ
• To prevent damage of the image checker, do not install the camera in the laser emission area. Besides, take measures
  to protect the camera against the reflected laser beam, such as installing a shutter in front of the camera lens.

 Connectable image checker
Image checkers compatible with this product are listed below.
 Usage                               Model                                                Manufacturer name
 Position correction                 PV230 / PV200                                        Panasonic Devices SUNX Co, Ltd.
 Code checking                       PV230
LP-ABR11 / LP-ABR12
DataMan series (Ethernet supported model)            Cognex Corporation
 Character checking                  PV230                                                Panasonic Devices SUNX Co, Ltd.
 Image capturing and inspection      PV230 / PV200


 Connection method
Use the Ethernet port on the laser marker controller and connect the image checker to link.
This product can be connected with one device each for position correction and code reading.

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• For details of specifications and connection of the Ethernet port, refer to “5-3 Ethernet” (P.131).

 Connection example

To connect a position correction device (PV230), code reader (DataMan) and control PLC with the laser marker

HUB


   PLC                                                    PV230                              DataMan
(For I/O control)             Laser marker            (For position correction)             (For code reading)

Example of communication system settings
To prevent duplication of IP addresses of network devices, set individual addresses.
   PV230                            DataMan
Laser marker
   (For position correction)           (For code reading)
 IP address                     192.168.1.4                      192.168.1.5                      192.168.1.10
 Subnet mask                                                    255.255.255.0
 Default gateway                                                 192.168.1.1
 Port                                                          Fixed value
―                     (Result output: 8601)                   23 (Telnet)
   (Command transmission: 8604)

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Port on the laser marker side is a fixed value when PV230/PV200 is used.
• Align the Port (command transmission) on the laser marker with DataMan's TelnetPort setting value when DataMan is
  used.
• When the laser marker is connected an image checker one to one, no HUB is necessary.
• The Ethernet port of this product is compatible with both straight cable and cross cable.


ME-LPRF-SM-11                                                    139

---

## หน้า 140

6-1-4 Set the laser marker communication settings
 1.    Establish an online connection between your PC and the laser marking system.


 2.    Go to the “System settings” screen and select “Communication” tab.


 3.    Set the Ethernet communication configuration of the
       laser marker.


 4.    Open the “Linked device” tab and configure the
       communication settings of the imagechecker according
       to the functions to use.
       For image checking before marking:
       • IP Address

       For image checking after marking:
       • Model of image checker: PV230/PV200, DataMan,
         LP-ABR
       • IP Address
       • Port (for LP-ABR and DataMan)
      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Specify these values according to communication settings of the image checker to connect.
 • The Port number for PV230/PV200 is a fixed value.
 • Specify Telnet Port for DataMan port number.
 • For LP-ABR, set the port number with the same value of “Data Port No” in Configurator LP-ABR.


 5.    Select “Apply to laser marking system” on the left side of the ribbon.
                                                                                                        “Apply to laser marking
                                                                                                        system” tool


 6.    Disconnect the online connection with the laser marker.


 7.    Turn off the power of the laser marking system, wait five seconds and then restart the system.
       The configured items will be reflected to the laser marker.


140                                                       ME-LPRF-SM-11

---

## หน้า 141

6-1-5 Set the laser marker overall file conditions
Set the overall file conditions of the Laser Marker NAVI smart according to the type of the system to establish.

1.     Establish an online connection between your PC and the laser marking system.


2.     Go to the “Marking settings” screen and select “File settings” tab.


3.     Turn ON “Image checking before marking” and “Image
       checking after marking” depending on the functions to
       use.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • When you use the link control with an image checker, the
   following functions are not available.
    • “Continuous trigger” of trigger mode
    • On-the-fly marking
    • TARGET DETECTION IN of the I/O terminal


4.     Select the model of the image checker and application.
       For image checking before marking:
       • Model: PV230/PV200 (fixed)
       • Application: Marking position correction (fixed)

       For image checking after marking:
       • Model: PV230/PV200, DataMan, LP-ABR
       • Application: Code checking, Character checking, Image
         capturing and inspection


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • The application of the image checking before marking is
   fixed to “Marking position correction”.
 • If you use DataMan or LP-ABR for the image checking after
   marking, the application is fixed to “Code checking”.
 • If you use PV200 for the image checking after marking, the application is fixed to “Image capturing and inspection”.
 • If you use PV230 for code checking, the human readable text can be also checked with a code symbol.


5.     Set the TIMING IN signal input.
       Set whether to use the TIMING IN signal as the
       operation start method of each device for link control.
       • Using TIMING IN signal: Input the operation trigger of
         each device separately.
       • Not using TIMING IN signal: Perform a set of link
         controls by one marking trigger input.
       Refer to “Details of TIMING IN signal” (P.143).


                                                            ME-LPRF-SM-11                                                 141

---

## หน้า 142

6.    When the application of the image checking after
       marking is set to “Code checking” or “Character
       checking”, input “Object number to check” that is
       the same number with the object number you set in
       barcode/2D code settings or character settings.


 7.    If you use PV230/PV200 for image checking after
       marking, input the following items, so that the setting
       values are same with the settings in PV230/PV200.
       • Type number set on PV
       • For code checking: CDR checker number set on PV
       • For character checking: OCR checker number set on PV

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • If there is no type number applicable to the image checker (PV230/PV200) setting data, the linkage function cannot be
   used. Check that the type specified here is consistent with the image checker (PV230/PV200) setting.
 • When the application is set to code checking and if you want to check the code symbol and human readable text at the
   same time, set CDR checker number for the code symbol and OCR checker number for the human readable text.


 8.    Overwrite the file after setting completion.
       Select “Save” – “To laser marking system” in the ribbon to save the settings.                        “Save” tool


142                                                        ME-LPRF-SM-11

---

## หน้า 143

 Details of TIMING IN signal

TIMING IN signal: Use
TIMING IN signal is used when the laser marker operation trigger and image checker/code reader operation trigger is input
separately, e.g. when the camera (code reader) field of view is away from the laser marker marking position.

For image checking before marking                         For image checking after marking

Camera etc.                           Laser marker         Laser marker                           Camera etc.


   q              w                                              q              w
TRIGGER IN       TIMING IN                                       TRIGGER IN    TIMING IN


q Start work location detection (initial operation)      q Start marking (initial operation)
w Start marking                                          w Start image checking

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• To control the linkage operation by TIMING IN signal, input TIMING IN signal within 60 seconds after completion of the
  initial operation.
• For input of TIMING IN signal, refer to “6-1-9 Timing chart” (P.149).
• Input TIMING IN signal by I/O control. Any communication command cannot input TIMING IN.


TIMING IN signal: Not use
TIMING IN signal is not necessary when the series of operations of the laser marker and the image checker/code reader by
one trigger, e.g. when the camera (code reader) field of view and the laser marker marking position are the same.

For image checking before marking                         For image checking after marking

   Laser marker            Laser marker
Camera etc.                                                                                    Camera etc.


   q                                                      q
TRIGGER IN                                             TRIGGER IN


q Start work location detection and start marking        q Start marking and after completion of marking,
   after completion of location detection                   start image checking


ME-LPRF-SM-11                                                  143

---

## หน้า 144

6-1-6 Image checker setting
 Settings to use the image checker PV230/PV200 for link control with the laser marker are described below.

  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• For specifications and setting of image checker PV230/PV200, refer to the instruction manual for PV230/PV200.

  Communication settings of image checker PV230/PV200
 To connect the laser marker with PV230/PV200, configure the PV230/PV200's communication settings as follows.

Item                         Ethernet communication specifications
Communication protocol       Multipurpose communication (TCP/IP)
Port No.                     Result output                   8601
(Fixed)
   Command transmission            8604
IP address                   Initial value: 192.168.1.5
   Make sure that the IP address for the laser marker on the network is not overlapping the IP
   address for the other external devices.


  Input/output setting
 To use the link control function with the laser marker and PV230/PV200, configure the system settings on the PV230/
 PV200 as follows.

 1.      From “Environment” - “Input/Output” setting screen of PV230/PV200, select the “General Output”.
 ￼


 2.      Set the items of Ethernet with the protocol setting “General
         Com.” as follows.
         • Output: Yes
         • Operation: Synchronized
         • Date/Time: No
         • Scan Count: No
         • Total Judge: Yes
         • Judge: No *
         • Numeric Calculation
           For position correction : Yes
           For other than position correction : No *
         • Optical Character Recognition: No *
         • Code Reader: No *
         • BCC: No
         • Number of Digits: 7
         • Decimal Digit: 3
         • Unused Digit: Fill with 0
         • Error Output: No *

 * : When you use Ethernet with the protocol setting both “PLC Com.” and “General Com.”, for the items with * you can
     change the settings according to your PLC configuration. For the items without *, follow the above settings.

       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
     • When the result of the total judgement by PV230/PV200 is “1”, the laser marker outputs CHECK OK OUT, and when the
       result is “0”, CHECK NG OUT is output.


144                                                         ME-LPRF-SM-11

---

## หน้า 145

 Settings of PV230/PV200 for position correction
When PV230/PV200 is used for position correction, set the following items:

1.    In PV230/PV200 setting software, select “Type” - “Type
      Setting” - “Camera” - “Calibration” and set the following
      items.
      • Calibration: Available
      • Method: Base X points


2.    Mark the calibration marks with the laser marker and register
      their coordinates (mm) to the global coordinates of PV230/
      PV200.                                                                                                       +Y
                                                                           (0, 0)                +X

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ                                                                                                        (0, 0)
                                                                                                          -X                   +X
• The calibration is necessary to convert the coordinates (pixel) of
  PV230/PV200 to the X-/Y-coordinates (mm) of the laser marker.               +Y
• After the calibration, confirm that in PV230/PV200 the CCW                                                         -Y
  direction of the θ-correction is on the positive (+) side.                    Coordinates of                 Coordinates of
PV230/PV200                     laser marker

3.    Set one of the followings to detect the correction value of the position for the laser marking.
      • “Inspection” - “Position Adjustment”
      • “Inspection” - “Checker” - Set “Smart edge (Line)”, “Smart matching”, or other checker that includes the angle value.


4.    Select “Inspection” - “Numerical Calculation”. Set the
      coordinates in the order of X, Y, theta in the expression
      table, that you want to send to the laser marker for the
      positional correction. Then, set “Yes” to “Output” of each
      expression.

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• The results of the numerical calculation should output to the laser marker in the order of X, Y, and theta.
• The rotation center of PV230/PV200 corresponds to the center of the marking field of the laser marker. (When X- and
  Y-movement in the file settings of the laser marker are set to 0mm.)
• The correction value of theta, X-and Y-position by PV230/PV200 are added respectively to the rotation movement, X-
  and Y-movement in the file settings of the laser marker.
• The laser marker corrects the theta-coordinate with the rotation origin of the center of the marking field first. Then, X-/
  Y-coordinates are corrected.


5.    Select “Inspection” - “Judgement” and set “JDC (External)”
      to “Type”.


6.    Set the result of the checker for the positional correction in
      the expression table.


7.    Select “Set” of Condition, and set “JDC” to Condition and
      specify “Checker No.” of Total Judgement.


                                                           ME-LPRF-SM-11                                                       145

---

## หน้า 146

 Settings of PV230 for code checking
 When PV230 is used for code reading, set the following items:

 1.    In PV230 setting software, select “Inspection” - “Checker” and set “Code Reader” to the checker type.


 2.    Specify the Checker No.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Input the same value with the Checker No. for the code reader set here to “CDR checker number set on PV” in the file
   settings of the laser marker.
 • If you want to check the human readable text together with the code symbol, set “Optical Character Recognition” to the
   checker type and set the Checker No. Input the same value with the Checker No. for the optical character recognition set
   here to “OCR checker number set on PV” in the file settings of the laser marker. For the details of the character checking
   of PV230, refer to “Settings of PV230 for character checking” (P.147).


 3.    Select “Area Setting” of the checker and specify the arbitrary testing area.


 4.    Select “Inspection Condition” of the checker and select         “Code Reader Checker” - “Inspection Condition”
       the code type. The code type should corresponds to the
       code symbol that is marked by the laser marker.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Set the other settings in the inspection condition of PV230
   so that you can read the marking codes without problem.


 5.    Select “Judgement Limits” of the checker and set “Yes” to
                                                                       “Code Reader Checker” - “Judgement Limits”
       the “String Judgement”.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • You do not have to input “Judgement Characters”. The
   marking data is automatically input to the judgement
   characters by the laser marker.
 • Confirm that marking data does not contain any characters
   that are not supported by PV230.


 6.    Select “Inspection” - “Judgement” and set “JDC (External)” to “Type”.


 7.    Set the results of the one or more checkers in the expression table, that you want to refer in the total judgement. For
       the code checking, set the checker No. of “CDR: Code Reader” and for the human readable text checking, set the
       checker No. of “OCR: Optical Char. Recognition”.


 8.    Select “Set” of Condition, and set “JDC” to Condition and specify “Checker No.” of Total Judgement.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For the link control of the laser marker and PV230, the output of the total judgement is needed. Without total judgement
   settings, the link control fails.
 • If you want to check the code symbol and human readable text at the same time, set the expression of the total
   judgement to output “OK” when the results of both “CDR: Code Reader” checker and “OCR: Optical Char. Recognition”
   checker are OK.


146                                                       ME-LPRF-SM-11

---

## หน้า 147

 Settings of PV230 for character checking
When PV230 is used for character checking, set the following items:

1.    In PV230 setting software, select “Inspection” - “Checker” and set “Optical Character Recognition” to the checker type.


2.    Specify the Checker No. for the optical character recognition.

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Input the same value with the Checker No. for the optical character recognition set here to “OCR checker number set on
  PV” in the file settings of the laser marker.

3.    Select “Area Setting” of the checker and specify the arbitrary testing area.


4.    Select “Judgement Limits 1” of the checker and select “Character String” to “Judgement Type”.

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Set the other settings in the inspection condition of PV230 so that you can read the marking strings without problem.
• You do not have to input “Judgement Characters”. The marking data is automatically input to the judgement characters
  by the laser marker.
• At the link control of the laser marker, character strings can be cross checked with the marking data, but the number of
  the characters and character size are not included in the checking target.
• To use the character recognition function, set the dictionary of PV230 for each marking character beforehand.
• Confirm that marking data does not contain any characters that are not supported by PV230.
• Up to 80 characters can be checked with one checker.

5.    Select “Inspection” - “Judgement” and set “JDC (External)” to “Type”.


6.    Set the results of the one or more checkers in the expression table, that you want to refer in the total judgement. For
      the character checking, set the checker No. of “OCR: Optical Char. Recognition”.


7.    Select “Set” of Condition, and set “JDC” to Condition and specify “Checker No.” of Total Judgement.

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• For the link control of the laser marker and PV230, the output of the total judgement is needed. Without total judgement
  settings, the link control fails.


 Settings of PV230/PV200 for image capturing and inspection
When PV230 or PV200 is used for image capturing and inspection, set the following items:

1.    In PV230/PV200 setting software, select “Inspection” - “Checker” and set the desired checker.


2.    Select “Inspection” - “Judgement” and set “JDC (External)” to “Type”.


3.    Set the results of the one or more checkers in the expression table, that you want to refer in the total judgement.


4.    Select “Set” of Condition, and set “JDC” to Condition and specify “Checker No.” of Total Judgement.


     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• For the link control of the laser marker and PV230/PV200, the output of the total judgement is needed. Without total
  judgement settings, the link control fails.
• If you do not use the checkers, select “Numeric value” for the expression of the numeric calculation and set “1” so that
  the result of the total judgement is output always with “1”.


ME-LPRF-SM-11                                                       147

---

## หน้า 148

6-1-7 Code reader (LP-ABR) setting
 To use the code reader LP-ABR series (LP-ABR11 / LP-ABR12) for the code checking of image checking after marking, set
 the followings by using Configurator LP-ABR software.
  • Set the code reading parameters of LP-ABR such as the code type and inversion to read the marked code symbols
without errors.
  • Set the following communication and LAN settings for LP-ABR series:

  Category                           Item                     Settings
  Common - Communication             Select Port              Set “LAN” or “RS-232C/LAN”.
  Common - LAN                       IP Address               Specify the same settings with “Image checking after
   marking” parameters in the system settings of the laser
Data Port No             marker.

Subnet Mask              Configure the communication settings according to the
   network settings. Usually the code reader and the laser
Default Gateway          marker are used on the same network.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For specifications and setting of the code reader LP-ABR series, refer to the instruction manuals for LP-ABR and
   Configurator LP-ABR.
 • While the laser marker and LP-ABR series are connected for the linkage control, do not start-up Configurator LP-ABR
   software.


 6-1-8 Code reader (DataMan) setting
 If DataMan is used for code checking of image checking after marking, set the following items.
  • DataMan IP address and Telnet Port number: Set them according to the network settings.
  • Code reading setting: Set the code type, etc. to read the code to be marked by the laser marker.

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For specifications and setting of code reader DataMan, refer to the instruction manual for DataMan.
 • Ensure that any code other than the readout target is in the DataMan shooting range. Code reading is not performed
   properly.
 • If the code type is UPC-E (6-digits UPC code), set DataMan’s “UPC/EAN Properties” as follows:
• Check off “Expanded”
• Check on “Delete Leading Zero”

  DataMan communication settings specification for connection with laser marker
  Item                         Ethernet communication specifications
  Communication protocol       TCP/IP


148                                                     ME-LPRF-SM-11

---

## หน้า 149

6-1-9 Timing chart
 Position correction - Marking (when TIMING IN signal is used)
   ON              T1
 TRIGGER IN (X5)
   OFF
   ON           Starting location detection signal
   T1
TIMING IN (No.24)
   OFF
   Marking trigger

   ON
   READY OUT (Y5)
   OFF
   ON
   T2                     T4
TIMING WAIT OUT (No.36)
   OFF

   ON
   PROCESSING OUT (Y10)                                            T3
   OFF
   ON
   LASING OUT (No.40)                                                               T5
   OFF
   ON
   SCRIPTING OUT (No.37)
   OFF
   ON
PROCESSING END OUT (Y11)                                                                               T6
   OFF


 Item    Time                 Remarks

 T1      2ms or more          Keep the ON status for 2ms or more.
 T2      ―                    Processing time of linkage operations with the image checker.
In this case, it is the following time.
 • Time for location detection by image checker
 • Time for marking position correction by the laser marker
 T3      ―                    When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON.
The output time of PROCESSING OUT includes the trigger delay time, operation time,
laser radiation time and laser marker internal processing time of the linkage devices.
 T4      Max. 60 sec          Turn on TIMING IN within 60 seconds after TIMING WAIT OUT is turned ON.
If there is no input of TIMING IN within 60 seconds, an error occurs and trigger processing
is terminated due to the abnormality.
 T5      ―                    Laser radiation time. This varies depending on marking contents.
 T6      2 to 510 ms          One-shot output. Set the output time on the system settings screen.
There is a small margin of error for the setting value.


ME-LPRF-SM-11                                                     149

---

## หน้า 150

 Marking - Image checking (when TIMING IN signal is used)
   ON
   T1
   TRIGGER IN (X5)
   OFF
   ON               Starting marking signal
   T1
   TIMING IN (No.24)
   OFF
   Starting image checking signal
   ON
   READY OUT (Y5)
   OFF
   ON
TIMING WAIT OUT (No.36)                                     T4          T5
   OFF

CHECK OK OUT (No.34)       ON                                                      T6
   or                                                                               *1   T7
CHECK NG OUT (No.35)       OFF

   ON
   PROCESSING OUT (Y10)                                                  T2
   OFF
   ON
   LASING OUT (No.40)                           T3
   OFF
   ON
   SCRIPTING OUT (No.37)
   OFF
   ON
PROCESSING END OUT (Y11)                                                                               T7
   OFF

 *1: CHECK OK OUT (No.34) / CHECK NG OUT (No.35) outputs before PROCESSING OUT (Y10) is turned OFF.

  Item     Time                  Remarks

  T1       2ms or more           Keep the ON status for 2ms or more.
  T2       ―                     When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON.
The output time of PROCESSING OUT includes the trigger delay time, operation time,
laser radiation time and laser marker internal processing time of the linkage devices.
  T3       ―                     Laser radiation time. This varies depending on marking contents.
  T4       ―                     Processing time of communication and linkage operations with the image checker.
For code checking or character checking, time for transferring the marking data to the
image checker by the laser marker is included.
  T5       Max. 60 sec.          Turn on TIMING IN within 60 seconds after TIMING WAIT OUT is turned ON.
If there is no input of TIMING IN within 60 seconds, an error occurs and trigger processing
is terminated due to the abnormality.
  T6       ―                     Processing time of linkage operations with the image checker.
In this case, it is the following time.
 • Time for reading by the image checker
 • Time for transferring the checkup results from the image checker to the laser marker
  T7       2 to 510 ms           One-shot output. Set the output time on the system settings screen.
There is a small margin of error for the setting value.


150                                                      ME-LPRF-SM-11

---

## หน้า 151

 Position correction - Marking - Image checking (when TIMING IN signal is used)
   ON            T1
   TRIGGER IN (X5)
   OFF
   Starting location
   ON                               T1                             T1
   TIMING IN (No.24)            detection signal
   OFF
   Starting marking signal        Starting image checking signal
   ON
   READY OUT (Y5)
   OFF
   ON
TIMING WAIT OUT (No.36)                   T2       T4                       T6      T4        T7
   OFF
 CHECK OK OUT (No.34) ON                                                                                  T8
   or                                                                                      *1
 CHECK NG OUT (No.35) OFF
   ON
PROCESSING OUT (Y10)                                                   T3
   OFF
   ON
   LASING OUT (No.40)                                         T5
   OFF
   ON
 SCRIPTING OUT (No.37)
   OFF
   ON                                                                             T8
   PROCESSING END OUT (Y11)
OFF

*1: CHECK OK OUT (No.34) / CHECK NG OUT (No.35) outputs is output before PROCESSING OUT (Y10) is turned OFF.

 Item     Time                  Remarks

 T1       2ms or more           Keep the ON status for 2ms or more.
 T2       ―                     Processing time of linkage operations with the image checker.
In this case, it is the following time.
 • Time for location detection by image checker
 • Time for marking position correction by the laser marker
 T3       ―                     When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON.
The output time of PROCESSING OUT includes the trigger delay time, operation time,
laser radiation time and laser marker internal processing time of the linkage devices.
 T4       Max. 60 sec.          Turn on TIMING IN within 60 seconds after TIMING WAIT OUT is turned ON.
If there is no input of TIMING IN within 60 seconds, an error occurs and trigger processing
is terminated due to the abnormality.
 T5       ―                     Laser radiation time. The time varies depending on marking contents.
 T6       ―                     Processing time of communication and linkage operations with the image checker.
For code checking or character checking, time for transferring the marking data to the
image checker by the laser marker is included.
 T7       ―                     Processing time of linkage operations with the image checker.
In this case, it is the following time.
 • Time for reading by the image checker
 • Time for transferring the checkup results from the image checker to the laser marker
 T8       2 to 510 ms           One-shot output. Set the output time on the system settings screen.
There is a small margin of error for the setting value.


ME-LPRF-SM-11                                                       151

---

## หน้า 152

 Position correction - Marking - Image checking (when TIMING IN signal is not used)
   ON                T1
   TRIGGER IN (X5)
   OFF
   Starting a series of interfaced operations signal
   ON
   READY OUT (Y5)
   OFF
   CHECK OK OUT (No.34) ON
   T6
   or                                                                               *1
   CHECK NG OUT (No.35) OFF
   ON
   PROCESSING OUT (Y10)                                           T2
   OFF
   ON
   LASING OUT (No.40)                                          T4
   OFF
   ON
   SCRIPTING OUT (No.37)                       T3                                   T5
   OFF
   ON                                                                      T6
PROCESSING END OUT (Y11)
   OFF

 *1: CHECK OK OUT (No.34) / CHECK NG OUT (No.35) outputs before PROCESSING OUT (Y10) is turned OFF.

  Item    Time               Remarks

  T1      2ms or more        Keep the ON status for 2ms or more.
  T2      ―                  When TRIGGER IN (X5) is accepted, PROCESSING OUT (Y10) turns ON.
The output time of PROCESSING OUT includes the trigger delay time, operation time,
laser radiation time and laser marker internal processing time of the linkage devices.
  T3      ―                  Processing time of linkage operations with the image checker.
In this case, it is the following time.
 • Time for location detection by image checker
 • Time for marking position correction by the laser marker
  T4      ―                  Laser radiation time. The time varies depending on marking contents.
  T5      ―                  Processing time of linkage operations with the image checker.
In this case, it is the following time.
 • Time for reading by the image checker
 • Time for transferring the checkup results from the image checker to the laser marker
  T6      2 to 510 ms        One-shot output. Set the output time on the system settings screen.
There is a small margin of error for the setting value.


152                                                  ME-LPRF-SM-11

---

## หน้า 153

6-2 Link Control with Code Reader
This product can be connected with a commercially available code reader via the RS-232C port. The code reader linkage
function allows for control of the laser marker according to the contents of the code read by the code reader.
Items to control by the code reader linkage function are listed below.

 Switch the file
Prepare a code that contains the file number or name.
When you read the code symbol, the file which has the identical number or name with the code strings is selected by the
laser marker.

 Change characters to mark or character data of the bar code/2D code to mark.
Prepare a code that contains the characters to mark.
Once the code is read, transfer the code string to the specified object number and change the characters to mark.
If the bar code/2D code is set for the specified object number, change the input characters of the code to mark.


6-2-1 Example of code reader linkage system


   w
e                                             ABCD


q


q Use a commercially available code reader and read the code that contains marking characters, or file number or name.


w The marking data or marking file are changed based on the read data


e When the marking start trigger is input, marking is performed based on the data read by the code reader

   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Characters that can be used for the code to read are alphanumeric characters and symbols in the range of ASCII code
  20(HEX) to 7E(HEX).
• It is also possible to extract a part of the read code and transfer to the laser marker. Refer to “6-2-5 Setting of code
  reader linkage functions” (P.158) for this setting.
• File switching and character transfer of the code reader linkage function cannot be used at the same time.
• The code reader linkage function can be used while the laser marker is under the remote control mode or run mode.


ME-LPRF-SM-11                                                       153

---

## หน้า 154

6-2-2 Operation flow
  Example of operations to change the file

Start the code reader and laser marker


Start up and online connect the Laser Marker NAVI smart


During remote mode control                                               During RUN mode operation

Remote mode ON                            Laser pumping ON


Laser pumping ON                            RUN mode ON


Shutter open                         Shutter open (automatic)


Read out the code that indicates the file number or name


Check the marking ready output ON

   Repeat this procedure
Marking trigger input


Laser radiation


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Confirm the laser marker and code reader communication settings in advance.


154                                                   ME-LPRF-SM-11

---

## หน้า 155

 Example of operations to change the character data to mark

Start the code reader and laser marker


Start up and online connect the Laser Marker NAVI smart


During remote mode control                                                  During RUN mode operation

Remote mode ON                       Marking target file selection


Select File                             Laser pumping ON


Laser pumping ON                             RUN mode ON


Shutter open                          Shutter open (automatic)


Read out the code that indicates the marking characters


Check the marking ready output ON

   Repeat this procedure
Marking trigger input


Laser radiation


  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Confirm the laser marker and code reader communication settings in advance.
• Specify the object number to transfer the character data in the system settings screen in advance.


ME-LPRF-SM-11                                                     155

---

## หน้า 156

6-2-3 Connection
  Connection method
 Connect the code reader to the RS-232C port on the controller.

Code reader                                        Rear of controller


RS-232C port
Laser marker side
connector specifications:
D-sub 9-pin female

 • Do not connect to other than three lines RxD (RD), TxD (SD) and GND to the laser marker.
 • Use the RS-232C cross cable to connect the code reader and laser marker, referring to the example below.

 Connection example
   Laser marker                                                                         Code reader side
   RS-232C port                                                                      Example of RS-232C port
   Example of connection cables
Terminal No.   Signal        Terminal No.                        Terminal No.        Terminal No.    Signal
   Cross cable
   2         TxD                2                                   2                     2        TxD
   3         RxD                3                                   3                     3        RxD
   5         GND                5                                   5                     5        GND
   D-sub 9-pin male                     D-sub 9-pin male
 D-sub 9-pin female                                                                       D-sub 9-pin female

ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For RS-232C port specifications, refer to “5-2 RS-232C” (P.128).


156                                                    ME-LPRF-SM-11

---

## หน้า 157

 Connectable code reader
This product can be connected with a code reader that can be operated in the RS-232C communication settings described
below.

 Communication settings (for code reader linkage control)
Communication settings for use of the code reader linkage function are listed below.
Specify the code reader communication settings according to this setting.

 Item                          RS-232C communication specifications (for code reader linkage control)
 Synchro system                Start-stop method
 Communication type            Full-duplex transmission
 Baud rate                     1200 / 2400 / 4800 / 9600 / 19200 / 38400 / 57600 / 115200 bps (initial setting: 9600 bps)
 Data length                   8-bit fixed
 Stop bits                     1-bit / 2-bit (initial setting: 1-bit)
 Parity                        None / Even / Odd (initial setting: None)
 Flow control                  None
 Start code                    None (fixed)
 Check sum                     None (fixed)
 End code                      CR (Fixed)
 Reception timer               Timeout monitoring ON (10 sec)

ワㄐㄕㄊ㄄ㄆ
• This does not guarantee the communication with all code readers. Check the performance and operation before use.
• To connect the RS-232C port with the code reader, the communication command control by RS-232C is disabled.
• The control is enabled only when the laser marker is in the remote or run status.


6-2-4 Preparation of readout code
 String that can be transferred
To use the code reader linkage function, check that the readout bar code/2D code data to read satisfy the following
conditions.
 • Generate code data by alphanumeric characters and symbols within the range of ASCII code 20(HEX) to 7E(HEX).
 • To set the file number, specify it always with 4-digits.
 • Do not contain two-byte characters and/or control codes in the code data.
 • When two-byte “%” is used, replace the code data with the following characters.

  Characters you want to use      Characters to replace with
%                               %%


   ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• As long as the code data to read satisfy the above conditions, any code type can be used.
• If any character that is not supported is contained in the read code, data cannot be transferred to the laser marker
  regardless of data extraction setting.
• For the list of ASCII codes, refer to “Serial Communication Command Guide”.


ME-LPRF-SM-11                                                 157

---

## หน้า 158

6-2-5 Setting of code reader linkage functions
 For use of the code reader linkage function, set the following items in the Laser Marker NAVI smart system settings screen.

 1.    Establish an online connection between your PC and the laser marking system.


 2.    Go to the “System settings” screen and select “Communication” tab.


 3.    Select the usage and communication settings of RS-232C.


                            Set “Code reader” to the RS-232C
                            usage.
                            Specify these values according to
                            communication settings of the code
                            reader to connect.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For the code reader linkage function, the following items of communication settings are fixed values. Align the code
   reader side settings with this setting.
• Start code: None
• Checksum: OFF
• End code: CR


 4.    In the “System settings” screen, select the “Linked device” tab.


 5.    Under “Code reader”, set “Control function”. Select
       types of data to be controlled by the code reader linkage
       function.
       • File switching by name
       • File switching by number
       • Character transmission


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • File switching and character data transmission cannot be used at the same time.


158                                                       ME-LPRF-SM-11

---

## หน้า 159

6.    To transfer a part of the code string read, set the data
      extraction.
      If “OFF” is selected, the read string is transmitted as is.

      To set the data extraction, specify the start position and
      data length of the code data in bytes.
      Setting range:
      • Extraction start position: 1 to 299 byte
      • Extraction length
        • Character transmission: 1 to 299 byte
        • File switching by name: 1 to 299 byte
        • File switching by number: 4 byte (fixed)

      Extraction example: To read code characters “ABCDE” and transfer “BCD” to the laser marker, set as follows:
      • Extraction start position [byte]: 2
      • Extraction length [byte]: 3

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• Count one single byte character as one byte.
• The data extraction position setting applies to all data read by this function.
• If the read data length is shorter than the string to extract, the code is not read.
• Set the checksum setting of the code reader RS-232C communication settings to “OFF”. If the checksum is set to “ON”,
  the communication checksum is transferred to the laser marker as marking data.
• The end code (CR) is not subject to the data extraction.


7.    If the control contents are set to character data
      transmission, specify the object number of destination.


      The read character data are transmitted to the object
      number specified here.
      Check the file to use this function and specify an
      appropriate object number.
      Object numbers available as object numbers of
      destination are as follows.
      • Object numbers for which character object is set
      • Object numbers for which a bar code or 2D code
        object is set

     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• If there is not object number set as a object number of
  destination other than a character in the file to use this
  function or code is set for the number, character data
  cannot be transmitted.


8.    Select “Apply to laser marking system” on the left side of the ribbon.
                                                                                                     “Apply to laser marking
                                                                                                     system” tool


9.    Disconnect the online connection with the laser marker.


10. Turn off the power of the laser marking system, wait five seconds and then restart the system.
      The configured items will be reflected to the laser marker.


                                                           ME-LPRF-SM-11                                                  159

---

## หน้า 160

7 Maintenance


ME-LPRF-SM-11

---

## หน้า 161

7-1 Maintenance Items
Listed below are typical parts that require cleaning or replacement depending on the usage environment or duration of
service of the laser marker.
Some parts are maintainable by the customer, and other parts are required to be repaired or replaced by our service
representative, depending on the types of parts and the defects.
For purchasing replacement parts or requesting our service representative to repair or replace parts, contact our sales
agency.


Controller
   t

   r
Head
   w

   i
   w
   u
   y
q
   e                o
   1)


Main cause for                                    Replacement when degraded or
  No.      Parts name                                              Daily maintenance
degradation                                       defective

q    Protection glass of laser          Contamination        Cleaning                     Customer-replaceable
   emission port

w    Air filter                         Contamination        Cleaning                     Customer-replaceable

e    Air-cooling fan (Controller)       Contamination        Cleaning                     Customer-replaceable

r    Exhaust vent                       Contamination        Cleaning                     ―

t    Laser oscillator                   Aging                Check output power           By our service representatives

y    Galvano scanner                    Aging                ―                            By our service representatives

u    Internal shutter                   Aging                ―                            By our service representatives

i    Battery inside the controller      Aging                ―                            Customer-replaceable

o    Contactor for interlock            Aging                ―                            Customer-replaceable

      1)   Cable                              Broken               ―                            Customer-replaceable


           ワㄐㄕㄊ㄄ㄆ
 • Be sure to use our specified replacement parts. If the user applies any other fuses than the specified one, failure might
   result.


ME-LPRF-SM-11                                                     161

---

## หน้า 162

7-2 Maintenance Details of Parts
   • Maintenance work must be conducted with the power to the laser marker
   turned OFF, and the AC power cable disconnected. Doing so may cause
   exposure to the laser beam or electrical shock.
WARNING                             • Do not insert your hands or objects to the exhaust port of each unit or the
   gaps between units during the maintenance work. This may result in injuries,
   electrical shock, or failure of the laser marker.


 7-2-1 Protection glass of laser emission port


 An f θ lens is mounted at the laser emission port of the head section. The f θ lens condenses laser irradiated from the
 oscillator at the position of the work distance. On the lens surface, AR (anti-reflection) coating is applied in order to maintain
 appropriate transmittance.
 For LP-RF series, a protection glass is attached to the laser emission port (lens). It protects the lens from dirt or damage.
 An antireflection coating is applied to the protection glass surface in order to maintain appropriate transmittance.
 Do not remove the protection glass during operation.

  Effect from deterioration
 The surface of the laser emission port may become contaminated by the dust and smoke during the laser marking. Using
 laser marker with the contaminated laser emission port may cause the lens to get burned in. This may also scratch the lens
 surface, or even peel off the surface coating depending on how it is used or cleaned.
 Operations under these conditions will degrade transmittance of laser, which may lead to deterioration in quality of marking
 and processing.

  Replacement interval
  • Deterioration in quality of marking and processing (density reduction of the marking, incomplete processing) is observed.
  • There is contamination or scratch that cannot be removed by cleaning.

  Replacement method
 Replace the protection glass of the laser emission port referring to “7-2-2 Replacement of the protection glass” (P.163).
 If any damage of the laser emission port (fθ lens) is observed when the protection glass is removed, our service
 representative handles the replacement. Contact our sales office.

  Cleaning steps for protection glass of laser emission port (Daily maintenance)
 In order to maintain stable marking quality, the protection glass of laser emission port needs to be cleaned regularly
 according to the usage environment.

 1.    Turn OFF the key switch of the controller, and disconnect the AC power cable.


 2.    Clean the laser emission port with an air duster for optics, and wipe it lightly with
       a soft cloth. If a contamination is severe, use a soft cloth immersed in ethanol to                   Protection glass
       wipe it.


        ワㄐㄕㄊ㄄ㄆ
  • Do not wipe the protection glass of laser emission port strongly, or touch it with a
    sharp pointed object. Laser marker might become faulty.                                         Soft cloth


                                              • Never use an inflammable air duster. The laser beam may ignite the gas,
          WARNING                               resulting in fire.


162                                                         ME-LPRF-SM-11

---

## หน้า 163

7-2-2 Replacement of the protection glass
In case that any contamination that cannot be cleaned adhering to the protection glass of laser emission port or any
damage on the glass surface, replace the protection glass according to the following procedure.

 Models of replacement parts
 Part name                                       Model             Remarks
 Protection glass of laser emission port         LP-ACV60          5 gaskets (O-rings) are included.


 Replacement procedure

1.   Turn off the key switch of controller and                                                            Loosen: Turn in a
     disconnect AC power cable.                             Lens (Laser                                   counter-clockwise
                                                            emission port)                                direction.


                                                             Protection glass of
2.   Remove the protection glass from the laser              the laser emission
     emission port.                                          port


                                                                                                    Tighten: Turn in a
                                                                                                    clockwise direction.
      ワㄐㄕㄊ㄄ㄆ
• Do not touch the lens and the glass surface of the laser emission port and the protection glass at installing or removing.
• If the cover is difficult to be loosened, use a commercially available belt wrench. In that case, avoid scratching the glass
  surface of the laser emission port.
• When the protection glass is removed, check that the O-ring is not left in the scanner unit.


3.   Make sure that there is no dirt on the new protection glass. If any dust or dirt are on the glass, remove them with an air
     duster for optics.


                                           • Never use an inflammable air duster. The laser beam may ignite the gas,
        WARNING                              resulting in fire.


4.   Install a new O-ring in the inside groove of the protection glass.
                                                                      O-ring


                                                                          Groove


      ワㄐㄕㄊ㄄ㄆ
• The O-ring cannot be reused. When you replace the protection glass, change the O-ring, too. Replacement O-rings are
  attached with the replacement protection glass (Optional item).
• Be sure to fit an O-ring in the inside groove of the protection glass without twisting it.
• To keep the sealing performance of the O-ring, store it following the below notes.
   • Do not expose the O-rings to the direct sunlight and high humidity.
   • Store the O-rings in a dustless area and pay attention that no organic solvents is applied to them.
   • To prevent the deforming, do not hang the O-ring during storage.


ME-LPRF-SM-11                                                      163

---

## หน้า 164

5.   Install the protection glass to the laser emission port.
      Tighten the protection glass until a resistance is felt. From that point, tighten the following length (circumference).
      Be sure to tighten the glass properly and without looseness. If the cover is not tightened enough, the ingress protection
      (IP64) of the head may not be ensured.

            Laser marker model              Protection glass model           Tightening length (Circumference)
                LP-RF200P                         LP-ACV60                            10 mm to 20 mm


                           Lens
                   (Laser emission port)


                 Protection glass of the laser
                 emission port


                                                                            Loosen: Turn in a counterclockwise
                                                                            direction.

                                      Tighten: Turn in a clockwise direction.

       ワㄐㄕㄊ㄄ㄆ
 • Do not touch the lens and the glass surface of the laser emission port and the protection glass at installing or removing.
 • Tighten the protection glass slowly with the equal tightness.
 • If the cover is difficult to be tightened, use a commercially available belt wrench. In that case, avoid scratching the glass
   surface of the laser emission port.
 • Do not operate the laser marker without the protection glass on the laser emission port.


164                                                        ME-LPRF-SM-11

---

## หน้า 165

7-2-3 Cleaning of Head
Natural-cooling system is used in the head, thus the cooling effect will                  Heat sink
significantly drop if dust or oil is adhered to the surface. Clean the head
surface according to the operation environment.

ワㄐㄕㄊ㄄ㄆ
• Do not clean the laser radiation indicator with alcohol.
  It may cause deformation, alteration or breakage of the indicator.

Rear of head


7-2-4 Intake/exhaust vent
Air-cooling system is used in the laser marker, thus the cooling effect will drop if dust is adhered to the intake or exhaust
vent and it may result in the failure of the laser marker. Clean them regularly according to the usage environment.

 Cleaning of the intake/exhaust vent (Daily maintenance)

1.   Turn OFF the key switch of the controller, and disconnect the AC power cable.


2.   Vacuum the intake/exhaust vent and remove the dust.


                                                                                            w
                                     q


                                 q                                                           w


                                                                                                        q Intake
                                                           Controller                                   w Exhaust
      ワㄐㄕㄊ㄄ㄆ
• Do not blow air to the intake/exhaust vent. If the dust penetrates in the laser marker, it may results in failure.


3.   Wipe the vent with a dried cloth. If a contamination is severe, use a cloth wrung out with neutral detergent to wipe it.
     Then, remove the detergent with a cloth wrung out of water.

      ワㄐㄕㄊ㄄ㄆ
• Keep water from entering the laser marker inside.


ME-LPRF-SM-11                                                          165

---

## หน้า 166

7-2-5 Air filter
 The air filter is placed in the air-cooling intake vent of this product. (2 filters on the controller)

  Effect from deterioration
 The air filter soiled with dust may reduce the cooling effect of the air-cooling fan. This may cause the marking performance
 to degrade, or failure of the laser marker.

  Replacement interval
  • There is a broken part, or contamination.


  Models of replacement parts
 For details of purchasing air filters, please contact our sales agency.

   Part name                 Model               Remarks
   Dedicated air filters     LP-AFT80            10 filters for bottom and 10 filters for upper side of the controller are included.


  Steps for replacement of air filter (controller)
 Replace air filter regularly according to the usage environment.

 1.    Turn OFF the key switch of the controller, and disconnect the AC power cable.                                  ヱヰ
                                                                                                                        ヸ
                                                                                                                           ユン
                                                                                                           OFF


                                                                                                                                ON


 2.    Remove the front cover of the controller.
       Apply pressure to the tabs on the top of the cover and pull it open.


                                                                                                             Cover


                                                       Tab


                           Controller


 3.    If the cover is contaminated, remove the dust with a vacuum cleaner or a dried cloth.


166                                                          ME-LPRF-SM-11

---

## หน้า 167

4.    Remove the filter attached on the fastener tapes.


5.    Attach the new filter. Press the filters to the fastener tapes.


       ワㄐㄕㄊ㄄ㄆ
 • The air filter of this product is not washable. If it is contaminated,
   replace it by new one.
 • Do not operate the laser marker without the filters. It may cause a
   product failure.


6.    Attach the front cover of the controller.
      Insert the lower part of the cover to the controller and gently push the upper
      part until it clicks into place.


                                                           ME-LPRF-SM-11               167

---

## หน้า 168

7-2-6 Air-cooling fan
 The air-cooling fan cools the laser oscillator and internal power circuit. This product has two fans (intake) on the controller.
 The controller fans rotate all the time during power on.

  Effect from deterioration
 Depending on the usage environment, any dust or contamination adhered onto the fan may impair air flow rate of the fan
 or even stop the rotation of the fan. When the cool performance decreases, the temperature in the electric circuit or laser
 oscillator will go up, which may cause an error or stoppage of laser radiation. Also, a temperature rise in the housing will
 foster deterioration in the internal parts, which may cause the marking performance to degrade, or failure of the equipment.

  Replacement interval
  • The fan does not rotate, or the rotating speed is low.
  • There is contamination on the fan that cannot be removed by cleaning.
  • Abnormal noise is generated from the fan.


  Models of replacement parts
 For details of purchasing air-cooling fans, please contact our sales agency.

   Part name                                                              Model       Remarks
   Cooling fans of controller: Set of 2 fans                              LP-AFA20    Fan for intake


  Steps for cleaning (Daily maintenance) and replacement of controller air-cooling fan
 Clean the air-cooling fan regularly according to the usage environment.

 1.      Turn OFF the key switch of the controller, and disconnect the AC power cable.


 2.      Remove the front cover and inside filter of the controller.
         Refer to “Steps for replacement of air filter (controller)” (P.166).


                                                                                                   Fan


 3.      Remove the two connectors of the fans on the controller. (One
         connector for one fan)


                                                                                                           Connector


168                                                            ME-LPRF-SM-11

---

## หน้า 169

4.    Loosen the M4 screws (2 screws for 1 fan), and
      remove the fan guard and the fan itself from the
      controller.
                                                                                                       Fan
                                                                                                                    Fan guard


                                                                                                                    Screws


5.    Remove dust and dirt adhered onto the fan by air-blowing.


       ワㄐㄕㄊ㄄ㄆ
 • Do not rinse the fan. This may cause failure of the electronic parts inside.

6.    Install the fans in the direction so that the air flow arrow on the fan points to the laser marker and the fan cable is on
      the bottom side.
      Put the fan guard on the fan and insert the screws (M4, depth 30 mm) into upper left and bottom right holes.

                             Laser marker


                                       Airflow direction


       ワㄐㄕㄊ㄄ㄆ
 • Install the controller fans in the direction so that the air flow matches the intake direction.
   Fan installed in the wrong way causes the flow to go in the wrong way, which may failure of the product.
 • Be careful not to let the cable get caught while installing.


7.    Fasten the screws (2 screws for 1 fan) from the top of the fan guard to secure the fan to the controller.
      Screw size: M4
      Tightening torque: 1.0 N·m


                                                           ME-LPRF-SM-11                                                        169

---

## หน้า 170

8.   Connect the connector for the fan. (One connector for one
      fan)


                                                                                                      Connector


 9.   Attach the air filter in the front of the fans and install the front cover of the controller.
      Refer to “Steps for replacement of air filter (controller)” (P.166).


 10. If you replaced the fans to new one, reset the operating
      information in Laser Marker NAVI smart.
      Go to the “Maintenance” screen and select “Operating data”.
      For “Controller fan operating time [h]”, select “Reset” and
      confirm with “Yes” to reset the value.


170                                                          ME-LPRF-SM-11

---

## หน้า 171

7-2-7 Laser oscillator
A fiber laser oscillator is installed in the controller. The laser beam output from the oscillator is delivered through the fiber
cable to the head. The laser is scanned and focused in the head and emitted to the target materials.

 Effect from deterioration
Laser output characteristics such as laser power will deteriorate over time due to aging of oscillator. As the laser output
characteristics deteriorate, symptoms such as ununiform marking density, chipped characters, or unstable processing
quality, etc. may occur.
Also, as cooling efficiency of the oscillator decreases because of the usage environment, the electronic parts in the
oscillator may become defective and unable to irradiate the laser.

 Replacement interval
• Deterioration in quality of marking and processing (streaking and density reduction of the marking, incomplete
   processing) is observed.
• Setting a large value for the laser power is not reflected in the quality of marking and processing.
• The laser power measured with a commercial power meter has decreased by 20%, compared to the delivery status.
• The laser radiation time has exceeded 30,000 hours.*
• Alarm for laser error occurred.
* The replacement interval may differ depending on the usage environment and marking conditions.

 How to confirm operating hoursGo to the “Maintenance” screen and select “Operating data”.

“Laser radiation time [h]” is displayed.


 Replacement method
Our service representative handles the maintenance and replacement. Contact our sales office.


ME-LPRF-SM-11                                                         171

---

## หน้า 172

 Confirm laser output (Daily inspection)
 Confirm the laser output regularly in order to maintain consistent marking quality.
 The laser output should be measured with a commercially available meter using the following steps:

 1.     Prepare a commercially available power meter.

         ワㄐㄕㄊ㄄ㄆ
  • Be sure to use the calibrated power meter.
  • The power meter with the detector having the damage threshold (maximum average power density) of more than 10kW/cm2
    should be used.
  • Also the size of the detector should be more than φ10 mm.
  • A difference may arise under the high/low temperature. Measuring power with normal temperature (20 to 30 Celsius
    degree) is recommended.
  • Before measuring the laser power, make sure there is no contamination in the laser emission port. If the laser emission
    port is contaminated or damaged, an error may result in the measurement of the laser power.

 2.     Install the power meter.
        Put the detector of the laser power meter vertically down from the center of the laser emission port and place it at the
        following distance, i.e. one-third to half of the specified work distance of the laser marker.

          Laser marker model         Installation distance for detector of power meter *
              LP-RF200P                               Approx. 90 mm

       * The values represent the recommended values for the case where the damage threshold (maximum average power
         density) of the detector of power meter is 10kW/cm2.


                      Installation distance for
                      detector of power meter

                                                                                      Laser marker head


                                                                                      Detector of power meter


                                                                                      Laser beam
                         Work distance
                       (at base position)
                                                                                      Work piece

         ワㄐㄕㄊ㄄ㄆ
  • Do not install the power meter within the focal length of the laser marker. This may cause destruction of the power meter.


172                                                        ME-LPRF-SM-11

---

## หน้า 173

3.     Establish an online connection between your PC and the laser marking system. Go to the “Maintenance” screen.


4.     Click “Laser pumping” in the ribbon to turn on the laser pumping.                       “Laser pumping” tool


                                                                                        ON status                 OFF status


5.     Click “Laser radiation for measurement” in the ribbon.
                                                                                                        “Laser radiation for
                                                                                                        measurement” tool


6.     Enter the laser power and other laser settings, then click
       “Laser radiation”.
       Click “Yes” in the laser radiation confirmation dialog to
       irradiate the laser.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Use the guide laser to confirm the setting position of the power meter
   detector. Place the detector so that the cross indication is on the center of
   the detector.
 • For stable measurement results, it is recommended to obtain the average
   output value by measuring the output after about 30 seconds from the start
   of laser radiation for 10 to 30 seconds.
 • The settings of laser radiation for measurement are common in all files.


                                               • Be sure to wear protective goggles.
          WARNING                              • During the radiation, the laser energy is concentrated to one point. Use due
                                                 caution with long period radiation, it may cause a fire or damage to the object.


7.     Click “Stop” to stop laser radiation.
       The laser radiation for measurement will automatically
       stop after about one minute even without clicking “Stop”.


                                                            ME-LPRF-SM-11                                                      173

---

## หน้า 174

8.    Check the measurement results of the power meter. If the
       power decays lower than the default setting, correct the
       laser power setting value in the “System settings” screen –
       “System offset”.
       Setting range of laser power correction: 50 to 200 [%]


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • Laser power correction refers to the function to correct not the maximum laser power [W] value but the laser power
   setting value.

        ワㄐㄕㄊ㄄ㄆ
 • If the power decays more than 20%, compared to the default setting, the laser oscillator needs maintenance. Contact our
   sales office or representatives.


 7-2-8 Galvano scanner
 Galvano scanner is a scanner for radiating the laser beam along the coordinates of marking data.
 The galvano scanner scans the drawing data by controlling the angle of galvano mirror mounted onto the axis of rotation of
 motor with two axes to create characters and graphics for marking and processing.

  Effect from deterioration
 Uneven wear may occur on the bearing inside the galvano scanner depending upon marking frequency and conditions. If
 uneven wear develops, accurate reproducing may become difficult, resulting in skewness or misalignment of marking lines.

  Replacement interval
 • Deterioration in quality of marking and processing (Characters crushed, streaking and density reduction of the marking,
    incomplete processing) is observed.
 • Warning for galvanometer error occurred.
 • Galvano scanner has been used for almost five years.*
 * The replacement interval may differ depending on the usage environment and marking conditions.

  Replacement method
 Our service representative handles the maintenance and replacement. Contact our sales office.


174                                                      ME-LPRF-SM-11

---

## หน้า 175

7-2-9 Internal shutter
The internal shutter is opened and closed by the rotary solenoid to shut off the path of laser beam.

 Effect from deterioration
When the rotation torque of the rotary solenoid declines, the opening/closing speed of the internal shutter is decreased or
the shutter may not work. In this case, an error “Internal shutter failure” occurs in the laser marker and marking cannot be
performed.

 Replacement interval
• Total number of opening/closing operations has exceeded two million.
• Alarm for internal shutter error occurred.

 How to confirm the number of opening/closing operations
Go to the “Maintenance” screen and select “Operating data”. In “Number
of shutter cycles” you can check the number of shutter open/close
operations.


 Replacement method
Our service representative handles the maintenance and replacement. Contact our sales office.


ME-LPRF-SM-11                                                      175

---

## หน้า 176

7-2-10 Replacement of contactor for interlock
 INTERLOCK terminals of I/O terminal block is connected with the operation coil of the internal contactor in the controller.
 With the open and close operation of the contactor, the power of laser oscillator turns off when the INTERLOCK terminal is
 released.

  Effect from deterioration
 When the drive of the contactor gets deteriorated by the long-term operation, the power of laser oscillator does not turn off
 correctly with INTERLOCK terminal is released.
 By using INTERLOCK MONITOR terminals, you can monitor the contact malfunction.

  Replacement interval
  • Number of switching cycles of INTERLOCK contactor has exceeded one million. (B10d = 1,000,000 times)
  • The output status of INTERLOCK MONITOR terminals (Y16-Y17, Y18-Y19) does not correspond to the input status of
INTERLOCK terminals (X16-X17, X18-X19).
  • Alarm for INTERLOCK open (E400, E401) cannot be released.


  How to confirm the number of opening/closing operations
 Go to the “Maintenance” screen and select “Operating data”.
 “Number of switching cycles of INTERLOCK contactors” is
 displayed.


  Models of replacement parts
 For details of purchasing the contactor, please contact our sales agency.

   Part name                       Model             Remarks
   Contactor unit for Interlock    LP-AEC10          Model of the contactor: SK09L-E01
(made by Fuji Electric FA Components & Systems Co., Ltd.)
Mechanical life: 10 million times
Electrical life: 1 million times


  Steps for replacement of contactor

 1.    Turn OFF the key switch of the controller, and disconnect the AC power cable.


 2.    Remove four screws on the back of the controller. To remove the side panel from the controller, slide the panel to the
       back first, then pull it to open.


176                                                      ME-LPRF-SM-11

---

## หน้า 177

3.    Disconnect the two connectors of the contactor. (See below figure.)


       ワㄐㄕㄊ㄄ㄆ
• Before the maintenance work, always discharge the static electricity by touching the grounded metal objects, etc. Static
  electricity can damage electrical components inside controller.
• Do not touch any other devices on the circuit board.


4.    If the cables to the contactor are fixed to the controller with the cable ties, cut the cable tie with a diagonal cutter for
      plastics.
      At a maximum, 4 cable ties are used. The number of the cable ties differs depending on the production date.


                                             • Wear the protection goggles to cut the cable tie. The cutting piece may fly and
         WARNING                               hurt your eyes.


       ワㄐㄕㄊ㄄ㄆ
• Do not touch any other devices on the                                                             Connector
  circuit board.
• Do not cut or damage the cables when
  you cut the cable tie.


Cable tie


5.    Loosen the two bolts of the contactor with M4 hexagonal
      wrench and remove the contactor unit from the controller.

                                                                             Bolt
6.    Install the new contactor unit. Insert the bolt to the washer
      and tighten the bolts (two positions) with M4 hexagonal
      wrench to fix the contactor unit to the controller.


      Tightening torque: 1.0 N·m

       ワㄐㄕㄊ㄄ㄆ
• Be careful not to let the cable get caught while installing.
   Washer
ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• To the optional contactor unit, the cables are already connected at the delivery state.


ME-LPRF-SM-11                                                             177

---

## หน้า 178

7.   Make sure that the 4 cable tie fixtures are in the controller
      as shown in the figure. If not, put the fixtures attached to
      the optional contactor unit to the places as indicated.                    125

       ワㄐㄕㄊ㄄ㄆ
 • Put the each cable tie fixture with the directions indicated in


                                                                                          105
   the figure.
 • Use the cable ties and fixtures attached to the optional
   contactor unit. If you use incorrect parts, it may cause a
   product failure.

                                                                                     15

                                                                                                    15
                                                                                           70

                                                                                                    20
                                                                          Unit: mm


 8.   Connect the two connectors of the                                                         Connector
      contactor to the controller.


 9.   Set the cable ties attached to the
      optional contactor unit to the 4 fixtures
      and fix the cables of the contactor unit.

       ワㄐㄕㄊ㄄ㄆ
 • Use the cable ties and fixtures attached
   to the optional contactor unit. If you use
   incorrect parts, it may cause a product
   failure.


Cable tie


178                                                       ME-LPRF-SM-11

---

## หน้า 179

10. Insert the side panel straight. The projecting part of upper and bottom of the side panel should be fit the drain of the
     controller. Slide the panel to the front of the controller and tighten the screws (M3 screws, four positions) of the back of
     the controller.


     Tightening torque: 0.5 N·m

      ワㄐㄕㄊ㄄ㄆ
• Be careful not to let the inside cables get caught while installing.


11. If you replaced the contactor, reset the operating data in
     Laser Marker NAVI smart.
     Go to the “Maintenance” screen and select “Operating data”.
     For “Number of switching cycles of INTERLOCK contactors”,
     select “Reset” and confirm with “Yes” to reset the value.


                                                         ME-LPRF-SM-11                                                         179

---

## หน้า 180

7-2-11 Replacement of battery inside the controller
 A lithium battery is contained inside the controller as battery for clock or calendar of the laser marker. Functional characters
 such as the current date/time, expiry date/time, and lot date/time are marked based on the time of this clock.

  Effect from deterioration
 When the battery inside the controller runs out due to aging, the date and time of the system clock may be out of
 synchronization when the laser marker is turned OFF. If you start the laser marker in such a condition, an alarm for system
 clock may occur and the date and time setting is required. This alarm is generated every time the laser marker is started
 until the internal battery is replaced.

  Replacement interval
  • An alarm for system clock occurred.
  • Almost ten years have passed since delivery.

  Models of replacement parts
 Be sure to use the following type of battery inside the controller: For details of purchasing it, contact our sales office.

   Type                                                     Model
   Manganese dioxide lithium primary battery (coin-         AFPX-BATT (CR-2450)
   type) with dedicated connector                           (made by Panasonic Industrial Devices SUNX Co., Ltd.)


  Steps for replacement

 1.    Turn OFF the key switch of the controller, and disconnect the AC power cable.


 2.    Remove four screws on the back of the controller. To remove the side panel from the controller, slide the panel to the
       back first, then pull it to open.


180                                                        ME-LPRF-SM-11

---

## หน้า 181

3.    Loosen the screws (two locations) on the cover panel of the battery inside the controller and remove the cover.


       ワㄐㄕㄊ㄄ㄆ
 • Before the maintenance work, always discharge the static electricity by touching the grounded metal objects, etc. Static
   electricity can damage electrical components inside controller.
 • Do not touch any other devices on the circuit board.


4.    Remove the connector for the battery inside the controller (coin-type).
      Attach the connector to the new battery.

       ワㄐㄕㄊ㄄ㄆ
 • If you wish to dispose used batteries, please comply with its regional regulation. For
   the correct method of disposal, please contact your local municipality, waste disposal
   services, or the point of sale where you purchased the batteries.


5.    Tighten the screws (two locations) on the cover panel of the battery inside the controller and install the cover.
      Tightening torque: 0.5 N·m


6.    Insert the side panel straight. The projecting part of upper and bottom of the side panel should be fit the drain of the
      controller. Slide the panel to the front of the controller and tighten the screws (M3 screws, four positions) of the back of
      the controller.


      Tightening torque: 0.5 N·m

       ワㄐㄕㄊ㄄ㄆ
 • Be careful not to let the inside cables get caught while installing.


                                                          ME-LPRF-SM-11                                                        181

---

## หน้า 182

7.    Establish an online connection between your PC and the laser marking system. Go to the “System settings” screen
       and select “Operation/Information” tab. Select “Change” next to the “System clock” to set the date and time.


 8.    Select “Apply to laser marking system” on the left side of the ribbon.                      “Apply to laser marking
                                                                                                   system” tool
      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • An alarm for system clock stop may be generated when the laser marker is started for the first time since the battery
   replacement. To release the alarm, reset the date and time and click the confirmation button in the error dialog.


182                                                       ME-LPRF-SM-11

---

## หน้า 183

7-2-12 Replacement of cable
If the cable connecting the head and controller is broken because of the usage conditions and installation environment, it
needs to be replaced.

 Models of replacement parts
For details of purchasing cables, contact our sales office.

 Part name                Model
 Unit power cable         LP-ACP20-5


 Signal cable             LP-ACS10-5


 Steps for replacement
See “2-5-1 Connection of head and controller” (P.47), and connect cables.

ワㄐㄕㄊ㄄ㄆ
• To ensure the ingress protection (IP64) of the head, install the attached connector cover to the cable. Refer to “Installing
  connector cover to cable” (P.48).


7-3 Obtaining Backup Data
Obtain and keep a backup of data registered in the laser marker periodically using the Laser Marker NAVI smart in case of
replacing laser markers for repairing and maintaining purposes.

 Steps for obtaining backup data (daily maintenance)

1.   Establish an online connection between your PC and the laser marking system.


2.   Go to the “Data management” screen and select “Backup” in the ribbon.


3.   Specify the name and storage destination for a backup file.
     Select “Save” to save the backup file.


                                                        ME-LPRF-SM-11                                                      183

---

## หน้า 184

7-4 Serial Number Checking Method
 Notify our sales office or representatives of the laser marker serial number for inspection or repair.
 The head and controller is delivered with the same serial numbers.

  Check it on laser marker main unit
 The serial number of the laser marker is written on the area marked by a circle in the figure below.


  Model name LP-RF200P
  Serial No. XXXXXX
  Lot No. XXXX
  PRD.      MM/YYYY
  WORK DISTANCE XXX.X mm
Panasonic Industrial Devices SUNX Co., Ltd.
   Made in China


Head

Rear of controller


  Check it on Laser Marker NAVI smart

 1.   Establish an online connection between your PC and the laser marking system.


 2.   Go to the “System settings” screen and select “System information” in the ribbon.                   “System information”
      The serial numbers for the head and controller are displayed in the dialog.                         tool


184                                                           ME-LPRF-SM-11

---

## หน้า 185

7-5 Disposal of Laser Marker
To dispose of the laser marker, in accordance with the regional regulation, please request the industrial waste disposer.
Dispose of the laser marker as industrial waste, and never discard it with regular trash.

ワㄐㄕㄊ㄄ㄆ
 • Be sure to delete all registered data when transferring or discarding the laser marker. Retained data might result in illegal
   read out and leaking of information by a third-party with malicious intent.


7-5-1 Disposal of old equipment and batteries
Only for European Union and countries with recycling systems

These symbols on the products, packaging, and/or accompanying documents mean that used electrical
and electronic products and batteries must not be mixed with general household waste.
For proper treatment, recovery and recycling of old products and batteries, please take them to
applicable collection points in accordance with your national legislation.
By disposing of them correctly, you will help to save valuable resources and prevent any potential
negative effects on human health and the environment.
For more information about collection and recycling, please contact your local municipality.
Penalties may be applicable for incorrect disposal of this waste, in accordance with national legislation.


Note for the battery symbol (bottom symbol)
This symbol might be used in combination with a chemical symbol. In this case it complies with the
requirement set by the Directive for the chemical involved.


ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For removing the battery, see “7-2-11 Replacement of battery inside the controller” (P.180).


ME-LPRF-SM-11                                                      185

---

## หน้า 186

Troubleshooting


ME-LPRF-SM-11

---

## หน้า 187

Troubleshooting
If any operation errors occur, check items below.
When the problems cannot be resolved, please contact our sales office or representatives.

 Start-up
Troubles                            Causes                                         Measures

Power cable is not connected.              Connect the power supply cable.

Key switch is not turned on.               Turn on the key switch.

  • Power supply is not      Power is not supplied.                     Check the power supply.
turned on.
  • The system does not      For LP-GS series:                          Replace the fuse by following the procedures
start up.                Fuse is blown.                             described in the “Setup/Maintenance Guide”.

   Turn on the circuit protector by following the
For LP-RC/LP-RF/LP-RV series:
   procedures described in the “Setup/Maintenance
Circuit protector is OFF.
   Guide”.


 Laser pumping
Troubles                               Causes                                               Measures

The connection of the following I/O terminals is
released.
   • Check the connection of each terminal
 • INTERLOCK 1(+) - INTERLOCK 1(-) (X16 - X17)
   on the I/O terminal block.
 • INTERLOCK 2(+) - INTERLOCK 2(-) (X18 - X19)
   • If the safety equipment such as door
 • For LP-GS series:
   and switch is in released status, restore
   LASER STOP 2 IN (X11) - OUT COM. 1
   the original condition.
 • For LP-RC/LP-RF/LP-RV series:
 Laser pumping           REMOTE INTERLOCK IN (X20) - OUT COM. 1
 does not start.
   Solve the safety problem. Then select
The stop laser button of the Laser Marker NAVI smart
   “Reset” in the error dialog in Laser Marker
is pressed.
   NAVI smart to finish the laser stop status.

   Connect the internal or external power
Power is not supplied to the common terminal of the
   supply to IN COM.1 and OUT COM.1 in the
I/O terminal block.
   I/O terminal respectively.

   Refer to “External Control” in
Signals from the external control device are refused.
   Troubleshooting.

• Check if the laser pumping control
 Laser pumping                                                                   method set in the system settings
 does not start in                                                               screen (I/O or communication
The setting of a laser pumping control method in
 remote mode.                                                                    command) and the actual control
the system settings screen is not consistent with the
   method are consistent.
actual control method.
   • If the laser pumping method is changed
   in the system settings screen, restart
   the laser marker.


ME-LPRF-SM-11                                                     187

---

## หน้า 188

 Connection with Laser Marker NAVI smart
Troubles                             Causes                                          Measures

Laser marker has not been started.          Refer to “Start-up” in Troubleshooting.

  Online connection fails.    PC and laser marker are not
Connect them with a USB cable or a LAN cable.
  (The laser marker is not    connected.
  indicated as an available
  laser marker.)                                                          Refer to the “Laser Marker NAVI smart Operation
USB driver is not installed properly.       Manual” to install the USB driver to all the laser
   markers to connect.

   To maintain the online connection, disable the
PC is in the sleep or hibernate state.
   sleep setting of the PC.

  Online connection is
The PC stayed no communication
  disconnected.
state with the laser marker for a certain   To maintain the online connection, terminate the
period of time with the high load (high     high CPU usage application.
CPU usage).

   Establish the USB online connection and confirm
Ethernet communication settings are
   the Ethernet communication settings in the
incorrect.
   system settings. Then, restart the laser marker.

   In the dialog for online connection, select the
Ethernet is not listed in the dialog for
  Ethernet online                                                         “Including Ethernet” checkbox and search for
online connection.
  connection fails.                                                       laser markers.

The connecting port of the LAN cable
to the PC is wrong. (Connected to           Connect the cable to the port marked “LAN” on
EtherNet/IP or PROFINET port by             the rear of the controller.
mistake.)

   Bluetooth function is available for the following
A laser marker of the model not             laser markers.
compatible with Bluetooth is used.          LP-GS051 / LP-GS051-E / LP-GS051-L /
   LP-GS051-LE / LP-GS052 / LP-GS052-E

   Establish the USB online connection and enable
Bluetooth communication setting is
   the Bluetooth communication in the system
disabled.
   settings. Then, restart the laser marker.

  For LP-GS series:
PC's Bluetooth module is apart from         Operate the product with the laser marker head
  Bluetooth online
the head of the laser marker.               within 5m from the PC.
  connection fails.

The ambient environment is not suited
for Bluetooth communication.
 • Wireless LAN or other wireless
   device is used around.                   Establish Bluetooth communication in an
 • There is an obstacle between the         environment suited for stable wireless connection.
   laser marker head and the PC.
 • The environment is subject to
   weaker radio wave signals.


188                                                      ME-LPRF-SM-11

---

## หน้า 189

 Lasing operation
Troubles                             Causes                                         Measures

   • Remove obstacle between laser emission port
   of laser marker head and work piece.
Obstacle hinders laser beam.
   • For LP-RF/LP-RV series, remove the
   protection cap of the laser emission port.

   Adjust distance between bottom surface of laser
Distance to work piece is not
   marker head and the work piece surface as
appropriate.
   specified.

For LP-GS series:
The set Z-position does not match the      Set the Z-position according to the work piece
height of the actual target object.        height.
(The LP-GSxxx-L type is excluded.)

• Check the marking position using the guide
 Marking cannot be done.
laser or guide pointer to check if the work piece
 (The laser emission
is out of the specified position.
 indicator blinks but
• For LP-RC/LP-RF/LP-RV series:
 marking is not performed     The work piece is not in place.
Connecting a sensor to TARGET DETECTION
 on the work piece.)
IN (X7) of I/O terminal block, you can check
the presence of the work piece during laser
radiation.

   • Increase laser power (including correction
   factor).
Laser power is insufficient.
   • Decrease scan speed (including correction
   factor).

   Materials can be marked differ depending on
   wavelength and output power of laser marker.
Laser type (wavelength, output power,
   • LP-GS/LP-RC is not suitable for metal
etc.) is not appropriate for material of
   material.
the work piece.
   • LP-RF/LP-RV is not suitable for transparent
   material.

In RUN mode:
   Turn the RUN mode ON, and then input a signal
The RUN Mode is not active or the
   to TRIGGER IN of the I/O terminal block.
marking start signal is not input.

Check connections with external equipment for
 Marking is not performed
mis-connection, disconnection or contact failure
 in RUN/REMOTE mode.
The marking trigger signal of the I/O      due to any loose connector.
 (The laser emission
terminal block is not input.
 indicator does not light.)
Confirm that TRIGGER IN is input by one-shot
signal of more than 2ms per marking cycle.

The marking trigger is entered while
   Refer to “External Control” in Troubleshooting.
the marking ready is OFF.

Fumes causes malfunction of                • Install a dust collector to eliminate the fume
 Sometimes laser is
photoelectric sensor for marking trigger     (gas) generated during lasing.
 emitted unintentionally.
signal.                                    • Check that dust collector works well.


ME-LPRF-SM-11                                                       189

---

## หน้า 190

Troubles                              Causes                                           Measures

• The setting of the laser head
  Marking position is            direction is not consistent with the       Check the setting direction of the laser head,
  deviated from the              actual install direction.                  X-axis/ Y-axis offset or rotation offset setting of
  expected setting position.   • System offset values are input on          the system settings screen.
the system settings screen.


  Marking quality
Troubles                              Causes                                           Measures

   • Clean contaminants off the laser emission
   port by following the procedures described in
   “Setup/Maintenance Guide”.
Laser emission port is not clean.
   • For LP-RF/LP-RV series:
   If contaminants persist, replace the protection
   glass of the laser emission port.

Fumes occurring during lasing hinder          • Install dust collector.
laser beam.                                   • Check that dust collector works well.

   Adjust distance between bottom surface of laser
Distance to the work piece is not
   marker head and marking surface of the work
appropriate.
   piece.

For LP-GS series:
The set Z-position does not match the        Set the Z-position according to the work piece
height of the actual target work piece.      height.
(The LP-GSxxx-L type is excluded.)

   Make adjustment so that bottom surface of laser
Marking surface of work piece is
   marker head and marking surface of the work
inclined.
   piece are parallel with each other.
  Marking is totally faded/
  Marking is partially
There are variations in properties of the
  faded.
work pieces.
 • Thickness varies.
   Adjust the marking conditions and work distance
 • Surface roughness varies (including
   according to respective work pieces.
   those in gloss).
 • Material varies (including those in
   chemical composition).

   Adjust work piece feeder so that work piece
Work piece feeder is not stable.
   position becomes stable.

   • Increase setting value of laser power.
   • Decrease scan speed.
Performance of laser oscillator              If it is not possible to get the same marking quality
deteriorates due to aging.                   as before even with the max. value of the laser
   power setting, laser oscillator must be replaced.
   Contact our sales office.

   Adjust the pulse duration according to the material
For LP-RV series:                            of the work piece.
The setting value of the pulse duration is   For plastic work pieces the pulse duration 4ns or
not appropriate.                             8ns is a common setting, and for metal, 16ns or
   30ns is often selected.


190                                                       ME-LPRF-SM-11

---

## หน้า 191

Troubles                            Causes                                          Measures

• For LP-GS/LP-RC series:
  Set “Power optimization by marking position”
The marking around          Decrease of the laser energy density in
in “System offset” in System settings screen.
edge of the marking field   the edge of marking field may affect the
• For LP-RF/LP-RV series:
is faded or chipped.        marking quality.
Set the power correction to the marking
objects in the edge of the marking field.

   Remove obstacle between laser emission port
Obstacle hinders laser beam.
   and work piece.

• Clean contaminants off the laser emission
Character is partially
port by following the procedures described in
chipped.
   “Setup/Maintenance Guide”.
Laser emission port is not clean.
   • For LP-RF/LP-RV series:
   If contaminants persist, replace the protection
   glass of the laser emission port.

   • Fix head with the specified torque.
Head lacks fixation strength.
   • Improve strength of head mounting.

Constant vibration from surrounding
equipment (motor and press, etc.)
influences.

There are irregular vibrations coming      Perform vibration prevention measures.
from surrounding equipment (air
cylinder and forklift, etc.).
(Marking is disturbed at irregular
intervals.)

Disturbed at the beginning of marking:
Marking trigger signal is likely to be input
before work piece is fully stopped. Marking may
disturbed due to remaining vibration even if work
Marking is disorder.                                                   piece is in full stop.Turn the marking trigger signal
(Characters lose shape                                                 ON after vibrations are completely damped.
Start and/or stop timing of feeder does
or not formed.)
not match with marking operation.
   Disturbed at the end of marking:
   Work piece is likely to start moving before
   completion of marking.
   Delay start timing of feeder or speed up scan
   speed so that marking is finished before work
   piece starts moving.

   Protect laser marker against noises as follows:
   • Securely ground the frame ground terminal of
   laser marker or surrounding equipment.
   • Isolate power and signal lines from each other
There are noises coming from                 if they have been routed in parallel.
surrounding equipment.                     • Shield signal line.
   • Isolate power supply for laser marker from
   other equipment.
   • Use noise cut transformer to absorb noises
   from power supply.

Marking line runs over                                                 Adjustment the lasing quality parameters such as
The setting in lasing quality parameters
the intended start or end                                              starting point, ending point or wait value in laser
does not match the other settings.
points.                                                                settings of the “Marking settings” screen.


ME-LPRF-SM-11                                                        191

---

## หน้า 192

Troubles                          Causes                                       Measures

 When the character size
• Use “Original 2” or “Original 5” font for the
 is small, the marking     The setting conditions or font are
small size characters.
 characters are not        inadequate for the character size.
• Adjust the laser power or scan speed.
 readable.

• For LP-GS series:
   Decrease scan speed or increase laser
  Setting of laser frequency and scan
   frequency.
  speed is inadequate.
 Marking is dotted.
• For LP-RF/LP-RV series:
  Setting of pulse cycle and scan        Decrease scan speed or pulse cycle.
  speed is inadequate.


192                                                 ME-LPRF-SM-11

---

## หน้า 193

 Moving objects

  ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
• The on-the-fly marking is not available to LP-GS series.


Troubles                        Causes                                           Measures

• Set the trigger mode to Multiple triggers if you want
  to input next triggers while the trigger processing
  operation.
• Place the trigger sensor closer to the laser marker and
 Marking is sometimes        Marking trigger signal is entered
set the smaller value to Trigger detecting position.
 skipped.                    before current marking is
• Reduce the marking time with the measures such as
 (E750 occurs.)              finished.
  increasing the scan speed and etc.
• Reduce feeder speed.
• Increase marking interval (interval between objects on
  feeder).

 The start lines of the      The timing of lasing does not
Input larger value to Overrun correction.
 characters are distorted.   match with the line speed.

   • Match feed direction with laser marker operation.
The setting of the moving
   • Check the setting direction of the laser head of the
direction is wrong.
   system settings screen.

Speed changes at conveyor            If conveyors are coupled, avoid marking near conveyor
junction.                            junction.

Actual speed and preset speed
for feeding objects are different    Remove cause of object slippage.
due to slippage of objects.

Positional misalignment is likely
 Characters are distorted.
to occur due to meandering           Secure objects to prevent misalignment.
 Character pitch is
motion of conveyor.
 unstable.

   • Check the conveyor and remove the cause of the
The moving speed of the                 speed change.
conveyor is not stable.               • To keep up the conveyor speed, use encoder to
   feedback the change of the speed.

   Adjust the setting value of the line speed by checking the
When Line speed control is set
   marking quality.
to Fixed speed:
   • When the Character Spacing is too wide:
The setting speed is not
   Increase the setting.
consistent with the actual line
   • When the character spacing is too narrow:
speed.
   Decrease the setting.


ME-LPRF-SM-11                                                      193

---

## หน้า 194

Troubles                        Causes                                         Measures

   • Make sure that the encoder operates properly.
   • Make sure that the setting value of Encoder resolution
   is correct.
When Line speed control is set
   • When using A phase only:
to Encoder input:
   Encoder resolution = Number of pulses/mm x 2
The line speed could not be
   • When using A and B phases:
measured correctly by the
   Encoder resolution = Number of pulses/mm x 4
encoder.
   • When only one phase of the encoder is used, connect
   the encoder signal to ENCODER A IN (X13) and
   connect ENCODER B IN (X14) to IN COM. 1 (X2).

   • Place the encoder closer to the trigger sensor.
   • Adjust the setting value of Encoder resolution by
   checking the marking quality.
When Line speed control is set         • When the character spacing is too wide:
to Encoder input:                        Increase the setting.
The input speed of the encoder         • When the character spacing is too narrow:
is not consistent with the actual        Decrease the setting.
 Characters are distorted.
line speed at marking.              • In some cases, it may reduce the influence of the ups
 Character pitch is
and downs of the line speed to decrease the encoder
 unstable.
resolution. However, it is recommended to set more
than 25pulses/mm to Encoder resolution.

When Line speed control is set
   • Check the setting value of Distance line speed
to 2 sensors input:
   sensors.
The line speed could not be
   • Confirm the sensors for line speed detection operate
measured correctly by the two
   properly.
sensors.

   • Place the trigger sensor closer to the line speed
   detection sensors so that the difference of the speed
When Line speed control is set        at detection and at marking may reduce.
to 2 sensors input:                 • Adjust the setting value of Distance line speed
The input speed of the 2              sensors by checking the marking quality.
sensors is not consistent with         • When the character spacing is too wide:
the actual line speed at marking.        Increase the setting.
   • When the character spacing is too narrow:
   Decrease the setting.


194                                                    ME-LPRF-SM-11

---

## หน้า 195

 External control
Troubles                    Causes                                             Measures

   • Select the remote mode by following the procedure indicated
   in “Setup/Maintenance Guide”.
   • Check if the entering method of the remote mode set in the
Laser marker is not in remote
   system settings screen (I/O or PC software) and the actual
mode.
   control method are consistent.
   • If the entering method of the remote mode is changed in the
   system settings screen, restart the laser marker.

   • Check connections with external equipment for mis-
   connection, disconnection or contact failure due to any loose
The connection with external        connector.
devices is inadequate.            • Check for continuity using tester or the like.
   • For RS-232C connection, confirm the wiring of the external
   device including the loop back connection.

• Match communication parameter settings to external
  equipment.
• If any of the communication settings (Ethernet settings,
  EtherNet/IP settings, or RS-232C usage) in System settings
 Communication with
Communication parameter             screen are changed, restart the laser marker.
 the external device
settings are incorrect.           • If you use DHCP of EtherNet/IP settings, confirm the
 cannot start.
  connection of the DHCP server of your network.
• When using RS-232C, specify the “Flow control” to “None”
  at the communication port settings of the external control
  device.

   Check the communication setting. If Ethernet or EtherNet/IP
The communication setting
   is used, check the IP address, etc. When the backup file is
was changed at the time of
   restored, the communication setting is overwritten by the backup
backup file restoration.
   data.

   Protect laser marker against noises as follows:
   • Securely ground the frame ground terminal of laser marker or
   surrounding equipment.
   • Isolate power and signal lines from each other if they have
There are noises coming
   been routed in parallel.
from surrounding equipment.
   • Shield signal line.
   • Isolate power supply for laser marker from other equipment.
   • Use noise cut transformer to absorb noises from power
   supply.

   • Check the settings of the control method under “Operation/
   information” tab in System settings screen. If “command” is
   selected to the corresponding operation, change it to “I/O”.
The settings in the system        • Check the I/O settings under “Inputs/outputs” tab in System
settings screen are not             settings screen.
 Control by I/O fails.
consistent with the actual        • If you use EtherNet/IP or PROFINET, check the “Control
control method.                     method of input signals” under “Communication” tab in
   System settings screen.
   • If any of the above settings are changed in the system
   settings screen, restart the laser marker.

• Check the command history in the “Maintenance” screen of
 Control by              Command data is not
Laser Marker NAVI smart.
 communication           received from external
• Using commercially available line monitor or protocol
 command fails.          equipment.
analyzer, check if the external equipment transmits data.


ME-LPRF-SM-11                                                      195

---

## หน้า 196

Troubles                   Causes                                                Measures

   • For RS-232C or Ethernet, check if the start code specified
   in laser marker system settings screen and start code of the
Communication data format
   transmitted data are consistent.
(start code) is inadequate.
   • If you use EtherNet/IP or PROFINET, do not contain the start
   code in the command data.

   • For RS-232C or Ethernet, check if an end code is placed at
   the end of the transmitted data.
Communication data format            • For RS-232C, check if the end code is the value specified in
(end code) is inadequate.              the laser marker system settings screen.
 Control by                                                • If you use EtherNet/IP or PROFINET, do not contain the end
 communication                                               code in the command data.
 command fails.
   • If you want to use the same command format with the
   former models of LP-400/LP-V series, enable “LP-400/V
   compatibility” in system settings of Laser Marker NAVI smart.
   • If you want to use the standard command format, switch the
Command mode (LP-400/V                 mode by RSM command or disable “LP-400/V compatibility”
compatibility setting) is wrong.       in system settings of Laser Marker NAVI smart.
   • If you use EtherNet/IP or PROFINET, deactivate “LP-400/
   V compatibility” in System settings screen. You cannot use
   the command format in LP-400/V compatible mode via
   EtherNet/IP or PROFINET.

An error occurs.                     Check the error code and cancel the alarm or warning.

   • Do not input the next marking trigger until the trigger
   processing is completed.
Marking trigger is in
   • When trigger mode is set to Multiple triggers at on-the-fly
progress.
   marking, max. 16 triggers can be accepted while the trigger
   processing operation.

   Turn ON the laser pumping.
Laser pumping is turned
   If the laser pumping fails, refer to “Laser pumping” in
OFF.
   Troubleshooting.

• Open the internal shutter.
• Check if the shutter open/close control method set in the
  system settings screen (I/O or communication command) and
 Marking ready does   Internal shutter is closed.
the actual control method are consistent.
 not turn ON.
• If the shutter open/close method is changed in the system
  settings screen, restart the laser marker.

   If the file number is changed, the marking ready is turned OFF
File switching is not                for dozens of ms or seconds to create marking data. Input
complete.                            marking trigger signal after making sure that READY output is
   ON if you changed the file.

Either of registered
   • If “Registered characters via I/O”, “External offset” or
characters via I/O, external
   “Characters specified by SIN command” are used, input
offset or characters specified
   respective data at every marking.
by SIN command are used
   • For LP-RC/LP-RF/LP-RV series:
and marking data is not input
   Using DATA WAIT OUT (No.38) of I/O connector, you can
from the external control
   confirm the laser marker becomes waiting status of input.
device.


196                                                      ME-LPRF-SM-11

---

## หน้า 197

Troubles                    Causes                                             Measures

For communication
command control:
“reception mode ON”                Set “reception mode OFF” for command reception permission
is set for command                 (MKM command).
reception permission (MKM
Marking ready does     command).
not turn ON.
For LP-RC/LP-RF/LP-RV
series:                            Once the counter is reset during On-the-fly marking operation,
Counter has been reset             READY OUT becomes OFF temporarily and may not accept the
during On-the-fly marking          trigger. Please check the counter reset timing.
operation.

   To use the following commands, specify the control method
   to the communication command in Laser Marker NAVI smart
   system settings and restart the laser marker.
   • Laser pumping (LSR)
The requested operation can
   • Shutter open/close (SHT)
be controlled only by I/O with
   • Guide Laser (GID) (except LP-GS052 type)
the current system settings.

The following commands are available only when the shutter
open/close control method is set to communication command.
 • Laser radiation for measurement (SPT)

   Except the following commands *, the laser marker cannot
   accept the setting request commands unless it is in the “reception
   mode ON” status. For command transmission, set “reception
   mode ON” by MKM command.
   • File selection by number (FNO)
“Reception mode ON”
   • File selection by name (FNN)
is not set for command
   • Shutter open/close (SHT)
reception permission (MKM
   • Command reception permission (MKM)
command).
The sending                                                • Laser pumping (LSR)
command is not                                             • Counter reset (CTR)
accepted and                                               • Marking trigger (MRK)
negative response is                                       • Character entry per trigger (SIN)
returned.                                                  • Marking position and laser power adjustment per trigger (SEO)

   All commands except the following commands * cannot be
   accepted while alarm or error is active.
   When alarm occurred:
   • Status checking (STS)
   • I/O monitor (IOM)
   • Operating data (RTD)
   • Error history (ERH)
   • Alarm reset (ARS)
   • Error code (ENO)
Alarm or Warning occurred.
   When warning occurred:
   • Status checking (STS)
   • I/O monitor (IOM)
   • Operating data (RTD)
   • Error history (ERH)
   • Alarm reset (ARS)
   • Error code (ENO)
   • Shutter open/close (SHT) (Only closing and readout request)
   • Command reception permission (MKM) (readout only)


ME-LPRF-SM-11                                                     197

---

## หน้า 198

Troubles                    Causes                                              Measures

Two or more command data             After sending the command, confirm the response data from the
are transmitted at the same          laser marker. Do not send the next command before receiving
time.                                the response.

   • If you want to use the same command format with the
   former models of LP-400/LP-V series, enable “LP-400/V
Command mode (LP-400/V                 compatibility” in system settings of Laser Marker NAVI smart.
 The sending            compatibility setting) is wrong.     • If you want to use the standard command format, switch the
 command is not                                                mode by RSM command or disable “LP-400/V compatibility”
 accepted and                                                  in system settings of Laser Marker NAVI smart.
 negative response is
 returned.                                                   • Check the setting for “Encoding for non-ASCII characters” in
   the “System settings”.
   • Check if characters in the readout strings can be encoded with
   ASCII code or the character code specified in “Encoding for
The character code is wrong.
   non-ASCII characters”.
   • “Shift JIS”, “GB 2312” and “Latin-1” cannot be used together.
   • In LP-400/V compatible mode, only ASCII code and Shift JIS
   are available.

 * These commands are applicable with the standard command mode. For the LP-400/V compatible mode, refer to the “Serial
   Communication Command Guide: LP-400/V compatible mode”.


198                                                        ME-LPRF-SM-11

---

## หน้า 199

 Link control with external devices
Troubles                      Causes                                             Measures

The connections with the
image checker or code             • Refer to “Setup/Maintenance Guide” for the wiring and
reader are inadequate.              communication settings.
   • If the Ethernet communication settings or RS-232C usage are
Communication settings are          changed, restart the laser marker.
 Link control with
inadequate.
 image checker and
 code reader fails.
The connecting port of
the LAN cable to the
   Connect the cable to the port marked “LAN” on the rear of the
image checker is wrong.
   controller.
(Connected to EtherNet/IP or
PROFINET port by mistake.)

The coordinates of the image
   Set the calibration of the image checker and match the
checker are not consistent
   coordinate origin of the image checker to the center point of the
with the marking position of
   marking field of the laser marker.
the laser marker.
 Marking cannot
 be done in an                                              Confirm the following settings of PV230/PV200.
 appropriate position                                       • Setting of Ethernet with the protocol General communication
Settings of the image checker
 when the function of                                       • Calibration
are inadequate.
 position correction is                                     • Settings of the positional correction
 used.                                                      • Expression of the numeric calculation

The setting order of the
   The results of the numerical calculation should output to the laser
expression table of PV230/
   marker in the order of X, Y, and theta.
PV200 is inadequate.

Testing conditions of image       Set appropriate testing conditions of the image checker
checker are inadequate.           according to marked code type or character settings.

Unnecessary objects are
   Do not place the code symbols or characters other than the
included in the captured
   image checking target in the imaging range.
image.

   • For code checking, confirm the settings of the code reader
   checker of PV230.
When PV230 is used:
   • For character checking, confirm the settings of the OCR
 The results of the       Settings of the total
checker of PV230.
 code or character        judgement are inadequate.
• Cofirm the expression of the numeric calculation in the total
 checking is NG.
judgement.

When PV230 is used:
   To use the character recognition function, set the dictionary of
No settings in the character
   PV230 for each marking character beforehand.
dictionary of PV230.

Ghost image of fumes
(smoke) occurring during          • Install a dust collector to get rid of fumes (smoke).
marking is taken in the           • Check that the dust collector works well.
shooting range.


ME-LPRF-SM-11                                                          199

---

## หน้า 200

Troubles                 Causes                                             Measures


Since the work feeding and        Turn TIMING IN signal ON after work piece is fully stopped.
marking start/end timing are
 Marking disorder.   inadequate when TIMING IN
signal is used, the vibration     To feed works after marking, check that TIMING WAIT OUT is
affects marking.                  turned ON and start feeding works.


200                                                  ME-LPRF-SM-11

---

## หน้า 201

Error Indication
When an error occurs, an error code appears on the display panel of the laser marker.
Errors are categorized into alarm and warning depending on their details.
This chapter describes the details and measures of errors.

Alarm: E001 - E599
Errors that occur when highly emergent safety function is activated or there is any abnormality in laser marker are output as
alarm.
When an alarm occurs, the laser supply (laser pumping) is turned OFF, and the laser radiation is stopped if during the
lasing process.

 Release method of alarm
1. Remove a cause of alarm and confirm the safety. (Any alarms due to hardware’s problem cannot be released.)
2. For error codes E400 to E599, use any of the following means to input the alarm reset.
   • Click the confirmation button in the error dialog on the configuration software Laser Marker NAVI smart screen.
   • Turn ON ALARM RESET IN (X15) on the I/O terminal block.
   • Transmit the communication command for the alarm reset (ARS).
  For the alarms you are unable to reset such as the ones caused by hardware or system error, restart the laser marker.
3. If any alarm occurs during marking of files that use the counter, check the counter value before resuming marking.


    ERROR
                                      Description                                          Measures *1
     CODE


 E001 - E038
 E045 - E094
 E101 - E138
 E145 - E158
 E160 - E194
                   An error has occurred to the internal system of      Check the connection of the cable and various
 E202
                   the laser marker.                                    signal lines, and then restart the laser marker.
 E208 - E214
 E223 - E224
 E230
 E245 - E248
 E300 - E380


                                                                         • For LP-GS/RC/RF series, make sure the
                                                                           correct model numbers of laser head and
                                                                           controller have been connected.
 E039              • Incorrect model combination of laser marking        • For LP-RV series, make sure the correct model
 E044                system.                                               numbers of laser head, oscillator unit and
 E139              • Incorrect connection of signal cable or unit          controller have been connected. Connect the
 E144                power cable.                                          oscillator unit correctly to the laser head and
                                                                           controller.
                                                                         • Check the connection of the cable and various
                                                                           signal lines, and then restart the laser marker.


                                                                         • Check the connection of the cable and various
                                                                           signal lines, and then restart the laser marker.
 E040 - E043       • Incorrect connection of signal cable or unit          For LP-GS/RC/RF series, check the
 E140 - E143         power cable.                                          connection between laser head and controller.
 E221 - E222       • An error has occurred to the internal system of       For LP-RV series, check the connection
 E240 - E243         the laser marker.                                     between laser head and oscillator unit and
                                                                           between oscillator unit and controller.
                                                                         • Replace the cable.


                                                       ME-LPRF-SM-11                                                       201

---

## หน้า 202

ERROR
   Description                                       Measures *1
CODE


 E159 *4                                                               Check if the optional network unit is installed to
Network unit error.
 E231 - E236 *4                                                        the controller correctly.


 E200 - E201
INTERLOCK safety relay is out of order.              Contact our sales office or representatives.
 *2


• Abnormality occurs on the internal shutter.        Check the connection of the cable and various
 E205 - E207
• Signal cable is not connected properly.            signal lines, and then restart the laser marker.


 E220             Laser head housing is open.                          Contact our sales office or representatives.


Install the fiber unit properly by following the
 E225 *4          Fiber unit is detached.                              procedures described in the “Setup/Maintenance
Guide”.


   • Check and correct the power status.
   • Check if the AC power line is effected by noise.
• An error has occurred to the laser oscillator.
   • Check the connection of the cable and various
 E250 - E252      • A power supply voltage error was detected in
signal lines, and then restart the laser marker.
 E260 - E261        the laser oscillator.
• For LP-RC series:
 E264 - E265      • Incorrect connection of signal cable or unit
   Check if the ambient temperature of the
power cable.
   laser marker is not exceeding the range of its
   specification.


• Check if the ambient temperature of the
  laser marker is not exceeding the range of its
  specification.
• Make sure air-cooling fan operates.
 E262 *4          Temperature error in laser oscillator.               • Remove the dust and contamination in the
  air intake and exhaust port, and clean the air-
  cooling part such as fan and filter.
• When not recovered, contact our sales office
  or representatives.


 E263 *4          Detected unintended-irradiation.                     Contact our sales office or representatives.


 E270 - E275      • An error has occurred to the galvano scanner       • Check and correct the power status.
 E277               of the head.                                       • Check if the AC power line is effected by noise.
 E280 - E285      • Incorrect connection of signal cable or unit       • Check the connection of the cable and various
 E287               power cable.                                         signal lines, and then restart the laser marker.


 E276 *2, *3      Marking data are too detailed for the scan speed
Decrease the scan speed.
 E286 *2, *3      configured.


 E290 - E292      An error has occurred to the Z-axis adjustment       Check the connection of the cable and various
 *2               module.                                              signal lines, and then restart the laser marker.


202                                                    ME-LPRF-SM-11

---

## หน้า 203

ERROR
   Description                                       Measures *1
CODE


   • Connect INTERLOCK terminals on the I/O
   terminal block.
INTERLOCK 1 of the I/O terminal block was         • Check the status of the safety equipment
E400                                                              connected to INTERLOCK terminal.
released.
   • Confirm operation logic of connection device.
   • If you want to deactivate this alarm when the
   shutter is closed, set “Deactivate while shutter
   closed” in “System settings” > “Operation/
   information” > “INTERLOCK alarm detection”.
   • For LP-RC/LP-RF/LP-RV series:
   If the error cannot be solved even with the
INTERLOCK 2 of the I/O terminal block was           proper connection of INTERLOCK terminals,
E401
released.                                           replace the contactor for INTERLOCK by
   following the procedures described in the
   “Setup/Maintenance Guide”.


• Connect the LASER STOP IN terminals of the
  I/O terminal block.
• Check the status of the safety equipment
E402
LASER STOP IN of the I/O terminal block was         connected to the LASER STOP IN terminals.
E403
released.                                         • Confirm operation logic of connection device.
E501
• Connect the internal or external power supply
  to IN COM.1 and OUT COM.1 in the I/O
  terminal respectively.


Solve the safety problem. Then select “Reset” in
E404          The stop laser button of the Laser Marker NAVI
the error dialog in Laser Marker NAVI smart to
E502          smart was pressed.
finish the laser stop status.


• Connect REMOTE INTERLOCK IN of the I/O
  terminal block.
• Check the status of the safety equipment
  connected to REMOTE INTERLOCK IN
  terminal.
• Confirm operation logic of connection device.
E405 *3, *4
REMOTE INTERLOCK IN is open.                      • Connect the internal or external power supply
E503 *3, *4
  to IN COM.1 and OUT COM.1 in the I/O
  terminal respectively.
• If you want to deactivate this alarm when the
  shutter is closed, set “Deactivate while shutter
  closed” in “System settings” > “Operation/
  information” > “INTERLOCK alarm detection”.


   • Start marking after laser pumping has
Laser pumping was stopped during the marking        completed.
E410
process.                                          • Check the procedures and operation logic of
   laser pumping and trigger input control.
   • Check wiring of I/O or communication port to
   the external control devices.
The marking trigger signal or “Start marking”
E411                                                            • Check the switch or the sensor connected to
button was entered in the “laser pumping OFF”
E500                                                              TRIGGER IN of I/O terminal operates properly
status.
   without chattering.


ME-LPRF-SM-11                                                    203

---

## หน้า 204

ERROR
   Description                                             Measures *1
CODE


   • Check the system clock time and set it again.
• The date and time of the system clock may be          • Replace the internal battery by following the
  out of synchronization.                                 “Replacement of Internal Controller Battery” in
• The system clock battery power in the                   the “Setup/Maintenance Guide”.
  E450 - E453
  controller died.                                      • While laser marker power is on, you can use
• Abnormality has occurred on the system clock            it after setting the system clock on the system
  in the controller.                                      settings screen. When the power is off, set the
   system clock again.


• Check if the ambient temperature of the
  laser marker is not exceeding the range of its
  specification.
• Make sure air-cooling fan operates.
  E460 *2            Temperature error in laser oscillator.                   • Remove the dust and contamination in the
  air intake and exhaust port, and clean the air-
  cooling part such as fan and filter.
• When not recovered, contact our sales office
  or representatives.


• Reset the alarm for LASER STOP IN or
  E505 - E509                                                                   INTERLOCK of the I/O terminal block or Stop
Safety functions (INTERLOCK, LASER STOP,
  E550 - E560                                                                   laser button of Laser Marker NAVI smart
etc.) were activated during marking preparation.
  E572                                                                          software.
• Check if the signal lines are effected by noise.


• Overwrite the data again to the selected file
  E520 - E522                                                                   number.
  E570                                                                        • Do not turn off the laser marker while saving
File data or system data were not saved
   the settings.
successfully, because the laser marker was
turned off while saving data.
   • Restore the backup file saved before to the
Unable to read the file data.
  E530 - E542                                                                   laser marker.
  E571                                                                        • Do not turn off the laser marker while saving
the settings.


 *1 : If the error persists after restart of the laser marker, contact our sales office or representatives.
 *2 : Error that may occur for LP-GS series only.
 *3 : Error that may occur for LP-RC series only.
 *4 : Error that may occur for LP-RF series and LP-RV series only.


204                                                        ME-LPRF-SM-11

---

## หน้า 205

Warning: E600 - E799
Errors that notify of that the setting data are incorrect or laser radiation conditions are not met are output as warnings.
Marking cannot be started while any warning of E600 to E699 is active. Laser pumping maintains the state before the
warning.

 Release method of warning
1. Remove a cause of warning. If the setting is wrong, correct it.
2. In Remote mode, close the inner shutter or input the alarm reset.
     As the special case, the following errors will be released automatically.
      • E600: The warning is only output while the connection between the LASER STOP IN and OUT COM. 1 is opened
        and the warning is released when it is closed.
      • E710 - E711: The warning is output during marking and guide laser radiation (except guide pointer operation for
        LP-GS052) and it is released when these operations are finished.
      • E715: The warning is output while the cause of error occurs and it is released automatically when the cause is
        solved.
      • E750 - E782: After output of the warning for 3 seconds, the warning is released.
3. If any warning occurs during marking of files that use the counter, check the counter value before resuming marking.
4. To restart the laser marker operation, make sure that the warning output is turned on, and then open the internal
   shutter.


   ERROR
                                     Description                                              Measures *1
    CODE

                                                                          • Connect the LASER STOP IN terminals of the I/O
                                                                            terminal block.
                 LASER STOP IN of the I/O terminal block was
 E600                                                                     • Check the status of the safety equipment
                 released.
                                                                            connected to the LASER STOP IN terminals.
                                                                          • Confirm operation logic of connection device.


                 No marking data were registered to the file
 E601                                                                     Set marking data in the file and overwrite.
                 specified.


                                                                          It is not possible to input TRIGGER IN for the file
                                                                          without valid marking data.
 E603            No data for laser radiation available.
                                                                          Set “marking on” to more than one object and set its
                                                                          laser power correction other than 0%.


                                                                          To show the masked objects by the guide laser,
 E604            No data for guide laser radiation available.
                                                                          enable Guide laser display of the object settings.


                 The combination of Laser Marker NAVI smart's
                 version and the laser marker model or version is         Use the right version of Laser Marker NAVI smart
 E605
                 wrong.                                                   corresponding to the laser marker model or version
 E606
                 The function set with Laser Marker NAVI smart            in use.
                 cannot be used for this type of the laser marker.


                                                                          • Make sure the first sensor in moving direction is
                                                                            connected to ENCODER A IN and the second
                                                                            sensor is connected to ENCODER B IN of the I/O
                 Unable to detect the line speed.                           terminal.
 E607 *3, *4     Input of 2 sensors for line speed detection was          • Turn on ENCODER B IN within 10 seconds from
                 wrong.                                                     the input of ENCODER A IN.
                                                                          • Input TRIGGER IN after turning on ENCODER
                                                                            B IN within the setting time before time-out error
                                                                            occurs.


                                                          ME-LPRF-SM-11                                                        205

---

## หน้า 206

ERROR
   Description                                            Measures *1
CODE


The counter value was reset to that prior to
 E608                                                                • Check the current value of counter.
marking because the power was cut off during
 E720                                                                • Do not turn off the power during marking.
data marking including the counter.


   • Check the file and the setting values.
The laser marker is turned off during saving of
 E609                                                                • Overwrite the file data.
file data and setting. The marking data were not
 E721                                                                • Do not turn off the laser marker while aving the
saved successfully.
   settings.

• Check the image display screen and adjust the
  data position and size located outside of the
  marking field.
 E610 - E613
Marking data are out of range.                        • Adjust the X-/Y-axis offset value of the system
 E650
offset (system settings screen). (When the
data located outside of the marking field is not
displayed on the image display screen.)

• Adjust the Z-movement of the object group
 E614 - E615   Existed marking data with its Z-position outside        settings.
 *2            of marking field.                                     • Adjust the Z-movement of the file settings.
 E651 *2       (The LP-GSxxx-L type is excluded.)                    • Adjust the Z-axis offset value of the system offset
(system settings screen).

   • Confirm the correct input from the encoder to
   ENCODER A IN and ENCODER B IN of I/O
   terminal.
Unable to detect the line speed.                      • When only one phase of the encoder is used,
 E616 *3, *4   Input of the encoder for line speed detection was       connect the encoder signal to ENCODER A IN
wrong.                                                  (X13) and connect ENCODER B IN (X14) to IN
   COM. 1 (X2).
   • Confirm the encoder input is less than 100kHz per
   phase.


• Decrease the line speed.
• Set Lasing start boundary to the upward of the
  moving direction.
• Reduce the marking time with the following
 E617 *3, *4   Unable to follow the line speed.
measures.
• Increase the scan speed.
• Reduce the spacing between the characters.
• Reduce the character size, etc.


206                                                  ME-LPRF-SM-11

---

## หน้า 207

ERROR
Description                                             Measures *1
   CODE


• When Trigger mode is set to Marking at regular
  intervals, set the larger value to Marking spacing.
• When Trigger mode is set to Multiple triggers, take
  more time for the trigger input intervals.
• Decrease the line speed.
• Set Lasing start boundary to the upward of the
  moving direction.
• When Trigger mode is set to Multiple triggers,
  check the switch or the sensor connected to
E618 *3, *4   The marking spacing is too small.
  TRIGGER IN of I/O terminal operates properly
  without chattering.
• Reduce the marking time with the following
  measures.
   • Increase the scan speed.
   • Reduce the spacing between the characters.
   • Reduce the character size.
   • Set smaller value to the one-shot pulse
   duration of the I/O settings, etc.


   • Place the lasing start boundary downstream of the
On-the-fly marking is not possible with this
   trigger detecting position.
E619 *3, *4   trigger detecting position or lasing start
   • Check the setting value of Workpiece reference
boundary.
   boundary is correct.


The link control between the laser marker and
image checker has failed due to the error of the       Check the connection of the cable and various signal
E620 - E621
laser marker. Trigger processing terminated            lines, and then restart the laser marker.
abnormally.


I/O connector TIMING IN was not input within
the time specified using the link function with        • Input this to TIMING IN terminal within 60 seconds
E622
external devices. Trigger processing terminated          after the I/O connector timing waiting output
abnormally.                                              (TIMING WAIT OUT) is turned ON.
   • Check the connection of TIMING IN terminal of I/
Timing input is invalid.                                 O connector.
When the linkage function with external devices        • Check the connection with the external device.
E623          is used, TIMING IN terminal was input while the        • Check the control procedure of the external
timing standby output (TIMING WAIT OUT) was              control.
OFF.


   • Check the status of connection with the laser
   marker and the Ethernet ports of external devices.
   • Check the IP address, port number, connecting
   status of the laser marking system and image
   checker.
   • Check the status of the laser marker and external
Unable to communicate with an image checker.             devices in link control.
E624
Trigger processing terminated abnormally.              • Confirm if you set the type of the image checker
   correctly in the system settings screen and file
   settings of the marking settings screen of the laser
   marker.
   • While the laser marker and LP-ABR series are
   connected for the linkage control, do not start-up
   Configurator LP-ABR software.


ME-LPRF-SM-11                                                       207

---

## หน้า 208

ERROR
   Description                                             Measures *1
CODE

   • Check the connecting status of the laser marking
   system and image checker.
No response from the image checker. Trigger
 E625                                                                 • Check if the reading process of the image checker
processing terminated abnormally.
   was successful.
   • If you use PV230/PV200, set the total judgement.

   • Check the settings of application, type number, and
Settings mismatch between image checker                   checker number.
 E626         and laser marking system. Trigger processing            • Check the conformity of the Ethernet settings
terminated abnormally.                                    with the General communication of PV230/PV200
   protocol.

   • Verify “Object number to check” in file settings,
   and confirm if the number is the same with
   the object number you set in barcode/2D code
   settings or character settings.
The link control between the laser marker and
   • For the code checking, confirm the code type and
image checker has failed.
 E627                                                                   settings of barcode/2D code object in the marking
No settings for code or character checking
   data are consistent with the settings of the code
available.
   reader.
   • For the character checking, check if the character
   type and number of characters in the marking data
   are supported by the image checker.

   • Check the status of external devices.
   • Improve the marking quality of the code.
   • To send the marking strings or to switch the files
   by using code reader, confirm the followings:
   • Confirm no unavailable characters are in the
Code reading failed when the code reading
   code data.
 E628         function is used for the link control with external
   • When using the data extraction function,
devices.
   confirm the data length in the code data
   matches the extraction settings.
   • When you do not use the data extraction
   function, set the code data less than 299
   digits.

• Confirm the specified file number or name exactly
  corresponded to the settings in the laser marker.
• To switch the file by the number, specify the
 E629         File switching by code reader has failed.
  number always with 4-digits in the code data.
• If no settings in the specified file, set the marking
  data and save that file to the laser marker.

   • Confirm the on/off control of the TRIGGER IN on
   the I/O terminal.
TRIGGER IN turned off before the minimum
 E630                                                                 • If TRIGGER IN turns on/off properly, change the
number of scans was reached.
   setting value of Minimum number of scans of
   Trigger mode in File settings.

   • Confirm the on/off control of the TRIGGER IN on
   the I/O terminal.
Lasing stopped because the maximum number
 E631                                                                 • If TRIGGER IN turns on/off properly, change the
of scans was reached.
   setting value of Maximum number of scans of
   Trigger mode in File settings.


208                                                   ME-LPRF-SM-11

---

## หน้า 209

ERROR
Description                                             Measures *1
  CODE


Lasing operation/shutter open operation was
cancelled due to a timeout after the laser start-
up check.
   • When operating with Laser Marker NAVI smart,
Try again.
   retry to start test marking/laser radiation for
   measurement/run mode operation.
E640 *3   (Details: For the first operation of opening shutter
• When operating in remote mode, close the shutter
E641 *3   or lasing after the laser pumping on, warning
   or input the alarm reset to recover from the
E640/E641 may occur and the requested
   warning status, and then retry opening the shutter
operation is canceled in case the laser pumping
   or laser radiation for measurement.
has been off for more than several days and time
for laser start-up check (maximum 30 seconds)
is needed.)


   • Re-register font data on the data management
Font file data are incorrect. Unable to read the
E652                                                                 screen.
font file.
   • Check the font data file format.

   • Re-register graphic data on the data management
Graphic file data are incorrect. Unable to read
E653                                                                 screen.
the graphic file.
   • Check the graphic data file format.

   • Register the font file on the data management
Font file is not registered to the font No.                screen.
E654
specified.                                               • Using the character conditions, specify the font
   No. in which the font file is registered.

   • Reduce the number of characters registered in the
Insufficient font memory. Font file data capacity
E655                                                                 font file.
is too large.
   • Delete unnecessary font files.


Register the graphic file in the data management
E656      The specified graphic file was not registered.
screen.


   • Change characters, or add the font data in use.
No font corresponding to set characters were             • To use Japanese or Simplified Chinese
E657
found.                                                     characters, set “East Asian characters” in file
   settings.


• Decrease the number of characters.
E658      Too large number of characters.                          • Set the characters by separating them into several
objects.

• Original4 font cannot be displayed in bold. Select
  another font.
E659      Existed invalid character for bolding with setting.
• Use Font Maker software provided to create the
  proper pattern font.

   • Set the bold line width to half or less of the
   character height or the character width, whichever
Bold characters cannot be created due to the
   is smaller.
E660      combination of set bold line width, character
   • When marking the bold character, set the
height, and character width.
   comparison ratio between character height and
   width at 1/10 to 10.


ME-LPRF-SM-11                                                        209

---

## หน้า 210

ERROR
   Description                                             Measures *1
CODE

   • Reduce the number of characters and segments
   in the graphic data.
Insufficient marking memory. Marking data in the       • Reduce the number of characters and start/end
 E661
file are too large.                                      points of the graphic data.
   • Reduce the number of markings for Step & repeat.
   • Separate the long segment into short data.


The number of Step & repeat marking exceeds
 E662                                                                Reduce objects to be marked to 10000 or less.
the upper limit.


One or more functions that cannot be used
together are set.
The following combination of the functions are
not available in one file.
 • Characters specified by SIN command and
   registered characters via I/O
 • Characters specified by SIN command and
 E664            external offset with I/O                            Delete any one of these functions from the file.
• Registered characters via I/O and external
  offset function with “Using SEO command”
• Link control with an image checker and
  “continuous trigger” of trigger mode
• For LP-RC/LP-RF/LP-RV series:
  Link control with an image checker and
  TARGET DETECTION IN


   • Set the character that can be converted into 2D
It contains character(s) that cannot be converted
 E665                                                                  code.
to 2D code.
   • Change the mode of the code settings.


• Unable to generate 2D code in the condition
  specified.                                           Check the code settings and the number of
 E666
• The number of 2D code characters is too              characters.
  large relative to the set conditions.


The specified 2D code filling pattern is not           • Change the 2D code filling pattern.
 E667         registered for the 2D code font (font number:          • Add the font data of the pattern used in the data
2D).                                                     management screen.


The data includes a character that cannot be bar       Set characters that can be bar-coded depending on
 E668
coded.                                                 the code type.


• Unable to generate bar code in the condition
  specified.                                           Check the code settings and the number of
 E669
• The number of bar code characters is                 characters.
  incorrect relative to the set conditions.


   Specify the setting value for the narrow element or
The dimensions of the narrow element or the            the module width larger than that of the “line width
 E670
module width for the bar code are too small.           (calculation value)” specified in the object group
   settings.


The quiet zone is not configured correctly at the
 E671                                                                Set the proper value for “Quiet/Narrow Ratio”.
bar code inversion mode settings.


210                                                  ME-LPRF-SM-11

---

## หน้า 211

ERROR
Description                                              Measures *1
   CODE

   • Correct the separator height ratio or the barcode
   height ratio so that the height is larger than the “line
The settings for separator height ratio or row           width (calculation value)” specified in the object
E672
height ratio are too small.                              group settings.
   • If you want to remove the separator, set 0 to the
   separator height ratio.


Cannot create bar code due to the invalid
   Enter the prescribed number of characters according
E673          number of characters for EAN/UPC/JAN code or
   to the code type.
GS1 DataBar.


• If the functional characters such as a counter and
  date/time are input, delete and re-enter characters
  after “%”.
E674          The string containing “%” is not properly set.
• To enter “%” as a character to mark, enter “%%”.
• To enter “+” or “/” as a character to mark after the
  counter, enter “%+” or “%/”.


The string No. specified by the SIN command is         Specify the same No. set in “characters specified by
E678          not acceptable because the No. has not been set        SIN command” setting in Laser Marker NAVI smart
in Laser Marker NAVI smart.                            to the string No. in SIN command data.


   • Set the adjustment value of power optimization by
   marking position and apply it to the laser marker
Communication was interrupted. The adjustment            again.
E679 *2, *3   value of power optimization by marking position        • Do not turn off the power during the application
could not apply to the laser marker.                     processing.
   • Do not turn on the remote mode during the
   application processing.


Any of the following functions that are not
available with the RUN mode ON are configured.         • To execute marking in the RUN mode, delete
 • Registered characters via I/O                         these functions from the marking data.
E680
• External offset (via I/O and SEO command)           • When you use these functions, control the laser
• Characters specified by SIN command                   marker in the remote mode.
• Link control with external image checkers


Any of the following functions that are not
available with on-the-fly marking are configured.
 • Link control with external image checkers
 • Overwriting interval
 • Skip marking of 2D code (module marking
   • To use on-the-fly marking, delete these functions
   order)
   from the marking file.
E682 *3, *4   When the trigger mode is set to Marking at
   • Some functions are available when Trigger mode
regular intervals or Multiple triggers, those
   of the on-the-fly settings is set to Single trigger.
functions are also not available.
 • Registered characters via I/O
 • External offset (via I/O and SEO command)
 • Characters specified by SIN command
 • Counter reset at date change


ME-LPRF-SM-11                                                           211

---

## หน้า 212

ERROR
   Description                                              Measures *1
CODE


Any of the following functions that are not
available with the seamless loop setting are
   • Deactivate the seamless loop in the laser settings.
configured.
   • If you want to radiate laser continuously without
  E686           • Multiple objects
   any break, set the closed line by setting the start
• Object consisting of unclosed line(s)
   and end points in the same position.
• Point radiation object
• Step & repeat function


• Reduce the graphic size. The graphic width or
  height should be less than 999.999 mm.
• If the “Graphic presets” is off, set on for “Adjustment
 E687           Graphic object contains an invalid setting.
of size and filling” in the graphic object settings and
specify the graphic parameters in the “Marking
settings” screen.

• Overwrite the data again to the selected file
  number.
  E699          Some setting fields contain an improper value.
• If the problem persists, save the backup file and
  contact our sales office or representatives.

• Refer to “Setup/Maintenance Guide” and clean the
  fan.
  E710 - E711                                                           • Check the connection status of the fan connector.
The head air-cooling fan has stopped.
  *2, *3                                                                • Replace the fan.
• For LP-RC series, confirm the side covers of the
  head are installed properly.

• Check if the ambient temperature of the
  laser marker is not exceeding the range of its
  specification.
  E715 *3       The temperature of the laser oscillator is high.        • Make sure air-cooling fan operates.
• Remove the dust and contamination in the air
  intake and exhaust port, and clean the air-cooling
  part such as fan and filter.

   • Turn ON TRIGGER IN after confirming READY
Invalid trigger signal.
   OUT is ON.
  E750          TRIGGER IN was input during trigger
   • Do not input the marking trigger while
processing.
   PROCESSING OUT is ON.
   • Check the switch or the sensor connected to
   TRIGGER IN of I/O terminal operates properly
Invalid trigger signal.
   without chattering.
  E751          TRIGGER IN was input while READY OUT is
   • Check wiring of I/O or communication port to the
OFF.
   external control devices.

   • Check the marking results before and after the
   error.
   • Check the connection and control method of the
   work detection sensor.
TARGET DETECTION IN did not turn ON during
  E752 *3, *4                                                           • Set the work detection sensor position so that the
the lasing process.
   sensor turns ON more than 1ms during marking.
   • When you do not use this function, set “Disable” at
   X7: TARGET DETECTION IN with Laser Marker
   NAVI smart system settings.


212                                                     ME-LPRF-SM-11

---

## หน้า 213

ERROR
   Description                                             Measures *1
CODE

   • Keep SET IN turned ON until SET OK OUT turns
• I/O connector terminal No. input was not set            ON.
  successfully.                                         • To input the No. input again, close the shutter and
  E760            • Before setting completion (SET OK OUT) was              reset the previous data.
output, the set input (SET IN) was input at           • Check the connection with the external controller.
least twice.                                          • Check the control procedure of the external
   control.

   • Check the Ethernet or USB connection status.
   • For Bluetooth communication, check for any
The connection between laser marker and your
   obstacles and distance between that and the laser
PC is disconnected.
  E770                                                                      marker.
Unable to communicate with Laser Marker NAVI
   • Save files onto your PC local folder, and overwrite
smart.
   and save them when the connection gets back
   online.

   • When the marking interval is too short for
   transmission time of MST command, MST
Unable to transmit the response data of MST               command is not available. In such case, check the
  E775
command.                                                  marking completion by I/O.
   • Check the control procedure of the external
   control.

• Make sure the connected laser marker
  components have the correct serial numbers.
• For LP-GS/RC/RF series, it is recommended to
  connect the head and controller that have the
  E780            Serial number mismatch.
  same serial numbers.
• For LP-RV series, it is recommended to connect
  the head, oscillator unit, and controller that have
  the same serial numbers.

   • Make sure the connected laser marker
   components have the correct model numbers.
   • For LP-GS series, it is recommended to connect
• Model number mismatch.                                  the head and controller that have the same model
  E781            • Incorrect connection of signal cable or unit            numbers. If you combine the different models, the
power cable.                                            model number of the laser head is applied to the
   laser marking system.
   • Check the connection of the cable and various
   signal lines, and then restart the laser marker.


To use PROFINET, download the GSD file (.XML file)
corresponding to the controller version of your laser
  E782 *4        GSD file version error.                                  marking system. If the GSD file version is incorrect,
settings by your PLC cannot be imported to the laser
marking system correctly.


*1 : If the error persists after restart of the laser marker, contact our sales office or representatives.
*2 : Error that may occur for LP-GS series only.
*3 : Error that may occur for LP-RC series only.
*4 : Error that may occur for LP-RF series and LP-RV series only.


ME-LPRF-SM-11                                                           213

---

## หน้า 214

Index


ME-LPRF-SM-11

---

## หน้า 215

A                                                                                     L
AC power cable.................................................. 28                     Laser emission port......................................... 162
Air filter............................................................. 166             Laser Marker NAVI smart............................ 19, 54
Alarm................................................................ 201               Laser Marker Smart Utility........................... 19, 21
   Laser oscillator..................................................171
B                                                                                           Laser pointer emission port............................... 30
   Laser stop................................................ 103, 123
Backup............................................................. 183                 Link Control with Code Reader........................ 153
Battery............................................... 24, 180, 185                     Link Control with Image Checker..................... 136

C                                                                                     M
Cable.......................................................... 28, 183                 Marking at regular intervals........................84, 113
Circuit protector........................................... 32, 53                     Marking center position..................................... 40
Communication Command Control................. 132                                      Marking field...................................................... 40
Communication settings.......................... 130, 132                               Marking trigger................................................. 109
Connecting......................................................... 47                  Model................................................................. 18
Contactor......................................................... 176                  Multiple triggers..........................................84, 114
Continuous trigger..................................... 84, 110
Controller......................................................27, 31
Controller display panel................................31, 61
   O
Counter.....................................................119, 121                    Offline................................................................ 63
   Online........................................................... 63, 67
D                                                                                           Optional items.................................................... 20
   Outer Dimensional Drawing............................... 25
Data extraction................................................. 159                    Output circuit...................................................... 99
Disposal........................................................... 185                 Output rating...................................................... 99

E                                                                                     P
Earth.................................................................. 51              Package............................................................. 21
Ethernet......................................... 32, 55, 68, 131                       Password........................................................... 71
External control.................................................. 75                   PC configuration software..................... 54, 58, 63
External offset.................................................. 122                   Power connector.......................................... 29, 32
External power................................................. 102                     Power supply terminal....................................... 51

F                                                                                     R
Fan................................................................... 168              Registered characters...................................... 122
File....................................................................118             Related Regulations.......................................... 10
Frame ground terminal...................................... 30                          Remote control mode........................................ 58
   Remote mode.............................................. 75, 80
G                                                                                           RS-232C.................................................... 32, 128
Galvano scanner...............................................174                       RUN mode................................................... 58, 73
Guide laser.................................................. 41, 117
   S
H                                                                                           Safety measures...........................................11, 90
Head............................................................ 25, 29                 Serial Number.................................................. 184
   Shutter..................................................... 108, 175
   Signal cable....................................................... 28
I                                                                                           Signal connector.......................................... 29, 32
Input circuit......................................................... 98               Single trigger.......................................84, 109, 112
Input rating......................................................... 98                Specification...................................................... 23
Installation.............................................. 37, 38, 46                   Standards........................................................... 10
Interface specifications.................................... 128
Interlock..................................... 90, 100, 103, 125                  T
Internal power.................................................. 102
I/O connector......................................... 33, 82, 91                       Test marking................................................ 58, 73
I/O terminal block................................... 33, 82, 83                        TIMING IN........................................................ 143


K                                                                                     U
Key switch.......................................................... 31                 Unit power cable................................................ 28


ME-LPRF-SM-11                                                                                215

---

## หน้า 216

USB.............................................................. 32, 55


  W
Warning............................................................ 205


216                                                                        ME-LPRF-SM-11

---

## หน้า 217

_(หน้านี้ไม่มีข้อความ — เป็นรูปภาพ/ไดอะแกรมล้วน)_

---

## หน้า 218

Panasonic Industrial Devices SUNX Co., Ltd.
https://panasonic.net/id/pidsx/global
Please visit our website for inquiries and about our sales network.
© Panasonic Industrial Devices SUNX Co., Ltd. 2017 - 2021
August, 2021

---
