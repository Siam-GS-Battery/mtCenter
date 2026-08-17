# MD-X_EN

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\Laser_Mark\MD-X_EN.pdf` |
| **จำนวนหน้า** | 40 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---
## หน้า 1

96M13516


3-Axis Laser Marker

MD-X1000/1500 Series
                                                                         1 Introduction
User's Manual                                                                Safety information for
                                                                         2   MD-X1000/1500 Series
Read this manual before using the system in order to achieve
                                                                             Precautions on
maximum performance.
Keep this manual in a safe place for future reference.                   3   Regulations and Standards

                                                                             Preparing the
                                                                         4   Equipment
                                                                             Hardware Installation
                                                                         5
                                                                             Connection to
                                                                         6   External Equipment

                                                                         7 Maintenance
                                                                         8 Troubleshooting

                                                                         A Appendix


  Symbols
The following symbols alert you to important messages. Be sure to read
these messages carefully.

               It indicates a hazardous situation which, if not
   DANGER
               avoided, will result in death or serious injury.

               It indicates a hazardous situation which, if not
   WARNING
               avoided, could result in death or serious injury.

               It indicates a hazardous situation which, if not
   CAUTION
               avoided, could result in minor or moderate injury.

               It indicates a situation which, if not avoided, could
  NOTICE
               result in product damage as well as property damage.


   Important   It indicates cautions and limitations that must be
               followed during operation.


     Point     It indicates additional information on proper
               operation.


  Reference    It indicates tips for better understanding or useful
               information.

 It indicates the reference pages and items in this manual.

---

## หน้า 2

Table of Contents

1         Introduction ........................................... 3                                  Appendix ....................................................... 33
1-1       Precautions ........................................................................ 3      A-1    Specifications ................................................................... 33
1-2       Registered Trademarks ...................................................... 3              A-2    Dimensions ...................................................................... 34
1-3       Other ................................................................................. 3   A-3    Connection Examples for the MD-X1000/1500 Series
                                                                                                             and PLC .......................................................................... 37

2         Safety Information for MD-X1000/1500
          Series ..................................................... 4                              Warranties and Disclaimers......................... 39
2-1       General Precautions .......................................................... 4
2-2       Safety Precautions on Laser Product.................................. 4
2-3       Functions for Safety Measures ........................................... 6


3         Precautions on Regulations and Standards ...... 8
3-1       CE Marking ........................................................................ 8
3-2       CSA Certificate................................................................... 9
3-3       Best Management Practice for Perchlorate Materials -
          California only .................................................................... 9
3-4       Registration of KC Marking................................................. 9


4         Preparing the Equipment .................... 10
4-1       Preparing the Hardware ................................................... 10
4-2       Part Names ...................................................................... 12
4-3       Turning Power ON/OFF.................................................... 13
4-4       Resetting an Error ............................................................ 13


5         Hardware Installation .......................... 14
5-1       Installation Environment ................................................... 14
5-2       Installing the Marking Unit ................................................ 14
5-3       Installing the Controller Unit ............................................. 15
5-4       Connecting the Hardware ................................................. 15
5-5       Connecting a PC with "Marking Builder 3" installed........... 16


6         Connection to External Equipment .... 17
6-1       External Control System................................................... 17
6-2       Control Inputs & Outputs (I/O Terminals) .......................... 17
6-3       Control I/O Signal ............................................................. 20
6-4       Timing Chart .................................................................... 23


7         Maintenance......................................... 27
7-1       Maintenance Part ............................................................. 27
7-2       Maintenance .................................................................... 27


8         Troubleshooting .................................. 29
8-1       Troubleshooting ............................................................... 29
8-2       Error Messages................................................................ 29


      2                                                           - MD-X1000/1500 Series User's Manual -

---

## หน้า 3

1 Introduction
This User’s Manual provides general information regarding installation
in order to ensure safe and accurate performance, including I/O
connections to external devices and product maintenance.
To configure or operate the laser marker, use the touch panel console
(MC-P1) or the laser marker setting software, Marking Builder 3 (sold
separately). For more about these operations, see the PDF manual
stored in the CD-ROM.
Read this manual before using the product in order to achieve
maximum performance.
Keep this manual in a safe place after reading it so that it can be used
at any time.
                                                                                            1
  1-1      Precautions


                                                                                            Introduction
(1) No part of this manual may be reprinted or reproduced in any form
    or by any means without the prior written permission of KEYENCE
    CORPORATION.

(2) The content of this manual is subject to change without notice.

(3) KEYENCE has thoroughly checked and reviewed this manual.
    Please contact the sales office listed at the end of this manual if
    you have any questions or comments regarding this manual, or if
    you find an error.

(4) KEYENCE assumes no liability for damages resulting from the use
    of the information in this manual, item 3 above notwithstanding.

(5) KEYENCE will replace any incomplete or incorrectly collated
    manual.
    Company names and product names that are mentioned in this
    manual are registered trademarks or trademark of respective
    companies.


  1-2      Registered Trademarks
Company names and product names that are mentioned in this manual
are registered trademarks or trademark of respective companies.


  1-3      Other
We bill at actual cost for dispatching engineers for repairing at domestic
remote area or abroad within the term of warranty and limit of warranty
coverage. (* However, this is limited to situations when a KEYENCE
representative can be dispatched and maintenance is possible.)
After repair, if failure occurs again on the same part, KEYENCE will be
liable for six months.


                                               - MD-X1000/1500 Series User's Manual -   3

---

## หน้า 4

2           Safety Information for                                         MPE / NOHD

                                                          MD-X1000/1500 Series
                                                                                                                                                Standard         Wide area          Small spot
                                                                                                                                                  type             type               type
                                                                                                                                               MD-X1000/         MD-X1020,
                                                                                                                         Model                                                     MD-X1050
                                                                                                                                                 1000C            1020C
                                                2-1           General Precautions                                        MPE (mW/cm )    2

                                                                                                                         Maximum
                                                                                                                                                                       2.48
                                                                                                                         Permissible
                                                               Do not use this product for the purpose to protect a     Exposure
                                                               human body or a part of human body.                       NOHD (m)
                                                  WARNING
                                                               This product is not intended for use as                  Nominal Ocular
                                                                                                                                                   40.4                63.9           18.8
                                                               explosion-proof product. Do not use this product in       Hazard
                                                               hazardous location and/or potentially explosive           Distance
                                                               atmosphere.
                                                                                                                                             Standard type             Wide area type
                                                               At startup and during operation, be sure to monitor       Model
2                                                               the functions and performance of the                                       MD-X1500/1500C             MD-X1520,1520C
                                                                MD-X1000/1500 Series.                                     MPE (mW/cm2)
                                                  CAUTION                                                                 Maximum
                                                               We recommend that you take substantial safety             Permissible
                                                                                                                                                                3.23
                                                                measures to avoid any damage in the event a
Safety Information for MD-X1000/1500 Series


                                                                                                                          Exposure
                                                                problem occurs.
                                                                                                                          NOHD (m)
                                                               Do not open or modify the MD-X1000/1500 Series or         Nominal Ocular
                                                                                                                                                  47.8                       75.7
                                                                use it in any way other than those described in the       Hazard
                                                                specifications.                                           Distance
                                                               When the MD-X1000/1500 Series is used in                * The assumed exposure duration for the determination of MPE and
                                                NOTICE                                                                    NOHD is 10 sec.
                                                                combination with other instruments, functions and
                                                                performance may be degraded, depending on
                                                                operating conditions and the surrounding                Class 2 (guide laser/working distance pointer laser)
                                                                environment.                                            Class 2 laser is defined as, "Laser products that emit visible radiation in
                                                                                                                        the wavelength range from 400 nm to 700 nm that are safe for
                                                                                                                        momentary exposures but can be hazardous for deliberate staring into
                                                  Important   Do not expose the MD-X1000/1500 Series and                the beam."
                                                              peripheral devices to sudden temperature change, as
                                                              this may cause condensation.                               Laser specifications
                                                                                                                                               MD-X1000/1020/1050, MD-X1000C/1020C
                                                                                                                         Model
                                                                                                                                                 MD-X1500/1520, MD-X1500C/1520C
                                                                                                                         Laser                            LD (laser diode)
                                                2-2           Safety Precautions on Laser Product                        medium
                                                                                                                         Wavelength                                  655 nm
                                                                                                                         Maximum                                     1.0 mW
                                              Laser Specifications                                                       output
                                                                                                                         Pulse                                 0 to 200 kHz
                                              The MD-X1000/1500 Series incorporates a laser. Based on the laser          frequency
                                              safety requirements specified in IEC60825-1 and FDA(CDRH)21CFR             Pulse width                  Continuous or pulsed radiation
                                              Part 1040.10, this product is classified as Class 4 (marking laser) and                                    Class 2 Laser Product
                                                                                                                         Laser Class
                                              Class 2 (guide laser/working distance pointer laser) laser product.                               (IEC60825-1, FDA(CDRH) Part 1040.10*)
                                              The following is the classification and specifications of the laser.        Visibility                             Visible
                                                                                                                        * The laser classification for FDA(CDRH) is implemented based on
                                              Class 4 (marking laser)                                                     IEC60825-1 in accordance with the requirements of Laser Notice
                                              Class 4 laser is defined as "Laser products for which intrabeam viewing     No.50.
                                              and skin exposure is hazardous and for which the viewing of diffuse
                                              reflections may be hazardous. These lasers also often represent a fire                 Use of controls or adjustments or performance of
                                              hazard."                                                                               procedures other than those specified herein may result in
                                                                                                                                     hazardous radiation exposure.
                                               Laser specifications
                                                                                                                                     Follow the instructions mentioned in this manual.
                                               Model                       MD-X1000/1020/1050, MD-X1000C/1020C                       Otherwise, injury to the human body (eyes and skin) may
                                               Laser medium                               YVO4                                       result.
                                               Wavelength                                1064 nm
                                               Maximum output                            350 kW                                      1. Do not expose eyes to
                                               power                                                                                    laser radiation or diffuse
                                               Pulse frequency                         CW, 1 to 400 kHz                                 reflection.
                                               Pulse width                                6 to 80 ns                                    Exposing eyes to laser
                                                                              Class 4 Laser Product (IEC60825-1,                        radiation or diffuse
                                               Laser Class                                                                              reflection may cause
                                                                                 FDA(CDRH) Part 1040.10*2)
                                               Visibility                                  Invisible                                    blindness.

                                                                                                                                     2. Do not expose skin to
                                               Model                         MD-X1500/1520, MD-X1500C/1520C
                                                                                                                           WARNING      laser radiation or diffuse
                                               Laser medium                               YVO4
                                                                                                                                        reflection.
                                               Wavelength                               1064 nm
                                                                                                                                        Be careful that you do
                                               Maximum output                            600 kW
                                                                                                                                        not insert a hand or other
                                               power
                                                                                                                                        body part into the
                                               Pulse frequency                        CW, 1 to 400 kHz
                                                                                                                                        marking area during
                                               Pulse width                               5 to 65 ns
                                                                                                                                        operation. Doing so may
                                                                             Class 4 Laser Product (IEC60825-1,
                                                Laser Class                                                                             cause damage to skin,
                                                                                FDA(CDRH) Part 1040.10*2)
                                                                                                                                        such as burns.
                                                Visibility                                Invisible
                                               The maximum average output power means the maximum value of                          3. While the laser radiation emission warning lights, the
                                                output that can be output from a laser oscillator itself.                               area from the center of the window shown below is
                                               The laser classification for FDA(CDRH) is implemented based on                          the hazardous area to which the laser will be emitted.
                                                IEC60825-1 in accordance with the requirements of Laser Notice                          If a part of body or an object catching fire enters this
                                                No.50.                                                                                  range, eyes or skin may be damaged or fire may be
                                                                                                                                        caused. Considering the hazardous characteristic of
                                                                                                                                        this range, make sure to cover with an enclosure


                                                  4                                           - MD-X1000/1500 Series User's Manual -

---

## หน้า 5

which has appropriate reflectance and heat
             characteristic.                                                       9. Do not use the
                                                                                      MD-X1000/1500 Series
                                                                                      near flammable materials.
                                                                                      Do not place any
                                                                                      flammable objects or gas
                                                                                      (organic solvents) near                          有機


                                                                                      the beam path of the
                                                                                                                                       溶剤


                                                                                      marking laser.
               φ8 3 .2              φ8 3 .2
                                                                                      This may cause a fire.
                 90°                  90°

                                                                                   10. Turn off all power before connecting the controller
          4. Terminating the beam path.                                                power cable.
             To avoid eye or skin exposure to direct or scattered                      Otherwise, it may cause an electric shock.
             laser radiation, the laser beam emitted by the
             MD-X1000/1500 Series must be terminated at the end

                                                                                                                                                 2
             of its useful path by a diffusely reflecting material of
             appropriate reflectivity and thermal properties or by
             absorbers.                                                  WARNING


                                                                                                                                                 Safety Information for MD-X1000/1500 Series
          5. Wear protective eye                                                                         Power cable
             goggles appropriate for
             the laser beam                                                        11. Eliminate dust or fumes
             wavelength.                                                               occurring during marking
             Wear protective eye                                                       using an appropriate
             goggles of which the                                                      dust/fume collector to
             optical density for the                                                   prevent these particles     Dust
             1064 nm wavelength is 6                                                   from entering human         collector
             or more and with which                                                    body. Depending on the
             the laser emission                                                        marking target material,
             warning can be                                                            this may cause damage
             confirmed.                                                                to human body.
             Even when wearing
             protective eye goggles,
             avoid eye exposure to                                                 12. Do not use the MD-X1000/1500 Series in any way
             direct or scattered laser                                                 other than that described in this manual. Otherwise
             radiation.                                                                exposure to unintentional laser radiation may result.
          6. Do not disassemble the                                                1. Do not use the
             MD-X1000/1500 Series.                                                    MD-X1000/1500 Series
             Otherwise exposure to                                                    in environments where it
             laser radiation and                                                      may be subject to
             electric shock may                                                       vibrations or shocks. This
             result.                                                                  can cause damage to the
             The MD-X1000/1500                                                        optical parts of the
WARNING      Series is not under                                                      marking unit and can
             warranty and cannot be                                                   result in misprints or low
             repaired if it has been                                                  quality markings.
             disassembled.
          7. Enclose the area to                                                   2. When installing the
             which the laser will be                                                  MD-X1000/1500 Series,
             emitted with protective                                                  be sure to allow for the
             housing.                                                                 appropriate amount of
             The protective housing,                                                  space and ventilation.
             which has proper                                                         If the marking
             reflectance and thermal                                                  unit/controller is covered
             characteristics, shall be                                                with something, exhaust
             installed to prevent                                                     may cycle into the intake
             human access to laser                                                    vent. This can raise the
             beam reflected from the                                                  inside temperature
             target for marking or the                                  NOTICE
                                                                                      resulting in reduced laser
             surrounding objects.                                                     output and possible
             Install the                                                              damage. Do not place
             MD-X1000/1500 series                                                     anything directly above
             so that the path of the                                                  the exhaust vent. “5
             laser beam is not as the                                                 Hardware Installation”
             same height as that of                                                   (page 14)
             human eyes.                                                           3. Prevent dust or dirt from
          8. Be sure to turn off the                                                  adhering to the marking
             laser emission and wear                                                  unit window. Adhesion of
             protective eye goggles                                                   dust or dirt may cause
             before performing                                                        problems such as
             maintenance tasks such                                                   burning on the window
             as cleaning the window                                                   surface, pealing of the
             surface.                                                                 coating, and improper
             Otherwise exposure to                                                    marking. Regularly clean
             unintentional laser                                                      the window by using a
             radiation may result.                                                    blower to blow dust off or
                                                                                      by wipe it with a cloth
                                                                                      dampened with acetone
                                                                                      or ethanol.
                                                                                      “7 Maintenance” (page
                                                                                      27)


                                              - MD-X1000/1500 Series User's Manual -                                                         5

---

## หน้า 6

4. Be sure to use the MD-X1000/1500 marking unit only             MIL connector (40-pin)
                                                             with the MD-X1000/1500 controller.
                                                             Connecting the marking unit or controller of a model          10: COM IN B
                                                             other than the MD-X1000/1500 Series leads to                  12: Remote interlock input B
                                                             product damage.
                                                             Follow the steps below when connecting the
                                                             MD-X1000/1500 Series to prevent errors due to noise
                                                             Check that the controller input and output
                                                              connections are performed correctly.
                                                             Isolate the connection cables and external control
                                                              cables from other power lines. Do not bind them
                                                              together.
                                                             Use an AC power line just for the controller. Do not          Terminal block (16-pin)
                                                              use an AC power line that is used by other devices.
                                                             Be sure to establish Class D grounding for power
                                                              grounding conductors.

2                                                        5. Do not use the MD-X1000/1500 Series in an
                                                            environment with large amounts of dust or an oily
                                                            mist.                                                           A13: COM IN B
Safety Information for MD-X1000/1500 Series


                                                                                                                            A14: Remote interlock
                                                         6. The MD-X1000/1500 Series is a precision device. For                           input A
                                                            transportation, be sure to use the packing material
                                                            used during the shipment from KEYENCE.
                                                            Otherwise, transportation could cause malfunctions           "Control Inputs & Outputs (I/O Terminals)" (page 17)
                                                            or damage. Keep the packaging materials for future
                                                            use.                                                         Manual reset
                                                                                                                          If an error occurs, remove the cause of the error, turn the
                                                                                                                          key-operated power switch back to [POWER ON] once, and then
                                                                                                                          turn it to [LASER ON] again to recover operations.
                                                                                                                          Recovery can also be achieved by error reset input (terminal block),
                                                2-3     Functions for Safety Measures                                     error reset commands from external communication
                                                                                                                          (RS-232C/Ethernet), or by pressing the [Reset Error] button on
                                              The MD-X1000/1500 Series has the following Functions for safety             "Marking Builder 3" or on the console screen.
                                              measures.                                                                    Important   Do not build a system that clears errors automatically.
                                               Key-operated power switch (Key control/Beam stop)                                      Errors must be cleared through human operation.

                                                The MD-X1000/1500 Series main unit starts                 OFF


                                                up by turning the key-operated power switch.                    POWER
                                                                                                                ON
                                                Pull out the key when the MD-X1000/1500                         LASER
                                                                                                                         Laser shutter measures
                                                Series is not being used.
                                                                                                                ON


                                                                                                                          Closes the shutter located inside the marking unit, to prevent laser
                                                                                                                          beam emission.


                                               Laser radiation emission warning                                         Shutter control input terminal
                                                When the key-operated power switch is turned to [LASER ON], the           The shutter control input is controlled by two paths: A (terminal A16)
                                                unit enters a state in which the laser can oscillate, and the laser       and B (terminal 16).
                                                radiation emission warning lights up. A laser radiation emission          Opening either of the terminals closes the shutter and stops the laser
                                                warning is located at the top of the marking unit and in front of the     emissions.
                                                controller unit.                                                          Short-circuiting both of the terminals opens the shutter and makes
                                                                                                                          laser emissions possible.
                                                The laser radiation emission warning indicates the statuses as            The terminals shorted with a metal bar at the time of factory
                                                follows:                                                                  shipment.
                                                                                       Marking
                                                                                                       Controller
                                                                                          unit                             MIL connector (40-pin)
                                                          Laser not excited               Off
                                                            Laser excited               Green                              14: COM IN B
                                                                                                      Lights up in
                                                      When the laser excitation                                            16: Shutter control input B
                                                                                                      green when
                                                     completion shutter control           Off
                                                                                                           the
                                                 input/contactor control input is off
                                                                                                     key-operated
                                                      When the laser excitation
                                                                                                     power switch
                                                     completion shutter control         Green
                                                                                                        is set to
                                                 input/contactor control input is on
                                                                                                     [LASER ON].
                                                         Laser being emitted           Orange
                                                           Error/Interlock               Red

                                                                                                                           Terminal block (16-pin)
                                               Remote interlock input terminal
                                                The remote interlock input is controlled by two circuits: A (terminal
                                                A14) and B (terminal 12).
                                                Opening either of the terminals stops laser emissions and stops all
                                                marking operations on the MD-X1000/1500 Series.
                                                With both of the terminals short-circuited, turn the key-operated
                                                power switch to back to [POWER ON] once, then turn to [LASER
                                                                                                                           A15: COM IN B
                                                ON] again to enable resumption of laser emission.
                                                                                                                           A16: Shutter control
                                                The terminals are shorted with a metal bar at the time of factory                         input A
                                                shipment.

                                                                                                                         "Control Inputs & Outputs (I/O Terminals)" (page 17)


                                                 6                                           - MD-X1000/1500 Series User's Manual -

---

## หน้า 7

Labels                                                                              Setting the warning indication sign and controlled area
                                                                                       Post a warning sign at the entrance to the area in which the
  The following warning labels, explanatory labels and the aperture labels             MD-X1000/1500 Series is installed in order to ensure that workers
  are attached to and/or accompanied with the marking unit of the                      and outsiders are informed about the dangers.
  MD-X1000/1500 Series.
  These labels are available in six types: Japanese/Chinese (Simplified),             Terminating the beam path
  English/German, Chinese (Traditional)/Korean, Italian/French, Thai and               Installation must be performed so that it reduces the possibility of
  Spanish.                                                                             unintentional laser radiation on any object, including a target for
  * The illustrations show the values for MD-X1000. Described values                   marking, machine or a part of machine, under normal condition and a
     for the MD-X1500 Series will be different.                                        foreseeable fault condition.
                                                                                       To avoid eye or skin exposure to direct or scattered laser radiation
                                                                                       under these conditions, the laser beam emitted by the
   Warning/Explanatory/Aperture label                                                 MD-X1000/1500 Series must be terminated at the end of its useful
     Japanese/Chinese (Simplified)           English/German                            path by a diffusely reflecting material of appropriate reflectivity and
                                                                                       thermal properties or by absorbers.


                                                                                                                                                                 2
                                                                                      Eye protection
                                                                                       In the controlled area in which the MD-X1000/1500 Series is installed,
                                                                                       wear protective eye goggles, regardless of whether normal use or
                                                                                       maintenance, in case of accidental exposure to laser emission.


                                                                                                                                                                 Safety Information for MD-X1000/1500 Series
                                                                                      Protective clothing
     Chinese (Traditional)/Korean            Italian/French                            Laser radiation may cause skin burn or burning of clothing. Wear
                                                                                       burn-resistant and temperature-resistant clothing with minimal skin
                                                                                       exposure.

                                                                                      Appointing a laser safety officer
                                                                                       Appoint a safety officer who has knowledge and experience in
                                                                                       handling laser products in order to enforce safety management. The
                                                                                       responsibilities of the Laser Safety Officer are as follows:
                                                                                       1. Suggesting prevention measures related to laser emission
     Thai                                    Spanish                                   2. Setting up the laser controlled area (area in which there is a risk
                                                                                          of exposure to laser emission from the laser products)
                                                                                       3. Managing the key for the key-operated power switch
                                                                                       4. Checking the protective equipment and its use
                                                                                       5. Training for operators


   Attachment positions


Warning/Explanatory/                                          Warning/Explanatory/
Aperture label                                                Aperture label

     The Japanese/Chinese (Simplified) and English/German labels have
     been attached at the locations above before shipment.
       Important   Be sure to attach the Warning/Explanatory/Aperture
                   label in the language understandable to operators at
                   the same recognizable locations shown in the figure
                   above.


  Safety Measures

  The MD-X1000/1500 Series is a Class 4 laser product. Take all
  appropriate safety measures.


   Use of remote interlock input terminal
     Connect the remote interlock input terminal to an emergency master
     disconnect interlock or to room, door, or fixture interlocks.

   Key operated power switch (Key control)
     To prevent operation of the laser system by unauthorized users, the
     key should be managed by the Laser Safety Officer.

   Use of shutter control input terminal
     Control the laser shutter by the use of the shutter control input
     terminal to prevent the inadvertent exposure of bystanders to laser
     radiation from marking laser.


                                                   - MD-X1000/1500 Series User's Manual -                                                               7

---

## หน้า 8

3 Precautions on Regulations                                            Connector (MIL) connection
                                                                                                                     One ferrite core (TDK: ZCAT2035-0930) must be installed for fewer
                                              and Standards                                                          than 12 non-shielded lines that are connected to the external I/O
                                                                                                                     terminal.


                                            3-1      CE Marking
                                            CE Marking                                                                                                            Ferrite core
                                             Keyence Corporation has confirmed that this product complies with                                                 （TDK：ZCAT2035-0930）
                                             the essential requirements of the applicable EC Directive(s), based
                                             on the following specifications.
                                             Be sure to consider the following specifications when using this
                                             product in the Member State of European Union.


                                           EMC Directive (2004/108/EC)
                                                                                                                                                                Ferrite core
                                                                                                                          Controller                        （TDK：ZCAT2035-0930）
                                           Applicable Standard
3                                          EMI: EN55011, Group 1, Class A
                                           EMS: EN61000-6-2                                                        Use cables shorter than 30 m to connect the controller unit and its
                                                                                                                   external devices.
Precautions on Regulations and Standards


                                            RS-232C shielded cable connection
                                                                                                                      Important   These specifications do not give any guarantee that
                                                                                                                                  the end-product with this product incorporated
                                             One ferrite core (TDK: ZCAT2032-0930) must be installed at each                      complies with the essential requirements of EMC
                                             end of the RS-232C shielded cable (two in total).                                    Directive. The manufacturer of the end-product is
                                                                                                                                  solely responsible for the compliance on the
                                                                                                                                  endproduct itself according to EMC Directive.
                                                                                                  PC


                                                                                                                   Machinery Directive (2006/42/EC)

                                                                                                                   Applicable Standard
                                                                                                                   EN60204-1, EN60825-1 Class 4 Laser Product
                                                                                                                   EN ISO 11553-1


                                                                                                                    Installation
                                             Controller                 Ferrite core
                                                                    （TDK：ZCAT2035-0930）
                                                                                                                    You must perform an appropriate installation of the MD-X1000/1500
                                                                                                                     Series after conducting a sufficient risk assessment for the target
                                                                                                                     machine.
                                            USB cable connection
                                             Use the USB 2.0 cable OP-66844 (2 m) and install one ferrite core
                                                                                                                    The MD-X1000/1500 Series is designed as Class I Equipment.
                                                                                                                     Therefore, be sure to connect the protective conductor terminal on
                                             (TDK: ZCAT2035-0930) to the controller side.                            the power terminal block to the protective earthing conductor in
                                                                                                                     building installation.
                                                                                                                     A disconnecting device must be provided near the MD-X1000/1500
                                                                                                                     Series.
                                                                                                                     (Recommended breaking capacity: 15A)

                                                                                                                    The disconnecting device must be one of the following types:
                                                                                                                     A switch, with or without fuses, in accordance with IEC 60947-3,
                                                                                                                     utilization category AC-23B or DC-23B;

                                                                                                                    A circuit-breaker suitable for isolation in accordance with IEC
                                                                                                                     60947-2.

                                                                                                                    Use this product at the altitude of 1000 m or less.
                                                                                                                    Use this product under pollution degree 2.
                                                                                        Ferrite core
                                                                                  （TDK：ZCAT2035-0930）
                                                                                                                    Overvoltage Category II
                                            I/O terminal block connection
                                             One ferrite core (TDK: ZCAT2035-0930) must be installed for fewer      Indoor use only
                                             than 10 non-shielded lines that are connected to the external I/O
                                             terminal.
                                                                                                                    Replacing a fuse
                                                                                                                     The fuse can be replaced in the MD-X1000/1500 Series. When
                                                                                                                     replacing the fuse, use a fuse that meets the following rating and
                                                                                                                     complies with the European Product Safety Standard.
                                                                                             Ferrite core
                                                                                         （TDK：ZCAT2035-0930）
                                                                                                                      Rating : AC250V 10A Time-lug fuse
                                                                                                                      Recommended fuse : 0218010.MPX, Littelfuse,Inc.


                                              Controller
                                                                                       Ferrite core
                                                                                 （TDK：ZCAT2035-0930）


                                              8                                             - MD-X1000/1500 Series User's Manual -

---

## หน้า 9

 Laser safety precautions                                                      3-3      Best Management Practice for
  Refer to "Safety Precautions on Laser Product" (Page 4) in this
  User's Manual.
                                                                                         Perchlorate Materials - California only
  Poisonous gases may be generated depending on the materials to
                                                                              This product uses components containing perchlorate material. When
  be marked or processed. (*)
                                                                              you ship this product or your endproduct installing this product to
  Be sure to prepare a dust/fume collector or a similar device in order
                                                                              California, you must label or mark the following statement on the
  to fully eliminate dusts or fumes.
                                                                              exterior of all outer shipping packages and on consumer packages or
  Fully purify exhaust gas before emission.
                                                                              you must include the following statement in an instruction manual or
  For the regulation on exhaust gas emission, contact a public
                                                                              MSDS accompanied with the product.
  institution of your country, state, or region.

  * Materials to be marked on or processed, and the typical poisonous                 “Perchlorate Material － special handling may apply,
    gases generated                                                                   See www.dtsc.ca.gov/hazardouswaste/perchlorate.”
    Material name: Generated gas
     Cutting plastics: Aliphatic hydrocarbons, aromatic hydrocarbons,
      polyhalogenated polynuclear hydrocarbons                                 Standard/Regulation
     Ceramic processing: Oxides of aluminium
                                                                                For precautions on each standard/regulation, see page 8 and 9.
  After installation, affix the warning label shown below on the location     1. The MD-X1000/1500 Series complies with the following EU

                                                                                                                                                            3
  that can be recognized even from outside the danger zone.                      Directives and EN Standards.

                                                                                    EU Directives
                                                                                     EMC Directive


                                                                                                                                                            Precautions on Regulations and Standards
                                                                                     Machinery Directive
                                                                                     RoHS Directive
                                                                                    EN Standards
                                                                                     EN ISO 11553-1
                                                                                     EN60204-1
                                                                                     EN60825-1 Laser Class4/Class2
                                                                                     EN55011 Class A
                                                                                     EN61000-6-2
                                                                                     EN50581
  3-2      CSA Certificate                                                    2. The MD-X1000/1500 Series complies with the following CSA
                                                                                 Standards and UL standards and has been certified by CSA
This product complies with the following CSA and UL standards and                International (Class 2252 05/Class 2252 85).
has been certified by CSA.                                                           CAN/CSA C22.2 No.61010-12
 Applicable Standard: CAN/CSA C22.2 No.61010-1, UL61010-1                           UL61010-1 Third Edition
Be sure to consider the following specifications when using this product            The MD-X1000/1500 Series also complies with the following
as a product certified by CSA.                                                      regulations.
                                                                                      21CFR Part 1040.10 Laser Class4/Class2*
                                                                                        * The classification is based on IEC60825-1 following the
 Installation
                                                                                          Laser Notice No.50 from FDA (CDRH).
 The MD-X1000/1500 Series is designed as a Class I Equipment. Be                     FCC Part 15B Class A Digital Device
  sure to connect the protective conductor terminal on the power                      ICES-001 Class A ISM equipment
  terminal block to the protective earthing conductor in building
  installation.
  Also, be sure to install a switch or a circuit-breaker to disconnect from   3. The MD-X1000/1500 Series also complies with the following
  supply source near the MD-X1000/1500 Series or within the reach of             standards.
  operator. (Recommended breaking capacity: 15A)                                     JIS C 6802 Class 4/Class 2 laser product
                                                                                     GB7247.1      4 类/2 类激光产品
 Indicate on the switch and circuit-breaker to the effect that this is the
  disconnecting device for the MD-X1000/1500 series.

 Use this product at the altitude of 2000 m or less.
                                                                                3-4      Registration of KC Marking
 In North America, use the round hole power terminal block cover and
  connect the NPT (National Pipe Thread Tapered) 3/4 type of power            Class A Equipment
  connection conduit.                                                         This is a class A product. In a domestic environment this product may cause
                                                                              radio interference in which case the user may be required to take adequate
                                                                              measures.
 Use this product under pollution degree 2.
 Overvoltage Category II
                                                                              A 급 기기 (업무용 방송통신기자재)
 Indoor use only                                                             이 기기는 업무용 (A 급 ) 전자파적합기기로서 판매자 또는 사용자는
                                                                              이 점을주의하시기 바라며 , 가정외의 지역에서 사용하는 것을
                                                                              목적으로 합니다 .
 Replacing a fuse
  The fuse of the MD-X1000/1500 Series is user replaceable. When
  replacing the fuse, use a fuse that meets the following rating and
  complies with the European Product Safety Standard.

 Rating : AC250V 10A Time-lag fuse
 Recommended fuse : 0218010.P , Littelfuse,Inc.

 Laser safety precautions
  Make sure to refer to "Safety Precautions on Laser Product" (Page 4)
  in this manual.


                                                 - MD-X1000/1500 Series User's Manual -                                                           9

---

## หน้า 10

4 Preparing the                                                         USB cable (When using a computer with Marking Builder 3
                                                                                                       software installed.)
                                Equipment
                              4-1      Preparing the Hardware

                          Checking the Package Contents

                          The MD-X1000/1500 Series includes the following items. Check the                                         USB cable
                          contents before using the system in order to ensure optimum
                          performance.                                                                                                                            PC

                           Laser marker unit…1
                                                                                                        Important   The USB connector port complies with Ver. 2.0
                                       The marking unit cannot be separated from the                                specifications. Purchase a USB 2.0 compatible cable.
                              NOTICE   controller. Disconnecting the fiber cable/Q-switch
                                       cable by force may cause malfunction.
                                                                                                       Reference    The USB cable OP-66844 (2 m) is available as an
                           Key                        …2      Marking unit control cable                          option.
                                                                                         …1


4                                                                                                     LAN cable (When using a PC (Marking Builder 3) or when
                                                                                                       controlling the MD-X1000/1500 Series via an external device
                                                                                                       such as a PC or PLC)
Preparing the Equipment


                           Round hole power terminal
                            block cover            …1


                                                                                                                                         LAN cable                PC
                           User’s Manual              …1      PDF manual                …1                                                             OR
                          (Japanese/English/Chinese/German)      (Japanese/English/Chinese/German)


                           Warning/Explanatory/Aperture label set                          …1
                            Japanese/Chinese (Simplified), English/German,                                                                                              PLC
                            Chinese (Traditional)/Korean, Italian/French,
                            Thai, and Spanish                                                           Important   Either of a cross cable or a straight cable can be used
                                                                                                                    for the LAN cable.
                           Generated material warning label                                …1

                          *     We have thoroughly inspected the package contents before              Display monitor (VGA) and mouse
                                shipment. However, in the event of missing or broken items, please
                                contact your nearest KEYENCE office.                                   A display monitor (VGA, 640 x 480 pixels or more) and a USB mouse
                                                                                                       can be connected to the controller.
                                                                                                       The operations equivalent to those of MC-P1 can be performed with
                          Required Materials                                                           a display monitor and a mouse.
                                                                                                       Connect the display monitor via the monitor cable (with VGA
                          This section explains the cables and computer software that are              D-sub15-pin (protruding) terminal).
                          required when connecting the MD-X1000/1500 Series to a computer, a
                          touch panel console, or commercially available VGA display monitor
                                                                                                        Important    When connecting the mouse and the commercially
                          and mouse.                                                                                  available display monitor, be sure to check the
                                                                                                                      operation beforehand.
                                                                                                                      * Operation confirmed, recommendable mouse:
                           Power cable for power input to the controller                                               OP-87506


                                                                                   Power supply
                                                          Power cable              100 to 120 V AC
                                                                                   200 to 240 V
                                                                                                                                                                    Display monitor
                                                                                   (50/60Hz)


                                                                                                                                                               Mouse


                          Connect the rated cable to power supply sources that meet the                             Do not connect a commercially available display
                          following specifications for MD-X1000/1500 series.                                        monitor to the console terminal on the front panel of
                                                                                                       NOTICE
                           MD-X1000 Series: 100 to 120 VAC, 200 to 240 VAC, 50/60 Hz,                              the controller. Doing so may damage the display
                            Max. 650 VA                                                                             monitor and the controller.
                           MD-X1500 Series: 100 to 120 VAC, 200 to 240 VAC, 50/60 Hz,
                            Max. 800 VA


                               10                                        - MD-X1000/1500 Series User's Manual -

---

## หน้า 11

PC software
                                                                                                   Laser Marker Setting Software " Marking Builder 3"
 Touch panel console (optional)                                                                    (MB3-H2D2-DVD)
                                                                                                    2D settings can be configured on the laser marking base software.

                                                                                                  Add-on tool software
                                                                                                   3D editing tool (MB3-H3D1)
                                                                                                    Adds 3D basic settings and a Z-MAP transformation tool (Z-MAP
                                                                             POWER/
                                                                              LASER
                                                                              READY
                                                                             ERROR


                                                                                                    Creator) to "Marking Builder 3".
                                                                                                   Important     When setting the 3D function with the touch panel
                                                                                                                 console (MC-P1) and the controller (MD-X1000/1500
                                                             Console     MC-P1                                   Series) connected, connect the controller to the PC in
                                                                                                                 which the add-on tool (MB-H3D) is installed. The 3D
                                                                                                                 functions become available for the controller that is
                                                                                                                 connected once.
 Connecting the MIL connector
  The controller comes with 40-pin and 34-pin MIL connectors                                       2D coder reader add-in tool (MD-XAD1/MD-XAD1A)
  (protruding).                                                                                     Adds 2D code reader functionality to the controller by using the
  When connecting the device, use the MIL connector cable and                                       "Marking Builder 3".
  harness (commercial products) or the connector (depressed)                                       Important     Select MB3-HA1U when using the 2D code reader
  (optional) with the clamping fixture (optional).                                                               add-in tool in North America.
  Reference   The connector and clamping fixture are available as
              options.
                                                                                            System Configuration
                                                                                                                                                                                                                   4


                                                                                                                                                                                                                   Preparing the Equipment
                                                                                            The minimum system configuration is as follows:

                                                MIL connector cable                          Controller/Marking unit
                                                                                             Personal computer, the console (MC-P1), or a commercially available
                                                                                              display monitor (VGA) and a USB mouse
                                             Connector                                        * The operations equivalent to those of console can be performed.
                                             Hood cover (angled) (34-pin) (OP-42224)
                                                                                             Sensor to provide an input signal for starting the marking operation
                                                                                              (or a device that has an equivalent function)
                                                                                             When the moving speed of workpiece is not constant at On-the-fly
                                             Connector                                        Marking, the encoder is required.
                                             Hood cover (vertical) (34-pin) (OP-23139)
                                                                                                                                                                                    Progmmable
                                                                                                                                          Emergency     Indicator                   controller(PLC)
                                                                                                                                          stop switch   light       Buzzer


                                                MIL connector cable

                                                                                                                             Controller


                                             Connector
                                                                                                                                                                                Console(MC-P1)
                                             Hood cover (angled) (40-pin) (OP-51404)
                                                                                                  Marking unit


                                             Connector                                   Sensor
                                             Hood cover (vertical) (40-pin) (OP-22184)

                                                                                                                                                                                                 Display monitor


                                                                                                                                                                                         Mouse


                                                                                                                                                                         PC
                                             Connection clamp fixture (OP-21734)                                                                                         Computer that has
                                                                                                                                                                         “Maerking Builder 3” installed


Selection and installation of illumination

The built-in camera of the marking unit can be used for monitoring of
the marking surface or reading 2D codes.
Prepare an additional light source to ensure sufficient brightness for
capturing images of or viewing the target surface.

Computer Software (sold separately)

This section explains about the types of computer software available for
use with the laser marker.

 Types of software
  When configuring or operating the laser marker with a computer, the
  "Marking Builder 3" software is required.
  The software also includes optional add-on tools for each type of
  function depending on the application.
  Reference   The optional add-on tools cannot be used if the "
              Marking Builder 3" software is not installed.


                                               - MD-X1000/1500 Series User's Manual -                                                                                                       11

---

## หน้า 12

(9) Controller I/O connector (MIL)
                                                                                                               For connecting devices such as sensors, encoders, or
                                4-2   Part Names                                                               programmable logic controllers.

                          This section describes the part names and functions of the
                          MD-X1000/1500 Series.                                                            (10) RJ-45 (Ethernet) connector
                                                                                                                Can perform Ethernet communication with an external device such
                          Controller                                                                            as a PC or PLC. Also, operation is possible after connecting to a
                                                                                                                PC in which " Marking Builder 3" has been installed.

                                                                   (7)
                                                                                                           (11) Monitor connector (D-sub 15-pin (depressed))
                                                                   (8)                                          Connect a monitor equipped with the VGA terminal.
                                                                                                    (15)


                                                         (1)
                                                                                                           (12) Marking unit control connector
                                                                                                                Connect the marking unit with the marking unit control connector.
                                                                   (9)
                                                         (2)      (10)
                                                                  (11)                                     (13) RS-232C serial port (D-sub 9-pin (protruding))
                                                         (4)(5)                                                 Connect a personal computer or a programmable logic controller
                          (3)                                     (12)                                          to this port for external control.
                                                         (6)
                                                                                                    (14)


4
                                                                  (13)
                                                                                                           (14) Controller I/O terminal block
                                                                                                                For connecting devices such as sensors, encoders, or
                                                                                                                programmable logic controllers.
Preparing the Equipment


                          (1) Key operated power switch
                              Used to turn on/off the controller unit and the marking unit.
                                                                                                           (15) Contactor control terminal block (MD-X1000C/1020C and
                                                                                                                  MD-X1500C/1520C only)
                          (2) LED                                                                                 Used to control the marking laser output externally from a
                              Indicates operation status.                                                         connected safety controller, etc.
                                POWER          Illuminates green when the power is ON.
                                LASER          Laser radiation emission warning. Illuminates
                                                green when the key-operated power switch is set            Marking unit
                                                to the "LASER ON" position.
                                READY          Illuminates green when marking is possible.
                                                Flashes orange when the system is starting.                                                                                    (2)
                                                Illuminates red when an error occurs. Flashes red                                                                              ②
                                ERROR
                                                when a warning occurs.
                                USB            Illuminates orange while the controller is
                                                accessing a USB memory.


                          (3) Air filter


                          (4) USB port (A connector)                                                        (1)
                                                                                                            ①

                               The terminal is used to connect USB media, mouse or barcode
                               reader.
                               Connect a commercially available USB medium to register data                                                              (3)
                                 into the laser marker or to back up the data in the laser marker.                                                        ③
                                 * Operation confirmed, recommendable USB medium: OP-87502
                                   (1 GB)
                               Using a USB mouse and a commercially available display                     (1) Marking unit control connector
                                 monitor allows the same operation as the MC-P1.                               Connects the controller to the marking unit control cable.
                                 * Operation confirmed, recommendable mouse: OP-87506
                               When connecting to barcode reader, set the barcode reader                  (2) Laser radiation emission warning
                                 keyboard type to "DOS/V" and then connect it.
                                                                                                               Indicates the status of laser emission.
                                 Send communication commands from barcode reader, then
                                                                                                               (For details, refer to "2-3 Functions for Safety Measures" on page
                                 control the controller.
                                                                                                               6.)
                                 * Operation confirmed, recommendable barcode reader: HR-100
                                                                                                           (3) Window
                                                                                                               The laser beam is concentrated and emitted from this window.
                          (5) USB port (B connector)
                              Connect to a computer that has " Marking Builder 3" installed.


                          (6) Optional console connector
                              Connect the MC-P1 console to this connector.


                          (7) Fuse (Time-lag fuse 250V, 10A)


                          (8) Power terminal block


                                12                                        - MD-X1000/1500 Series User's Manual -

---

## หน้า 13

4-3          Turning Power ON/OFF                                          4-4          Resetting an Error
This section describes turning the power on and off, and starting up the   After removing the cause of the error, perform one of the following
system.                                                                    operations:

                                                                            Turn the key switch to either [POWER ON] or [OFF] once and then
Turning Power ON/OFF                                                         turn it back to [LASER ON] again.


Use the key-operated power switch to turn the power ON/OFF.
                                                                            Short-circuit between the error reset terminal (terminal A11) and the
                                                                             COM IN B terminal.
                                      OFF
                                                                            Error reset commands are sent from the RS-232C/Ethernet
                                                                             communication.
                                            P O WE
                                                  R
                                            ON
                                                                            Click the [Error Reset ] button on the "Marking Builder 3" screen or
                                             LASER
                                             ON
                                                                             press the [Reset Error] key on the "MC-P1" screen (or press the
                                                                             [Reset Error] key when a commercially available display monitor
                                                                             (VGA) and a USB mouse are used).

                                                                              Important   Do not build a system that clears errors automatically.
 Turning power ON: Turn the key-operated power switch to the                             Errors must be cleared through human operation.

                                                                                                                                                     4
  [POWER ON] or [LASER ON] position.
 Turning power OFF: Turn the key-operated power switch to the [OFF]
  position.


                                                                                                                                                     Preparing the Equipment
   Important   When turning the switch from the [POWER ON]
               position to the [LASER ON] position, briefly pause for
               at least one second at the [POWER ON] position
               before turning to [LASER ON]. If the switch is turned
               too quickly, the ERROR LED will light.

There are two different power-on states: POWER ON and LASER ON.
 Key-operated                                              Red
                             Connection       Laser
 power switch      Power                                  guide
                               with PC       emission
    position                                              laser
  POWER ON          ON           ON            OFF        OFF
  LASER ON          ON           ON            ON          ON


Starting Up the System

Turn the key-operated power switch to the [POWER ON] position. The
system will start in about 20 seconds.
Once the key-operated power switch is turned to the [LASER ON]
position, the LD temperature adjustment starts. After the adjustment is
complete, a buzzer sounds three times and the READY output turns on.
   Important    The LD temperature adjustment may take 10
                 minutes or longer when the system is started at a
                 low temperature.
                When the [Index] function for the Unit Setup of the
                 controller is on, the extraction of the specified
                 program number starts at the same time as the
                 system startup. Even when the LD temperature
                 adjustment is complete, the READY output does not
                 turn on until the extraction finishes.


                                               - MD-X1000/1500 Series User's Manual -                                                      13

---

## หน้า 14

5 Hardware Installation
                          5-1          Installation Environment

                        Installation Environment and Clearance Conditions

                        The MD-X1000/1500 Series should be installed under the following
                        environmental conditions:
                                                                                                                                                                         Window
                                                  MD-X1000 Series: 100 to 120 VAC,
                                           200 to 240 VAC ±10% (50/60 Hz) 650 VA max.
                             Power
                                                  MD-X1500 Series: 100 to 120 VAC,                                          When carrying the marking unit, hold it firmly with
                                          200 to 240 VAC ±10% (50/60 Hz), 800 VA max.                             CAUTION   both hands. Otherwise, a falling accident may cause
                                              Ambient                                                                       injury.
                                                                         0 to 40°C
                                            temperature
                                         Relative humidity 30 to 85% RH (No condensation)
                                         Storage ambient                                                     Provide a minimum bending radius of 70 mm for the marking unit
                                                                -10 to 60°C (No freezing)                    control cable and Q-switch cable connected at the rear of the marking
                                            temperature
                          Environment
                                                           An environment where the unit is                  unit.
                                                           not subjected to excessive dust                   Provide a minimum bending radius of 110 mm for the fiber cable.
                                             Operating
                                                           particles, oil or liquid mist, rapid
                                           environment
                                                           temperature changes or strong
                                                           vibration/shock.

                        Installation of the controller unit and the marking unit

5                       Install the controller and the marking unit with enough space clearances
                        around them.
                                                                                                                                                                              Fiber cable
Hardware Installation


                                                            300mm or more
                                                                                                                                     Marking unit control cable
                         ＊To ensure proper                                  300mm or more                                                              Q switch cable
                         ventilation, do not place
                         anything in front of or above                                                        Installation example
                         the units                                                                            ・For marking from the top                           ・For marking from the side
                                                                                                                                                           Beam stop

                                     : Intake air
                                                                                                           Protection
                                     : Exhaust air
                                                                                                               cover


                                                         Controller Unit                    Marking Unit
                                                                                                           Beam stop
                                                                                                           Limit switch                                           ・For marking from the bottom
                                         Provide at least the minimum space clearances                                                        Dust               Beam stop
                                          shown in the illustration above. Do not block any                                                    collector
                                          ventilation holes of the controller and use it in a
                                          well-ventilated environment. If not enough space is
                                          provided, the temperature inside the marking unit
                                          rises, weakening the laser power and causing
                                          malfunction.
                          NOTICE
                                         The controller must be installed on a level surface.
                                         Make sure to install the marking unit so the laser
                                          radiation emission indicator on the front side of the
                                          marking unit can be seen when using with its entire
                                          area surrounded.                                                                   The protective housing, which has proper
                                         To release heat, install the marking unit on the                                    reflectance and thermal characteristics, shall be
                                          aluminum plate with the thickness of 10 mm or more                                  installed to prevent human access to laser beam
                                          or other materials with the equivalent degree of heat                               reflected from the target for marking or the
                                          dissipation.                                                                        surrounding objects.
                                                                                                                             Do not install in such a way that the laser beam
                                                                                                                              passes at eye level when operating this product.
                                                                                                                             Installation must be performed so that it reduces the
                                                                                                                              possibility of unintentional laser radiation on any
                                                                                                                              object, including a target for marking, machine or a
                                                                                                                              part of machine, under normal condition and a
                          5-2          Installing the Marking Unit                                                            foreseeable fault condition.
                                                                                                                  WARNING
                                                                                                                              To avoid eye or skin exposure to direct or scattered
                        Installing the Marking Unit                                                                           laser radiation under these conditions, the laser
                                                                                                                              beam emitted by the MD-X1000/1500 Series must be
                        When installing the marking unit, pay attention to the following points:                              terminated at the end of its useful path by a diffusely
                                                                                                                              reflecting material of appropriate reflectivity and
                         When carrying the marking unit, hold the handles at the front and rear
                          of the unit and be careful not to touch the window located on the                                   thermal properties or by absorbers.。
                          underside.                                                                                         Provide safety interlock(s) for access panel(s) of the
                                                                                                                              protective housing to prevent human access to the
                         Do not carry the marking unit by the fiber cable.
                                                                                                                              marking laser, if applicable. (e.g. A limit switch
                                                                                                                              which is attached to the access panel with
                                                                                                                              connecting to the remote interlock input terminal)
                                                                                                                             Thoroughly remove dust or fumes produced during
                                                                                                                              marking using a dust collector, etc. to prevent these
                                                                                                                              particles from entering human body.


                            14                                                    - MD-X1000/1500 Series User's Manual -

---

## หน้า 15

 Thoroughly remove dust or fumes produced during                                      Length of mounting screws
                                marking using a dust collector or other method and                                    To determine the length of the mounting screws, factor in the
                                prevent these particles from entering inside the                                      thickness of the mounting plate and the thickness of the washer.
                                marking unit or adhering to the window surface.
                                                                                                                                                            Marking unit
                               When a glass plate is installed between the marking
                                unit and target surface to prevent the window from
                                getting dirty, the laser reflected from the glass                                                                             5 to 6 mm
               NOTICE           surface may damage the optical components inside                                                                                   Mounting plate thickness
                                the marking unit. Be sure to use the optional glass                                                                                 Washer thickness
                                shielding (OP-87890).
                               Do not use this product in locations where this                                                                         M6 screw
                                product is subjected to vibration or impact.
                               Secure enough space for installation and use this                                     NOTICE
                                                                                                                                 Install the marking unit by tightening the screws with a
                                product always in the well-ventilated environment.                                               tightening torque of 2.4 Nm.
                               Do not use this product in dusty areas or oil-mist
                                environment.
                                                                                                                      5-3        Installing the Controller Unit
            Marking Area and Working Distance
                                                                                                                    Installing the Controller Unit
            The marking area, working distance, and the variable width for the
            Z-axis vary depending on the model.
                                                                                                                    Vertical orientation is standard for the installation of the controller unit.
            MD-X1000(C)/1500(C)                    MD-X1020(C)/1520(C)                        MD-X1050              Do not install the controller unit in a horizontal position.
             (Standard area type)                    (Wide area type)                       (Small spot type)


                                                                                                                                                                                                              5


                                                                                                                                                                                                              Hardware Installation
                                                                                    100mm
  189mm
                                                                                                           +15mm
                                                                               Reference
                                                                                 surface                    -15mm
                               +21mm                                                           50mm
Reference                                300mm
  surface                      -21mm
                125mm                                                                                                                       Vertical-position installation


                                                                                                                       CAUTION
                                                                                                                                 When carrying the controller, hold it firmly with both
                                                                                                                                 hands. Otherwise, a falling accident may cause injury.
                                                                            +21mm
                                       Reference
                                         surface                            -21mm
                                                       330mm
                                                                                                                                  To secure the controller by using the M4 screws
                 Important    Although the working distance can be adjusted easily                                                 fastening the plastic feet on the controller bottom,
                              with a distance pointer or the automatic focus                                                       check the length of the screws. (Screw depth: 6 mm
                                                                                                                      NOTICE
                              function, the resulted distance is based on rough                                                    max.)
                              estimation.                                                                                          Otherwise, the internal components may be
                              To adjust the working distance precisely, determine                                                  damaged.
                              the optimum position by measuring the actual working
                              distance with an instrument or by checking the
                              marking result.
                                                                                                                      5-4        Connecting the Hardware
            Installing the Marking Unit                                                                             Connecting the Controller and the Marking Unit
            The installation of the marking unit is free from orientation constraints,
            which means that it may be installed vertically, horizontally, or in any
            desired position. To fasten the marking unit, make sure that you place it
            on a parallel mount (plate) and fix it with screws in four places or more
            on the underside plate.

                                                                                                                                                                                                Fiber cable


                                                                                                                                                        Q switch                        Marking unit
                                                                                                                                                           cable                        control cable


                                                                                                                                  Be sure to use the dedicated control cables supplied
                                                                                                                                   with the marking unit. Connecting the marking unit or
                                                                                                                                   controller with a cable of other models will result in
                                                                                                                                   product damage.
                                                                                                                                  After connecting each connection cable, make sure to
                              Install the marking unit on the aluminum plate with the                                 NOTICE       lock it and confirm it connected securely.
               NOTICE         thickness of 10 mm or more or other materials with the                                              The laser fiber cable and the Q switch cable are
                              equivalent strength.                                                                                 connected to the rear of the controller and marking
                                                                                                                                   unit. These cables cannot be disconnected.
                                                                                                                                   Attempting to disconnect these cables leads to
                                                                                                                                   product damage


                                                                         - MD-X1000/1500 Series User's Manual -                                                                               15

---

## หน้า 16

3. Set the power terminal block cover and the terminal cover
                                      Isolate the connection cables and external control              (transparent).
                                       cables from other power lines. Do not bind the
                          NOTICE
                                       connection cables together as electrical noise can                                     Terminal cover
                                       cause malfunction of the marking or controller unit.                                   (transparent)
                                                                                                                                                    Power termial
                                                                                                                                                    block cover


                        Connecting the Power Cable

                        Connect an AC power cable to the controller.                                                                                         Screw
                        Use a power cable that satisfies the ratings of the controller.
                                                                                                                                                    Screw
                                      Choose a stable power source to ensure that no
                                       electrical noise is generated by the power source.
                          NOTICE
                                      If noise is generated by the power source, block it
                                       with the use of a noise isolation transformer.
                                       Otherwise, it may cause irregularities in marking.
                                                                                                                     Tighten the screws for the power terminal block
                                                                                                                       cover with a tightening torque of 0.8 Nm.
                                      Do not connect to three-phase power supply.                                   In North America, use the round hole power terminal
                                                                                                                       block cover and connect the NPT (National Pipe
                                                                                                                       Thread Tapered) 3/4 type of power connection
                                                                                                                       conduit.
                                                                                                      NOTICE


5                                     A ground
                                                                                                                                       Angle type     Straight type


                                      wire
Hardware Installation


                                                                                 Power cable
                                                                                                      5-5          Connecting a PC with "Marking

                                     Before connecting the cable, be sure to turn the power
                                                                                                                   Builder 3" installed
                           WARNING   source off. Otherwise electric damage or product
                                                                                                    Connect a PC on which "Marking Builder 3" has been installed to the
                                     damage may result.
                                                                                                    controller with a USB 2.0 cable or a LAN cable.

                        Connecting to the power terminal block                                      USB cable connection

                        1. Remove the power terminal block cover and the terminal cover
                           (transparent).
                                                                                                               USB port

                                                                                                               USB cable
                                      Terminal cover
                                      (transparent)

                                                            Power termial
                                                            block cover


                                                                      Screw


                                                             Screw


                        2. Pass the power cable through the clamp and the power terminal            LAN cable connection
                           block cover, attach the three wires to the terminals, and then tighten
                           the screws.
                           Connect the wires of the power cable in the order of the power
                           supply (L, N) and the GND (PE) from top to bottom when the
                           controller is in a vertical position and secure them to the controller                  RJ45 connector
                           with a clamp.
                                                                                                                     LAN cable


                                             Black
                                             White

                                                                L

                                                                N

                                                            GND(PE)


                                                       Yellow/Green


                                                         Clamp


                                                                                                       Important    For LAN connection, use a UTP or STP cable that is
                                     Tighten the screws for the power terminal block and                            category 5e or above.
                          NOTICE
                                     clamp with a tightening torque of 0.8 Nm.


                           16                                                 - MD-X1000/1500 Series User's Manual -

---

## หน้า 17

6            Connection to External                                                                               6-2     Control Inputs & Outputs (I/O
               Equipment                                                                                                    Terminals)

                                                                                                                  Control Input/Output Terminal Block
  6-1          External Control System
                                                                                                                   Terminal Block (16-pin)
Connecting the Hardware
           Front                                                                                                                                                               A1
                                                                                                                                                                               A2
                                                                                                                                                                               A3
                                                                                                                                                                               A4
                                                                                                                                                                               A5
                                                                                                                                                                               A6
                                                                                   MC-P1 remote control console                                                                A7
                                                                                                                                                                               A8
                                                                         Mouse
                                                                                                                                                                               A9
                                                                                                                                                                               A10
                                                                                                                                                                               A11
                                                                                                                                                                               A12
                                                                                                                                                                               A13

                                           USB port for "MARKING BUILDER 3" only                                                                                               A14
                                                                                                                                                                               A15
                                          RS-232C interface
           Rear                                                                                                                                                                A16
                                                                                                                                                        Terminal block
                                       RJ-45 (Ethernet) connector                                                                                       (16-pin)


                                                                                                                  Terminal arrangement of terminal block (16-pin)
                                                                                                                   A1   +24V                    A9      Trigger input
                                                                                                                   A2   GND for +24 V           A10     Encoder input
                                                                                                                   A3   Error output            A11     Error reset input
                                               Display monitor
                                                                                                                   A4
                                                                                                                   A5
                                                                                                                        Warning output
                                                                                                                        Trigger READY
                                                                                                                                                A12
                                                                                                                                                A13
                                                                                                                                                        COM IN B
                                                                                                                                                        COM IN B                           6
                                                                                                                        output
                                                                                                                   A6   Marking output          A14     Remote interlock input A


                                                                                                                                                                                           Connection to External Equipment
                   Terminal block, connector (MIL)                                                                 A7   Marking complete        A15     COM IN B
                   RJ-45 (Ethernet) connector                                                                           output
                   RS-232C interface                                                                               A8   COM OUT                 A16     Shutter control input A

                                                                                                                  * Be sure to use the GND (pin A2) for +24 V for the GND for 24 V
 Interfaces                                                                                                        power (pin A1).
  1.   USB 2.0 port (A, B)                                                                                        * All COM IN B terminals are internally connected.
  2.   Console connector (15-pin D-sub)
  3.   VGA monitor connector (15-pin D-sub)
  4.   RS-232C serial port (9-pin D-sub)                                                                          Contactor control terminal block
   The connector on the controller is a D-sub 9-pin (male) type.
                                                                                                                  (For MD-X1000C/1020C and MD- X1500C/1520C)
   Connect the controller to an external device using an RS-232C straight
   cable. The wiring for the controller side and the external device side is                                       Terminal arrangement of terminal block (12-pin)
   shown below.

                                          Cable connection diagram
                              9-pin to 9-pin, fully hard wired with a straight cable
                                                                                                                                                              Terminal block
                        9-pin female                               9-pin female                                                                               (12-pin)
                                                                                                                                                                                R1
                                   1                                1
                            Send 2                                                                                                                                              R2
                                                                    2 Receive
                                                                                                                                                                                R3
                         Receive 3                                  3 Send       External                                                                                       R4
                   MD-X Signal GND 4                                4
                                                                                 device                                                                                         R5
                                   5                                5 Signal GND
                   side            6                                6            (such as a                                                                                     R6

                                   7                                7            PC)side                                                                                        R7

                                   8                                                                                                                                            R8
                                                                    8
                                   9                                9                                                                                                           R9

                              Connector hood                        Connector hood                                                                                             R10
                                                                                                                                                                               R11
                                                     Shield
                                                                                                                                                                               R12


   Important   ・Use shielded cables for the communication cables.
                                                                                                                  Terminal arrangement of terminal block (12-pin)
               ・Use M2.6 screws to fix the connector to the
                     controller.                                                                                   R1   24V FOR                       R7      SAFETY_IN_B
                                                                                                                        MAINTENANCE
                                                                                                                   R2   24V FOR                       R8      SAFETY_COM_B
  5. RJ-45 (Ethernet) connector                                                                                         MAINTENANCE
                                                                                                                   R3   SAFETY_IN_A                   R9      DEVICE_MON_B
 Control input-output (I/O terminals)                                                                             R4   SAFETY_COM_A                  R10     DEVICE_MON_COM_B
                                                                                                                   R5   DEVICE_MON_A                  R11     COM_R
  1. Connector input-output (MIL 40-pin/MIL 34-pin)                                                                R6   DEVICE_MON_COM_A              R12     COM_R
  2. Terminal block input-output
  3. Contactor control terminal block*1
                                                                                                                  * COM_R (R11, R12) terminals are independent of COM OUT and
                                                                                                                    COM IN B terminals of the controller I/O terminal block (16 pin) and
  *1: Equipped with the MD-X1000C/1500C Series only
                                                                                                                    MIL terminal block.
                                                                                                                  * Before shipment, R1-R3, R2-R7, R4-R11 and R8-R12 are
                                                                                                                    short-circuited.
                                                                                                                    When connecting to an external control device, remove the short
                                                                                                                    harness.


                                                                               - MD-X1000/1500 Series User's Manual -                                                                17

---

## หน้า 18

Control Input/Output MIL Connector                                      MIL connector (34-pin)

                                    MIL connector (40-pin)

                                                                                                                                                                          41      42
                                                                                                                                                                          43      44
                                                                                           1       2                                                                      45      46
                                                                                           3       4                                                                      47      48
                                                                                           5       6                                                                      49      50
                                                                                           7       8                                                                      51      52
                                                                                           9       10                                                                     53      54
                                                                                          11       12                                                                     55      56
                                                                                          13       14                                                                     57      58
                                                                                          15       16                                                                     59      60
                                                                                          17       18                                                                     61      62
                                                                                          19       20                                                                     63      64
                                                                                          21       22                                                                     65      66
                                                                                          23       24                                                                     67      68
                                                                                          25       26                                                                     69      70
                                                                                          27       28                                                                     71      72
                                                                                          29       30                                                                     73      74
                                                                                          31       32
                                                                                          33       34
                                                                                          35       36
                                                                                          37       38                                       MIL connector
                                                                                          39       40
                                                                                                                                            (34-pin)
                                                                     MIL connector
                                                                     (40-pin)


                                   Terminal arrangement of MIL connector (40-pin)                         Terminal arrangement of MIL connector (34-pin)
                                    Terminals as seen on the left    Terminals as seen on the              Terminals as seen on the left          Terminals as seen on the right
                                    side                             right side                            side                                   side
                                    1    Reserved (input)            2       +24V                          41    COM IN B                         42   Ready For Switch Set.
                                    3    Reserved (input)            4       COM IN A                                                                  Output
                                    5    COM IN B                    6       GND for +24 V                 43    Z-axis position fixation         44   Reserved (Output)
                                                                                                                 input
                                    7    Not used                    8       COM IN B
                                                                                                           45    Z-axis position control          46   Reserved (Output)
                                    9    Trigger lock input          10      COM IN B
                                                                                                                 COM
                                    11   Marking confirmation        12      Remote interlock input
                                                                                                           47    Z-axis position control          48   COM OUT
                                         input                               B
                                                                                                                 input
                                    13 Error emission detection      14      COM IN B
                                                                                                           49    I/O specified character          50   Date attached
6
                                         input
                                                                                                                 confirmation input                    output/counter
                                    15 Guide laser marking           16      Shutter control input B
                                                                                                                                                       termination output 4
                                         input
                                                                                                           51    Program number                   52   Counter termination
                                    17 Guide laser marking           18      COM IN B
                                                                                                                 confirmation input                    output 3
Connection to External Equipment


                                         output                                                                                         10
                                                                                                           53    No./Value set input 2            54   Counter termination
                                    19 Mark./2D Code Check           20      Laser excitation input
                                                                                                                                                       output 2
                                         OK Output
                                                                                                           55    No./Value set input 29           56   Counter termination
                                    21 Mark./2D Code Check           22      Not used
                                                                                                                                                       output 1
                                         NG Output
                                                                                                           57    No./Value set input 28           58   Laser indicator output
                                    23 COM OUT                       24      Not used                                                   7
                                                                                                           59    No./Value set input 2            60   Fixed output
                                    25 Shutter status output         26      Reserved (input)
                                                                                                           61    No./Value set input 26           62   Reserved (input)
                                    27 Not used                      28      Not used
                                                                                                           63    No./Value set input 25           64   Output logic inversion
                                    29 Reserved (input)              30      Machinery operation
                                                                                                                                                       input
                                                                             mode disable input                                         4
                                                                                                           65    No./Value set input 2            66   Current Control Input
                                    31 Reserved (input)              32      Laser control input
                                                                                                           67    No./Value set input 23           68   Date hold input
                                    33 Not used                      34      COM IN B
                                                                                                           69    No./Value set input 22           70   Count-down input
                                    35 Not used                      36      Not used
                                                                                                           71    No./Value set input 21           72   Count-up input
                                    37 Not used                      38      Not used                                                   0
                                                                                                           73    No./Value set input 2            74   Counter reset input
                                    39 Not used                      40      Not used
                                                                                                          * All COM IN B terminals are internally connected.
                                   * Terminals 7, 22, 24, 29, 31, 33, 35, 37, 39, and 40 are not used.
                                     They are not connected internally.
                                   * All COM IN B terminals are internally connected.

                                                                                                          Control Input/Output Specifications

                                                                                                           Internal circuit diagram
                                                                                                            Input: Terminals 2 and 4, and 6 and 8 are shorted, and are
                                                                                                            compatible with no-voltage input when shipped.
                                                                                                             Applied voltage: 24 to 30 V

                                                                                                                           4.2kΩ
                                                                                                                  Input
                                                                                                                                                               Internal circuit


                                                                                                                            510Ω

                                                                                                            COM IN A                       Photocoupler


                                      18                                             - MD-X1000/1500 Series User's Manual -

---

## หน้า 19

Output: NPN/PNP open collector
   Maximum applied voltage: 30 V                                                                Contactor control terminal block specifications
   Maximum sink current: 50 mA                                                                  (For MD-X1000C/1020C and MD-X1500C/1520C)
                                                                                       Output
                                                                                                  Internal circuit diagram

                     Internal circuit
                                          Photocoupler
                                                                                                                                   Contactor
                                                                                       COM OUT
                                                                                                      Device monitor


                                                                                                                                                        Internal circuit
                                                                                                         Safety input
                                          Photocoupler

                                                                                                        Safety COM

                                                                                                 Device monitor COM
                 The NPN and PNP connection cannot be used
                  together. Use either of NPN or PNP for all
  NOTICE          connection.
                 Do not short-circuit COM IN A and COM OUT. This
                  may cause a product breakdown.                                                 Safety input (Coil)
                                                                                                 Applied voltage: 24 VDC (16.8 V to 31.2 V)
                                                                                                 Average power consumption: 1.8 W * At power-on and during retention
 Sensor connection example                                                                      * Applied voltage for Safety COM
NPN output sensor connection example
                                                                                                 Device monitor (Relay output)
                                                                                                 Response time (ON): 100 msec
                    GND                                   A2: Power supply GND                   Response time (OFF): 100 msec
                                                                                                 * Chattering will occur due to relay contact.
                  Power                                   A1: +24 V for power supply
                  Output                                  A9: Trigger input                          Default state
                                                          8: COM IN B
           Short-circuited
                                                          6: GND for +24 V
                                                          4: COM IN A
                                                                                                            Short-circuited
                                                                                                                              R1

                                                                                                                              R2
                                                                                                                                   Maintenance power source (24 V)

                                                                                                                                   Maintenance power source (24 V)
                                                                                                                                                                                6
           Short-circuited
                                                          2: +24V                                                             R3   Safety input_A


                                                                                                                                                                                Connection to External Equipment
                                                                                                                              R4   Safety COM_A
                                                                                                    Short-circuited
                                                                                                                              R5   Device monitor_A
  *     While using NPN input, short circuit between pins 2-4 and pins
                                                                                                                              R6   Device monitor COM_A
        6-8.
                                                                                                                              R7   Safety input_B
PNP output sensor connection example                                                                        Short-circuited
                                                                                                                              R8   Safety COM_B

                                                                                                                              R9   Device monitor B
                 GND                                      A2: Power supply GND                      Short-circuited           R10 Device monitor COM_B
               Power                                      A1: +24 V for power supply                                          R11 COM_R
              Output                                      A9: Trigger input                                                   R12 COM_R

                                                          8: COM IN B
                                                          6: GND for +24 V                              If voltage application of safety input is interrupted, power supply
 Short-circuited                        Short-circuited                                                     to the laser oscillator is interrupted and laser emission stops.
                                                          4: COM IN A
                                                                                                        The device monitor status can be checked on the terminal block
                                                          2: +24V                                           monitor of MARKING BUILDER2.

                                                                                                                  Do not use "24V FOR MAINTENANCE" and "COM-R"
                                                                                                                   terminals except for maintenance of this product.
  *     While using PNP input, short circuit between pins 2-8 and
                                                                                                                   (Disconnect the short harnesses before wiring.)
        between pins 4-6.
                                                                                                                   Unintentional laser radiation may occur due to loss
                                                                                                     WARNING       of control of the contactor.
      Point     Examples of connection to a PLC (programmable                                                     Do not use "24V FOR MAINTENANCE" and "COM-R"
                controller) are presented in the appendix.                                                         terminals for external devices. This may cause loss
                                                                                                                   of the safety function of the machine to which this
                                                                                                                   product is installed.


                                                                                                                 Do not reversely connect to the safety input terminal.
                                                                                                   NOTICE
                                                                                                                 Product failure may occur.


                                                                         - MD-X1000/1500 Series User's Manual -                                                            19

---

## หน้า 20

6-3      Control I/O Signal
                                   Input pulses of 10 ms or longer for the shutter control input A (B) and remote interlock input A (B); and pulses of 1 ms or longer for other input signals
                                   (except for the encoder input).
                                   An external device connected to an input must use its open collector (transistor type) output. Use of a mechanical relay can result in contact chatter
                                   and may cause a malfunction.

                                   Input signal

                                    Terminal block (16-pin) input signal
                                    Terminal No.      Terminal name                     Function
                                    A9                Trigger input                     Starts marking.
                                                                                        Inputs a marking start signal from a sensor or similar device. This input is accepted when the
                                                                                        trigger READY output is on.
                                    A10               Encoder input                     An encoder should be connected to this terminal when it is used for moving marking.
                                                                                        The encoder should be able to generate 30 pulses/10 mm or greater, and should be used at a
                                                                                        maximum response frequency of 100 kHz.
                                                                                        Use incremental encoder.
                                    A11               Error reset input                 Clears an error condition.
                                                                                        When an error occurs, remove the cause of the error, and then input this signal to clear the error.
                                                                                        Besides using this method, you can also recover from an error condition by turning the
                                                                                        keyoperated power switch back to the [POWER ON] position once and then returning it to the
                                                                                        [LASER ON] position, by using the laser marker setting software "Marking Builder 3," or by
                                                                                        using the [Reset Error] key on the console (sold separately). You can also clear the error using
                                                                                        external communication (RS-232C/Ethernet).
                                                                                        This terminal is specified in IEC60825-1 as a manual reset.
                                    A14               Remote interlock input A          Stops the laser emission in an emergency.
                                                                                        When this terminal is open, all the laser marking operations are halted immediately. The power
                                                                                        supply to the laser is turned off and the internal shutter is closed. This input is shorted with a
                                                                                        short harness when shipped.
6                                                                                       To resume operation, clear the error.
                                                                                        This terminal is a remote interlock connector specified in the IEC60825-1.
                                    A16               Shutter control input A           Temporarily stops the laser emission by closing the internal shutter. The shutter is open when
                                                                                        this terminal is open. This input is shorted with a short harness when shipped.
Connection to External Equipment


                                                                                        Opening this terminal will stop the emission of the marking laser and the guide laser, but will
                                                                                        maintain the laser excitation state. If this terminal is opened while marking is in progress, the
                                                                                        marking is stopped immediately. The ready state is resumed as soon as the terminal is shorted.
                                                                                        * Use machinery operation mode disable input (pin 30) when opening and closing the shutter at
                                                                                           a high frequency.


                                    MIL connector (40-pin) input signal
                                    Terminal No.      Terminal name                     Function
                                    9                 Trigger lock input                Disables trigger input signals.
                                                                                        In the operating mode, the trigger input is disabled while input to this terminal is on. If input to this
                                                                                        terminal is turned on during marking, the controller enters the trigger lock state after completing
                                                                                        the marking session.
                                    11                Marking confirmation input        Detects if the marking is actually taking place properly.
                                                                                        Switches the [Marking Confirmation input] parameter between valid and invalid for "Unit Setup"
                                                                                        in "Marking Builder 3" and "SETUP" on the touch panel. An external sensor, like an infrared
                                                                                        sensor or thermal sensor, can be used to confirm the emission of the marking laser. The output
                                                                                        of that sensor is sent to this input. If no input is received from the time the marking starts to when
                                                                                        the marking is complete, an error condition occurs indicating the laser was not emitted during
                                                                                        marking.
                                    12                Remote interlock input B          Stops the laser emission in an emergency.
                                                                                        The same function as "A14 Remote interlock input A"
                                                                                        (This input is shorted with a short harness when shipped.)
                                                                                        This terminal is a remote interlock connector specified in the IEC60825-1.
                                    13                Error emission detection          An external sensor, like an infrared sensor, can be used to confirm the emission of the marking
                                                      input                             laser. The output of that sensor is sent to this input. If an input is received to this terminal when
                                                                                        the marking unit is not marking, an error will occur indicating that the marking laser was detected
                                                                                        when it should not have been.
                                    15                Guide laser trigger input         Illuminates the guide laser or distance pointer selected with numeric input.
                                    16                Shutter control input B           Stops the laser emission tentatively. (The internal shutter is closed.)
                                                                                        The same function as "A16 Shutter control input A"
                                                                                        This input is shorted with a short harness when shipped.
                                    20                Laser excitation input            Starts laser excitation. When this input is given with key-operated power switch in [LASER ON]
                                                                                        position, the laser goes to exited state.
                                                                                        This input is shorted with a short harness when shipped.
                                    30                Machinery operation mode          Temporarily stops the laser emission, but the internal shutter remains open.
                                                      disable input                     This input is used to stop the laser emission at any position midway through processing a
                                                                                        workpiece.
                                    32                Laser control input               Stops the marking laser and guide laser.
                                                                                        The internal shutter closes while the laser control input is on.


                                      20                                           - MD-X1000/1500 Series User's Manual -

---

## หน้า 21

 MIL connector (34-pin) input signal
 Terminal No.    Terminal name                    Function
 42              Ready For Switch Set.            Only turned on when Switch Set, counter UP/DOWN/RESET is available.
                 Output                           A5 when it is a setting other than 1 print set in on-the-fly marking settings: synchronize with
                                                  Trigger Ready and output it.
 43              Z-axis position fixation input   Use when Z movement condition is [Strobe input].
 45              Z-axis position control COM      Special COM terminal for pin 47.
 47              Z-axis analog position control   Moves to the position corresponding to the Z-axis coordinate (±21 mm*1) set by analog voltage.
                 input                            Connect a device equipped with separate analog voltage output.
                                                  *1 Varies according to setting value of installation position correction.
                                                  Maximum applied voltage: ±10 V
 49              I/0 specified character          Confirms the selected I/O specified character.
                 confirmation input               When this terminal is short-circuited, the I/O specified character selected with terminals 63, 65,
                                                  67, 69, 71, and 73 is confirmed.
                                                  This input is accepted when the trigger READY output is on.
 51              Program number                   Confirms the selected program number.
                 confirmation input               When this terminal is short-circuited, setting number selected with terminals 53, 55, 57, 59, 61,
                                                  63, 65, 67, 69, 71, and 73 is fixed and changed.
 53,             No./Value set input              Selects (1) program number, (2) counter number, (3) I/O specified character, or (4) guide laser
 55,                                              value.
 57,                                              (1) Program number selection
 59,                                                  Select a program number (from 2000 programs at maximum) stored in the controller. The
 61,                                                  program will be switched to this number when the program number confirmation input on
 63,                                                  terminal 51 turns on.
 65,                                              (2) Counter number selection
 67,                                                  Select a counter number for which you reset the current counter value or
 69,                                                  increment/decrement the value. Such counter operations are executed upon the input to
 71,                                                  terminal 70 (count-down input), 72 (count-up input), or 74 (counter reset input). An individual
 73                                                   counter number is specified from 0 to 9, while a common counter number (A-J) is specified
                                                      from 10 to 19.
                                                  (3) I/O specified character selection
                                                      Select an I/O specified character (36 settings at maximum). The character will be switched
                                                      when the confirmation input on terminal 49 turns on. The number to be selected is
                                                      represented in binary code, with 1 representing ON (short-circuit) and 0 representing OFF
                                                                                                                                                        6
                                                      (open).


                                                                                                                                                        Connection to External Equipment
                                                  (4) Guide laser type selection
                                                      Select from 0: Distance pointer, 1: Guide laser (single-time), 2: Guide laser (continuous), 3:
                                                      Guide laser (area frame), 4: Guide laser (workpiece image), or 5: Guide laser (block frame).

                                                  Example: Switching the program number to 350
                                                  When 350 (decimal) is represented with base 2, the number is 101011110 and so give input as
                                                  follows.

                                                  Terminal number…Setting number…Input status         Terminal number…Setting number…Input status
                                                          53………………..0…………..OFF                             65…………….….1……………ON
                                                          55………………..0…………..OFF                             67…………….….1……………ON
                                                          57………………..1…………..ON                              69…………….….1……………ON
                                                          59………………..0…………..OF                              71…………….….1……………ON
                                                          61………………..1…………..ON                              73…………….….0……………OFF
                                                          63………………..0…………..OFF
 64              Output logic inversion input     The logic of the error/warning output is inversed while input to this terminal is on.
 68              Date hold input                  When this input is activated, the previous date information will be retained when the internal
                                                  clock passes 00:00:00 (12:00 AM). The previous date information is retained by subtracting one
                                                  day off the internal clock.
 70              Count-down input                 Decrements the selected counter.
                                                  When this terminal is shorted, the current value of the counter, whose counter number is
                                                  specified by terminals 65, 67, 69, 71, and 73, is decremented by one. At this time, the current
                                                  number of mark repetitions is reset to zero. An individual counter number is specified from 0 to 9,
                                                  while a common counter number (A-J) is specified from 10 to 19.
 72              Count-up input                   Increments the selected counter.
                                                  When this terminal is shorted, the current value of the counter, whose counter number is
                                                  specified by terminals 65, 67, 69, 71, and 73, is incremented by one. At this time, the current
                                                  number of mark repetitions is reset to zero. An individual counter number is specified from 0 to 9,
                                                  while a common counter number (A-J) is specified from 10 to 19.
 74              Counter reset input              Resets the selected counter. Short-circuiting this terminal resets the current values of the
                                                  counter numbers selected with Nos. 65, 67, 69, 71, and 73. At this time, the current marking
                                                  count is reset to zero.
                                                  Select individual counter numbers with Nos. 0 to 9, and common counter numbers (A to J) with
                                                  Nos. 10 to 19.


                                            - MD-X1000/1500 Series User's Manual -                                                            21

---

## หน้า 22

Output signal

                                    Terminal block (16-pin) output signal
                                    Terminal No.    Terminal name                   Function
                                    A1              24 VDC power output             Maximum current output is 0.3 A.
                                                                                    * Pin A2 is the dedicated GND for the power 24 V (pin A1) output.
                                    A3              Error output                    A signal is output when an error occurs.
                                                                                    A signal is output when an abnormal condition occurs or when the remote interlock input terminal
                                                                                    is opened. At this time, the internal shutter closes and the [ERROR] LED on the controller unit
                                                                                    lights in red.
                                                                                    Normal operation can be recovered by taking the following steps:
                                                                                     For an error condition: After removing the cause of the error, clear the error status by using the
                                                                                       appropriate terminal or on-screen button.
                                                                                     For remote interlock: After shorting the terminal, turn the key-operated power switch back to
                                                                                       [POWER ON] and then switch to [LASER ON] again.
                                    A4              Warning output                  A signal is output when a warning occurs. This output can be inversed with the input to terminal
                                                                                    64.
                                    A5              Trigger READY output            A signal is output when the marking unit is ready for marking.
                                    A6              Marking output                  A signal is output while the marking operation is in progress.
                                                                                    This output remains on from the trigger input to the end of marking.
                                    A7              Marking complete output         A pulse is output the instant the marking operation is successfully completed.
                                                                                    The maximum pulse width is 1000 ms*. The instant the next trigger is input during the output
                                                                                    pulse, the pulse turns OFF.
                                                                                    * The pulse width can be set within the range between 1 and 1000 ms with Marking Builder 3.


                                    MIL connector (40-pin) output signal
                                    Terminal No.    Terminal name                   Function
                                    19              Mark./2D Code Check OK          When Marking Confirmation/2D Code Reader function is being used, or when Marking
                                                    Output                          Confirmation/Reading succeeds, it remains on for a certain period of time.

6                                   21              Mark./2D Code Check NG
                                                    Output
                                                                                    When Marking Confirmation/2D Code Reader function is being used, or when Marking
                                                                                    Confirmation/Reading fails, it remains on for a certain period of time.
                                    25              Shutter status output           Outputs whether the internal shutter is open or closed. Goes ON when shutter is open.
Connection to External Equipment


                                    MIL connector (34-pin) output signal
                                    Terminal No.    Terminal name                   Function
                                    50              Date attached output and        Output can be assigned after selecting from counter termination output and date-attached
                                                    counter termination output      output.
                                                                                    When date-hold input is turned on, date-attached output gives output about 1 second after
                                                                                    internal clock of controller passes 00:00:00 and retains the output until date-hold input is turned
                                                                                    off.
                                    52,             Counter completion output       Gives output at the point of time when counter (individual/common counter) finishes marking the
                                    54,                                             last value.
                                    56,                                             Output is arbitrarily assigned from individual/common counter (0 to 9, A to J) in four kinds of
                                                                                    terminals (No.50, 52, 54, 56).
                                    58              Laser indicator output          Gives output when the laser is excited.
                                    60              Fixed output                    Gives output at the point in time when switching is completed to the number specified with the
                                                                                    program number confirmation input (No. 51), count-up input (No. 72), count-down input (No. 70),
                                                                                    counter reset input (No. 74), or I/O specified character confirmation input (No. 49).
                                                                                    Also, it is output when the ON/OFF of Current Control Input (No.66) has been incorporated.


                                   Contactor control Input/Output (For MD-X1000C/1020C and MD-X1500C/X1520C)

                                    Terminal block (12-pin) I/O signal
                                    Terminal No.    Terminal name                   Function
                                    R1,R2           Maintenance power source        Power source dedicated for contactor control
                                                    (24 V)                          Power source to forcibly activate the built-in contactor.
                                                                                    * Do not use as a power source for an external device.
                                    R3              Safety input A                  Stops the laser emission tentatively.
                                                                                    If voltage application of this terminal is interrupted, power supply to the laser oscillator is
                                                                                    interrupted and laser emission stops.
                                                                                    When the terminal is short-circuited again, marking possible status is restored.
                                                                                    (Before shipment, it is short-circuited with the maintenance power source (R1 terminal).
                                    R4              Safety COM A                    Negative (-) side of Safety input A
                                                                                    (Before shipment, it is short-circuited with COM_R (R11 terminal).)
                                    R5              Device monitor A                Outputs during voltage application of Safety input A terminal (Normally closed).
                                    R6              Device monitor COM A            The other side of Device monitor A (Normally closed)
                                    R7              Safety input B                  Stops the laser emission tentatively.
                                                                                    If voltage application of this terminal is interrupted, power supply to the laser oscillator is
                                                                                    interrupted and laser emission stops.
                                                                                    When the terminal is short-circuited again, marking possible status is restored.
                                                                                    (Before shipment, it is short-circuited with the maintenance power source (R2 terminal).)
                                    R8              Safety COM B                    Negative (-) side of Safety input B
                                                                                    (Before shipment, it is short-circuited with COM_R (R12 terminal).)
                                    R9              Device monitor B                Outputs during voltage application of Safety input B terminal (Normally closed).
                                    R10             Device monitor COM B            The other side of Device monitor B (Normally closed).
                                    R11,R12         COM_R                           GND for the maintenance power source.
                                                                                    * This GND is insulated from FG or other GNDs of the device.


                                      22                                         - MD-X1000/1500 Series User's Manual -

---

## หน้า 23

6-4               Timing Chart                                                                                                                                              1 print is set in on-the-fly marking settings (when interval is long)
                                                                                                                                                                                                                    0 ms or more
                                                                                                                                                                             No.A9             ON
Start-up Activity                                                                                                                                                            Trigger Input     OFF


                                                                                                                                                                             No.A5             ON
                                              (1)                                                                                                                            Trigger Ready     OFF
 Key-operated                                                                                                                                                                Output
 power switch             ON                                                                                                                                                                                                            Within 1 ms                    Within 1 ms
                          OFF
                                Approx. 20                                                                                                                                   No.42
                                seconds                      (2)                                                                                                             Ready For Switch ON
                                                                                                                                                                             Set Output       OFF
 No. 20
 Laser excitation         ON                                                                                                                                                                                                              Trigger Delay
 input                    OFF
                                                                                                                                                                             No.A6             ON
                                                                                                                                                                             Marking output    OFF
 No. 58                   ON                  Within                                                                                                                Within
 Laser indicator          OFF                 50 ms                                                                                                                 50 ms                                                                                                                  Available from 1 to 1000 ms
 output                                                                                                                                                                                                                                                                Within 1 ms
                                                                                               (3)                                                                           No.A7            ON
                                                                                                                                                                             Marking complete OFF
 No. A16                  ON                                                                                                                                                 output
 Shutter control          OFF
 input A
                                                                                                                                       (4)
 No. 16
 Shutter control
                          ON
                          OFF
                                                                                                                                                                              1 print is set in on-the-fly marking settings (when interval is
 input B
                                                                                                                                                                                short)
 No. 25                                                                                                                                                             Within
 Shutter status           ON                                                           Within                         Within 100 ms                                 100 ms
 output                   OFF                                                          100 ms                                                                                                                  0 ms or more
                                                             The required time                                                                                               No.A9             ON
                                                             varies depending (2)                                                              (4)                           Trigger Input     OFF
 No. 5                                                       on the environment                                                                                     Within
 Trigger Ready            ON                                                    Within                                 Within 300 ms                                50 ms                                                                      Within 1 ms                   Within 1 ms
 output                   OFF                                                   1 ms
                                                                                                                                                              (5)            No.A5             ON
                                                                                                                                                                             Trigger Ready     OFF
 No. A14                  ON                                                                                                                                                 Output
 Remote interlock         OFF                                                                                                                                                                                                        Within 1 ms                                                                 Within 1 ms
 input A                                                                                                                                                                     No.42
                                                                                                                                                                             Ready For Switch ON
 No.12                    ON                                                                                                                                                 Set Output       OFF
 Remote interlock         OFF                                                                                                                                                                                                           Trigger Ready
 input B
                                                                                                                                                              (5)
                                                                                                                                                                             No.A6             ON
 No. A3                                                                                                                                              Within                  Marking output    OFF
 Error output             ON                                                                                                                         50 ms
                          OFF
                                                                                                                                                                                                                                                                                                                 Available from 1 to 1000 ms
                                                                                                                                                                             No.A7            ON
(1) System starts up after about 20 seconds after key-operated power                                                                                                         Marking complete OFF
                                                                                                                                                                             output
    switch of controller is turned to [LASER ON].
    (When the index function is turned off and a USB memory is not
    connected)
                                                                                                                                                                              The trigger input can be received up to five times from the time when
                                                                                                                                                                               a trigger input has been received until the marking is completed. If
(2) After the system is started and the laser excitation input is active,                                                                                                      more than five trigger inputs are stocked, turn off the Trigger Ready
    the laser excitation output is turned on within 50 ms. The Trigger
    Ready output will be turned on after the LD temperature adjustment
                                                                                                                                                                               Output.
                                                                                                                                                                              Ready For Switch Set will not be turned on until the marking completes.
                                                                                                                                                                                                                                                                                                                                               6
    is completed (the required adjustment time varies depending on the
    environment) and marking can be started.                                                                                                                                  Continuous marking (with the number of mark repetitions


                                                                                                                                                                                                                                                                                                                                               Connection to External Equipment
(3) When both shutter Control inputs A and B are on (short-circuited),                                                                                                          specified)
    marking is possible.
                                                                                                                                                                                                      Within 1 ms
(4) When Shutter control inputs A and B revert back (short-circuited),                                                                                                        No. A5
                                                                                                                                                                              READY output
                                                                                                                                                                                               ON
                                                                                                                                                                                               OFF
    Trigger Ready output turns on within 300 ms.
(5) When both remote interlock inputs A and B are ON (short-circuited),                                                                                                       No. A9           ON
    it enters startup status. If one of them is turned off (open), all                                                                                                        Trigger input    OFF
                                                                                                                                                                                                                                                                                                 (1)
                                                                                                                                                                                                                                                      (2) Marking interval
    operations are terminated and error output turns on.                                                                                                                                                                                                                                                     Marking interval
                                                                                                                                                                                                                           (1) Trigger delay
    The operation can be resumed when the error is cleared.                                                                                                                   No. A6
                                                                                                                                                                              Marking output
                                                                                                                                                                                               ON
                                                                                                                                                                                               OFF
    * The cancellation cannot be operated from the remote interlock                                                                                                                                                                                       (3) Within 1 ms
    input A/B falling edge until 2 seconds elapse.                                                                                                                            No. A7          ON
                                                                                                                                                                              Marking         OFF
                                                                                                                                                                              complete output


                                                                                                                                                                             (1) Marking output turns on after the trigger delay has completed and
Behavior of Trigger Ready, Ready For Switch Set, Marking,                                                                                                                        turns off after the marking is completed.
and Marking Complete Outputs in Response to Trigger Input                                                                                                                        The timing of the second and subsequent markings is determined
                                                                                                                                                                                 by the marking interval setting.
                                                                                                                                                                             (2) Marking interval for stationary marking (Time: s)
 Single-time marking (Stationary marking)
                                                                                                                                                                             (3) If the marking complete output is active and the marking output
No. A5              ON
                                Within 1 ms            (1)
                                                                                                                                                                                 comes on for the next repetitive mark, the marking complete output
READY output        OFF
                                                                                                                                                                                 will be turned off within 1ms.
                            Within 1 ms                              (5)
                                                                                                     0 ms or more
                                                                                                                                                                                 * The trigger delay varies depending on the settings.
No. A9              ON
Trigger input       OFF
                                                                                                                                                                              Continuous marking (marking during the trigger is on: only
                                                  Trigger delay
                                                                           (2)                                      Trigger delay            Within 1 ms                        valid for on-the-fly marking)
No. A6              ON
Marking output      OFF                                                                                                                                                                              Within 1 ms
                                                                                                                                                                              No.A5                                                                                                                    (3)
                                                                                               (3)                                                                                             ON
                                                                                                                                                                              Trigger Ready
                                                                                 Within 1 ms                                                                  (4)             Output           OFF
No. A7           ON
Marking complete OFF
output                                                                                                                                                                                                                                                                                     (2)
                                                                   Can be set between 1 and
                                                                                   1000 ms.                                                                                   No.A9            ON
                                                                                                                                                                              Trigger Input    OFF
                                                                                                                                                                                                                                                              Interval                                           0 ms or more
(1) The READY output turns off within 1 ms after the rising edge
                                                                                                                                                                                                                         (1) Trigger Delay
    (turning ON) of the Trigger input.                                                                                                                                        No.A6
                                                                                                                                                                              Marking output
                                                                                                                                                                                               ON
                                                                                                                                                                                               OFF

(2) Marking output turns on after trigger delay is completed and turns                                                                                                        No.A7
                                                                                                                                                                                                                                                   Within 1 ms

    off after marking is completed.                                                                                                                                           Marking
                                                                                                                                                                              complete
                                                                                                                                                                                               ON
                                                                                                                                                                                               OFF
                                                                                                                                                                              output
(3) Within 1 ms after the falling edge (turning OFF) of the marking
    output, the Marking complete output will be activated for 1000 ms                                                                                                        (1) Marking output turns on after the Trigger Delay has completed and
    maximum.                                                                                                                                                                     turns off after the marking is completed.
                                                                                                                                                                                 The timing of the second and subsequent markings is determined
(4) If the Trigger input turns on while the Marking complete output is on,
                                                                                                                                                                                 by the marking interval setting.
    the Marking complete output will be turned off within 1 ms.
                                                                                                                                                                             (2) During Trigger Delay or marking, even when the Start Marking Input
                                                                                                                                                                                 is OFF, the marking continues till the end.
                                                                                                                                                                             (3) After the Start Marking Input turns off, the timing of turning on Ready
                                                                                                                                                                                 Output becomes the timing of turning off marking output.


                                                                                                                        - MD-X1000/1500 Series User's Manual -                                                                                                                                                            23

---

## หน้า 24

Marking Confirmation Input                                                                                                                   Error Emission Detection Input

                                   Detects whether the marking has occurred. Validates or invalidates the                                                                                                            : Detection area (An error occurs when the error emission detection input is on outside of this area.)

                                   [Marking Confirmation input] in the Unit setup for "Marking Builder 3". If                                                                   No. A9               ON
                                   setting is [Valid], an external sensor, like an infrared sensor or thermal                                                                   Trigger input
                                                                                                                                                                                 トリガー入
                                                                                                                                                                                                     OFF
                                                                                                                                                                                                   1 ms or more
                                   sensor, detects the laser emission and the output of that sensor is sent                                                                      力

                                   to this input.                                                                                                                               No. A6              ON
                                                                                                                                                                                Marking output      OFF
                                   If this input does not turn on between a trigger input and the next trigger                                                                                                                                       (1) Within 1 s

                                   input or within the specified period from a trigger, the marking loss
                                                                                                                                                                                No. A7           ON
                                   detection error occurs.                                                                                                                      Marking complete OFF
                                                                                                                                                                                output
                                                                      : Detection area (In this area, error occurs if Marking confirmation input does not turn on)
                                                                                                                                                                                                                             (1)
                                                                                                                                                                                No. 13              ON
                                    No. A9            ON                                                                                                                        Error emission      OFF
                                    Trigger input     OFF                                                                                                                       detection input
                                                                                                               (1) When extension time
                                                                                                                   is set to 0 ms:                                                                                                                                    (2)
                                                                                                                   Within 5 ms                                                  No. A4              ON
                                    No. A6            ON                                                                                                                        Error output        OFF
                                    Marking output    OFF


                                                                                                                                                                                (1) Within the detection range from 1 ms or more after the trigger input
                                    No. A7          ON
                                    Marking
                                    complete output
                                                    OFF                                                                                                                             is turned on to 1 sec or less after the marking complete output turns
                                                                                             (1)                                                                                    on, no error output occurs even if the error emission detection input
                                    No. 11
                                    Marking
                                                      ON
                                                      OFF
                                                                                                                                                                                    turns on.
                                    confirmation
                                    input                                                                                                                                       (2) Outside the (1) range, when the error emission detection input is
                                    No. A3            ON
                                                                                                                                                                                    turned on, or when the error emission detection input is turned on
                                                                                                                                                              (2) Within 1 ms
                                    Error output      OFF
                                                                                                                                                                                    although it exceeded the (1) range, the error output will be
                                                       1 ms or more
                                                                                                     (3) Can be any length when extension time is set                               performed.

                                   (1) When the extension time setting of the marking confirmation input is                                                                     Counter UP/DOWN/RESET Input and Counter Termination
                                       0 ms, no error output occurs as long as the marking confirmation
                                       input turns on within the range from 1 ms or more after a trigger
                                                                                                                                                                                Output
                                       input is turned on to 5 ms or less before the marking output turns off.                                                                  No.53 to 73           ON
                                                                                                                                                                                (odd numbers)
                                   (2) The error output turns on if the marking confirmation input does not                                                                     Value specified input
                                                                                                                                                                                                      OFF


6                                      turn on within the range stated in (1).
                                   (3) If the extension time setting of the marking confirmation input is set
                                                                                                                                                                                No.70 to 74
                                                                                                                                                                                (even number)
                                                                                                                                                                                Counter input
                                                                                                                                                                                (UP/DOWN/RESET)
                                                                                                                                                                                                ON
                                                                                                                                                                                                OFF
                                                                                                                                                                                                                     1 ms or more
                                                                                                                                                                                                                                       (1)


                                       other than to 0 ms, the detection area can be extended up to 255 s.                                                                      No. A5               ON                  Within 1 ms
                                                                                                                                                                                                                                               (1)
Connection to External Equipment


                                                                                                                                                                                READY output         OFF                                        Within
                                                                                                                                                                                                                                                100 ms
                                                                                                                                                                                No. 60               ON
                                                                                                                                                                                Fixed output         OFF


                                   Z-axis Analog Position Control                                                                                                               No. A9
                                                                                                                                                                                Trigger input
                                                                                                                                                                                                     ON
                                                                                                                                                                                                     OFF

                                                                                                                                                                                                                                                                            (2) (Counter last value marking)
                                    No. 47                                                                                                                                      No. A6               ON
                                    Z-axis analog      ON                                                                                                                       Marking output       OFF
                                    position           OFF
                                    control input
                                                                                                                                                                                No. A7               ON
                                                                                            (1)                                                                                 Marking complete                                                                                     Within 1 ms
                                    No. 43                                                                                                                                                           OFF                                                                                                 100 ms
                                                       ON                                                                                                                       output
                                    Z-axis position                                                                                                                                                                                                                                Within 5 ms
                                                       OFF                                                                                                                                                                                                                                              (2)
                                    fixation input                                                                                                                              No.50 to 56
                                                                                                                                                                                (even number)      ON
                                                                                                                                                                                Counter completion OFF                                                                                                 100 ms
                                                                                                                                                                                output
                                    No. 60             ON             Within 1 ms
                                    Fixed output       OFF                                         Within 100 ms


                                   (1) When an external displacement sensor has been set, the Z                                                                                 (1) After counter number is set, counter UP/DOWN/RESET input is
                                       coordinate is determined according to the analog value at the time                                                                           turned on for more than 1 ms. If counter input is fixed, fixed output
                                       of the Z-axis position fixation input.                                                                                                       gives an output of max.100 ms pulse within 1 ms.
                                       In this case, the trigger READY output does not turn off.                                                                                (2) Within 5 ms before the marking complete output of the counter last
                                                                                                                                                                                    value, or within 1 ms after the marking complete output turns on,
                                   Date Hold and Date-attached Output                                                                                                               counter completed output gives a output of max.100 ms pulse.
                                                                                                                                                                                    * Set in advance the target counter number in I/O of unit setup.
                                                                                         Date change (0:00)
                                                                             (1)                                                                  (4)
                                   No. 68
                                   Date hold input
                                                      ON
                                                      OFF                                                                                                                       I/O Specified Character Confirmation Input
                                                                                                                   (2)                                  (3)
                                   No. 50                                                                                                                                       No.53 to 73
                                                      ON                            Within 1 s                                     Within 1 s                                   (odd numbers)
                                   Date-attached      OFF                                                                                                                                          ON
                                   output                                                                                                                                       Value specified    OFF
                                                                                                                                                                                input
                                                                                                                                                                                                                                       (1)
                                                                                                                                                                                No. 49
                                   (1) Date hold input is set to ON before date change (0:00). If the date is                                                                   I/O specified
                                                                                                                                                                                character
                                                                                                                                                                                                   ON
                                                                                                                                                                                                   OFF
                                                                                                                                                                                                                  1 ms or more

                                       changed at this time, marking of the previous day is continued.                                                                          confirmation input
                                                                                                                                                                                                                                         (1)

                                   (2) Within 1 s after the date is changed, date-attached output turns on                                                                      No. 60
                                                                                                                                                                                Fixed output
                                                                                                                                                                                                   ON
                                                                                                                                                                                                   OFF
                                                                                                                                                                                                                     Within 1 ms
                                                                                                                                                                                                                                               Within
                                       and the output remains the same.                                                                                                         No. A5
                                                                                                                                                                                                                                               100 ms

                                                                                                                                                                                                   ON
                                                                                                                                                                                Trigger READY
                                   (3) Within 1 s after date-hold input is turned off, date-attached output                                                                     output
                                                                                                                                                                                                   OFF

                                       turns off.                                                                                                                               (1) Set the I/O specified character number, wait for 1 ms or more and
                                                                                                                                                                                    then turn on the I/O specified character confirmation input.
                                                                                                                                                                                    Within 1 ms after the I/O specified character confirmation input is
                                                                                                                                                                                    fixed, the fixed output turns on to output pulses for 100 ms at
                                                                                                                                                                                    maximum.
                                                                                                                                                                                      * The I/0 specified character input should be turned on while the
                                                                                                                                                                                        trigger READY output is on.


                                        24                                                                                               - MD-X1000/1500 Series User's Manual -

---

## หน้า 25

Behavior of Trigger Lock Input                                                                                                    Behavior of Shutter Control Input/Machinery Operation
                                                                                                                                  Mode Disable Input
 Single-time marking
                                                                                                                                  No. A5                  ON
                               : Trigger inhibit status
                                                                                                                                  Trigger READY           OFF
No. A5                                                                                                                            output                    Within 1 ms
                  ON                                                                                                                                                                                    (2)
Trigger READY
                  OFF
output                                                                                                                            No. A9                  ON
                                                       (1) Within 1 ms                                                            Trigger input           OFF
                                                                                (2) Within 1 ms
                                                                                                                                                                                                                      (3) Within 300 ms
No. A9            ON                                                                                                              No. A16/16              ON
Trigger input     OFF                                                                                                             Shutter control         OFF
                                                                                                                                  input A/B                                 (1) Within 10 ms                                 (4) Within 1 ms
                                                                                                                                  No. 30             ON
No. 9                                                                                                                             Machinery          OFF
                   ON
Trigger lock input OFF                                                                                                            operation
                                                                                                                                  mode disable input                         (1) Within 1 ms     (1)
                                                                                                                                                                          トリガディレイ
                                                                                                           Trigger                No. A6                  ON               Trigger delay
                                        Trigger delay                                                       delay                 Marking output          OFF
No. A6            ON
Marking output    OFF
                                                                                                                                  (1) Marking is discontinued within 10 ms after the Shutter control input
(1) When the trigger lock input is turned on, the trigger READY output                                                                turns off (Open). Marking is discontinued within 1 ms after the
    turns off within 1 ms and subsequent trigger inputs will be ignored.                                                              Machinery operation mode disable input turns on.
(2) When the trigger lock input is turned off, the trigger READY output                                                           (2) While the shutter control input or the machinery operation mode
    turns on within 1 ms and then the trigger lock state is cleared.                                                                  disable input is on, the trigger READY output stays off so that no
                                                                                                                                      trigger input is accepted.
(3) When the trigger lock input is turned on during marking, the marking
    does not stop. The trigger lock state starts after the marking is                                                             (3) When the Shutter control is reset, the READY output turns on within
    completed.                                                                                                                        300 ms and marking becomes possible.
    * The trigger delay varies depending on the settings.                                                                         (4) When the Machinery Operation Mode Disable input is reset, the
                                                                                                                                      READY output turns on within 1 ms and marking becomes possible.
 Continuous marking (with the number of mark repetitions
                                                                                                                                  Behavior of the Shutter control/Machinery operation mode disable input
    specified)
                                                                                                                                   Continuous marking is also discontinued in the same manner.
                            : Trigger inhibit status                                                                               The shutter is closed when Shutter control input is turned off and
No. A5            ON                                                                                                                open when the machinery operation mode disable input is turned on.
READY output      OFF
                                                                                                                                   The trigger delay varies depending on the settings.
                                                                                                       Within 1 ms
                                                                                                                                   When [Unit Setup] - [Inverse machinery operation mode disable
No. A9
Trigger input
                  ON
                  OFF
                                                                                                                                    input] is set to ON on the controller, ON/OFF of the machinery
                                                                                                                                    operation mode disable input can be inversed.
                                                                                                                                                                                                                                                    6
                                                        (1)
No. 9


                                                                                                                                                                                                                                                    Connection to External Equipment
                   ON
Trigger lock input
                   OFF                                                                                                            Behavior of Laser Control Input
                                      Trigger
No. A6                                 delay
                  ON                                                                                                              No. A5
Marking output                                                                                                                                 ON
                  OFF                                                                                                             Trigger      OFF
                                                                                                                                  READY output

(1) When the trigger inhibit input is turned on after the trigger input is                                                        No. A9
                                                                                                                                                                     Within 1 ms


    turned on, the trigger lock state does not start until the marking of                                                         Trigger
                                                                                                                                  output
                                                                                                                                                    ON
                                                                                                                                                    OFF
    the specified number of mark repetitions is completed. The trigger                                                                                                                                   Within 300 ms (2)
    lock state starts immediately after the marking finishes.                                                                     No. 32
    * The trigger delay varies depending on the settings.                                                                         Laser control
                                                                                                                                  input
                                                                                                                                                    ON
                                                                                                                                                    OFF
                                                                                                                                                                                      Within 1 ms (1)

                                                                                                                                  No. A6
                                                                                                                                                    ON
                                                                                                                                  Marking           OFF
Behavior of Number/Value Set Input and Program Number
                                                                                                                                  output


Confirmation Input                                                                                                                (1) After the marking laser stop input is turned on, the marking laser
                                                                                                                                      and the guide laser are stopped within 1 ms, and the Marking output
                                                                                                                                      turns off.
No.53 to 73
(odd numbers)
Value specified
                   ON
                   OFF
                                                                                                  Unset or out of range numbers   (2) After the marking laser control input is turned off, the trigger READY
input              (1) 1 ms or more                                                                                                   output turns on within 300 ms.
No. 51
                   ON
                                                                                                                                  Behavior of the laser control input
Fix program No.
input
                   OFF
                                                                                                                                   Continuous marking is also discontinued in the same manner.
                                                                                                                                   The shutter is closed when the marking laser is stopped.
                                                                                                                                  * The trigger delay varies depending on the settings.
No. A5
                           Within 1 ms
                                                       Setting switch time
                                                                              Within 1 ms
                                                                                                                                  * When [Unit Setup] - [Inverse laser control input] is set to ON on the
                   ON
Trigger READY
output             OFF                                                                                                              controller, ON/OFF of the laser control input can be inversed
                                Changes according to setting contents
                                * Can be below 10 ms                          (2)
No. 60             ON
Fixed output
                   OFF
                                                              Within 100 ms                          (3)
                                                                                                      Within 1 ms
No. A3             ON
Error output       OFF


(1) Select a program number, wait 1 ms or more and then turn on the
    confirmation input.
(2) When the program number is confirmed, the trigger READY output
    and fixed output turn on simultaneously.
(3) If any Unset or out-of-range number has been selected, fix program
    No. input causes an error and the Error output turns on within 1 ms.
    At the same time, the READY output turns off.
    Simultaneously, the Ready output turns off.


                                                                                       - MD-X1000/1500 Series User's Manual -                                                                                                                  25

---

## หน้า 26

Guide Laser I/O Behavior                                                                       Behavior of Output Logic Inversion Input

                                                                                                                                  No. 64
                                    Distance pointer illumination                                                                Output logic     ON
                                                                                                                                  inversion        OFF
                                                          Selected number: 0 (no selection)                                       input
                                   No. 53 to 73                                                                                                                                                       Error issued
                                                    ON
                                   Number
                                                    OFF                                                                                                      Within 1 ms
                                   selection
                                                                                                                                  No. A3           ON                                                                                                                                Within 1 ms
                                                                1 ms or more                                                      Error output     OFF
                                   No. A5                                                                                                                                                                                       Warning issued
                                                 ON               Within 1 ms
                                   Trigger READY OFF                                                              Within 300 ms
                                   output                                                                                         No. A4           ON        Within 1 ms
                                                                                                                                  Warning          OFF                                                                                                                               Within 1 ms
                                                                                                                                  output
                                   No. 25
                                   Shutter status   ON            Within 100 ms                  Within 100 ms
                                   output           OFF


                                                                                               Within 1 ms
                                   No. 15
                                   Guide laser      ON
                                                                                                                                  Behavior of 2D Code Reader OK/NG Outputs
                                   marking input    OFF

                                                                   Within 100 ms                                                  No. A5                                                                                        (3)
                                   No. 17                                                                                         Trigger              ON                             Within 1 ms              Within 200 ms
                                   Guide laser      ON                                                                            READY                OFF
                                   marking output   OFF                                                                           output


                                    When the number for the distance pointer is selected, the distance                           No. A9
                                                                                                                                  Trigger              ON
                                                                                                                                                       OFF
                                      pointer lights up while the guide laser marking input is turned on.                         input


                                                                                                                                  No. A6                                      Trigger delay                                                         Trigger delay
                                                                                                                                                       ON
                                                                                                                                  Marking
                                    Guide laser emission (single-time)                                                           output
                                                                                                                                                       OFF


                                                          Selected number: 1                                                                                                     Within 1 ms
                                   No. 53 to 73                                                                                   No. A7
                                                    ON                                                                            Marking              ON
                                   Number                                                                                                              OFF
                                   selection        OFF                                                                           complete
                                                                                                                                  output
                                                                 1 ms or more
                                                                                                                                                                                                           (1)                          Image hold time
                                                                                                                                                 ON                                                        Capture delay + 2D
                                   No. A5        ON                                                                               No. 19/21
                                                                  Within 1 ms                                     Within 300 ms                                                                            code reading time
                                   Trigger READY OFF                                                                              2D code reader OFF
                                   output                                                                                         OK/NG output                                                                                  (2) Within 100 ms


                                   No. 25           ON            Within 100 ms                  Within 100 ms                    (1) The 2D code reading time varies depending on the coordinates and
                                   Shutter status
                                   output
                                                    OFF                                                                               marking quality of the 2D code to be read.
                                                                                                                                      The period from the marking completion to the reading start can be
6                                  No. 15
                                   Guide laser
                                                    ON
                                                    OFF
                                                                                                                                      extended with the capture delay setting.
                                   marking input                                                                                  (2) When 2D code reading finishes, the 2D code reader OK output or
                                                           Trigger delay                                                              NG output turns on to output pulses for 100 ms at maximum.
Connection to External Equipment


                                   No. 17         ON
                                   Guide laser
                                   marking output
                                                  OFF                                                                             (3) When 2D code reading finishes, the Trigger Ready Output turns on
                                                                                                                                      within 200 ms. If the image hold time has been set, the trigger input
                                    Invalid when setting on-the-fly marking.                                                         is effective even during the image hold time.

                                    Guide laser emission (single-time) (fixed point setting while                                *       The trigger delay varies depending on the settings.
                                       trigger is on)                                                                             *       The capture delay and image hold time settings can be changed
                                                          Selected number: 1
                                                                                                                                          from [Program Setup] - [2D code reader].
                                    No. 53 to 73
                                    Number          ON
                                                    OFF
                                                                                                                                  *       When the continuous marking is set, 2D code reading starts after
                                    selection
                                                                                                                                          the final marking.
                                                               1 ms or more
                                    No. A5
                                    Trigger         ON
                                                                                                                                  Contactor control
                                    READY                        Within 1 ms                                      Within 300 ms
                                                    OFF
                                    output

                                                                                                                                  (For MD-X1000C/1020C,MD-X1500C/1520C)
                                    No. 25        ON            Within 100 ms                    Within 100 ms
                                    Shutter
                                                  OFF
                                    status output
                                                                                                                                      R3, R7                 ON
                                                                                              Within 1 ms                             Safety input A         OFF
                                                                                                                                      Safety input B
                                    No. 15
                                    Guide laser   ON
                                                                                                                                      R5, R9                                                         (1)                                         (4)
                                    marking input OFF                                                                                 Device monitor A     ON
                                                                                                                                      Device monitor B     OFF             Within 100 ms                                                               Within 100 ms
                                    No. 17                                                                                            (ON = Release,
                                    Guide laser           Trigger delay                                                               OFF = Short circuit)
                                                    ON                                                                                                                                                       (2)                                         (5)
                                    marking                                                                                           No. 58                 ON
                                    output          OFF
                                                                                                                                      Laser excitation       OFF                      Within 50 ms                                                             Within 50 ms
                                                                                                                                      status output

                                    When the fixed point setting while trigger is on is set, the guide laser                         No. A5                 ON
                                                                                                                                                                                                             (2)                                                                     (6)
                                      is emitted while the guide laser marking input is turned on.                                    Trigger READY          OFF                      Within 50 ms
                                                                                                                                      output                                                                                                                         1s

                                    Guide laser marking (continuous/area frame/workpiece                                             No. 25                 ON
                                                                                                                                                                                                                       (3)                                     (6)
                                                                                                                                      Shutter status         OFF
                                       image/block frame)                                                                             output
                                                                                                                                                                                           Within 100 ms                                                             Within 100 ms


                                     No. 53 to 73         Selected number: 2/3/4/5
                                                  ON
                                     Number
                                     selection    OFF                                                                             (1) Device monitor A (B) turns off within 100 ms from the falling edge
                                                               1 ms or more
                                                                                                                                      (OFF) of Safety input A (B).
                                     No. A5
                                     Trigger
                                     READY
                                                    ON
                                                    OFF           Within 1 ms                                     Within 300 ms
                                                                                                                                  (2) Laser excitation status output and READY output turn off within 50
                                     output                                                                                           ms from the falling edge (OFF) of Device monitor A (B).
                                     No. 25                                                                                       (3) Shutter status output turns off within 100 ms from the falling edge
                                     Shutter        ON           Within 100 ms                    Within 100 ms
                                     status         OFF                                                                               (OFF) of Laser excitation status output and READY output.
                                     output
                                                                                                                                  (4) Device monitor A (B) turns on within 100 ms after recovery (ON) of
                                     No. 15
                                     Guide laser
                                                 ON
                                                                                                                                      Safety input A (B).
                                     marking
                                                 OFF
                                     input
                                                                                                                                  (5) Laser excitation status output turns on within 50 ms from the rising
                                                                  Within 1 ms
                                     No. 17                                                                                           edge (ON) of Device monitor A (B).
                                     Guide laser
                                                 ON
                                     marking
                                     output
                                                 OFF                                   30 s                                       (6) The shutter status output turns on within 100 ms from the rising
                                                                                                                                      edge (ON) of Device monitor A (B), and trigger READY output turns
                                    When the guide laser marking input is accepted, the guide laser                                  on 1 s .
                                     marking is continued for 30 seconds.
                                     To stop the guide laser marking in progress, turn on the laser control
                                     input or machinery operation mode disable input.
                                    Area Frame is only valid when setting on-the-fly marking.


                                         26                                                    - MD-X1000/1500 Series User's Manual -

---

## หน้า 27

7          Maintenance                                                     Cleaning/replacing the air filters of the controller

                                                                             Clean or replace the air filters of the controller periodically.

  7-1        Maintenance Part                                                             Before cleaning the air filter of the controller, be sure
                                                                                CAUTION   to turn off the power. Mistakenly touching high voltage
             Be sure that an engineer with specialized electrical                         areas may cause an electric shock.
   WARNING
             knowledge performs the maintenance described in
             this chapter. Mistakenly touching high voltage areas
             may cause an electric shock.                                                  If the MD-X1000/1500 Series is used with a dirty air
                                                                                            filter, the temperature inside the marking unit rises,
                                                                                            weakening the laser power or causing malfunction.
The table below lists the replacement parts for the MD-X1000/1500              NOTICE
Series.
                                                                                           After removing the air filter, never insert metal chips
                                                                                            or foreign material into the ventilation port. Doing so
                                                                                            may lead to a breakdown of the unit.
 Part name               Recommended replacement timing
 MD-X air filter         Replace or clean the air filter when dust or dirt
 (OP-87888)              has built up on the filter surface.                 1. Turn the key-operated switch of the controller to the "OFF" position
                         Replace the air filter if torn or damaged.             to turn off the power.
 MD-X marking            Replace the fan of the marking unit when it
 unit fan                stops operation.
 (OP-87889)                                                                  2. Loosen the eight screws on the upper and lower front panels.
 Time-lag fuse           Replace the fuse when blown.
                          Rating : 250 V, 10 A, Time-lag fuse
                          Recommended fuse :
                           0218010.MXP,Littelfuse,Inc.


                   Fuse holder


                                                                                                                                                               7


                                                                                                                                                               Maintenance
                                                                             3. Remove the filter holder and the filter from the panel.
              Be sure to use replacement parts specified by
               KEYENCE. Failure to use the parts specified by
               KEYENCE can result in damage to the unit.                                                                                 Filter holder
  NOTICE
              Clean the filter periodically. If the filter is clogged,
               the internal temperature rises, causing the
               MD-X1000/1500 Series to malfunction.
                                                                                                                                                  Air filter


  7-2        Maintenance

Cleaning the window

When the window surface of the marking unit becomes dirty, the laser
beam transmittance decreases, resulting in faint marking or the
absence of marking.
Periodically wipe the window gently with a cloth dampened with
acetone or ethanol to remove dirt.

                   Window
                                                                                           Handle the air filter carefully to prevent it from being
                                                                               NOTICE       damaged.
                                                                                           Never allow it to dry in direct sunlight.

                                                                             4. Remove the air filter. Clean it with neutral detergent, and allow it to
                                                                                air dry in the shade.

                                                                             5. Reverse the above procedures (Steps 1-3) to attach the dried air
                                                                                filter to the controller.

                                                                                           Tighten the screw with a tightening torque of 0.4
                                                                                            Nm.
             Be sure to turn off the power before cleaning the                 NOTICE
                                                                                           The sizes of the upper and lower filters are different.
             window. If the laser is mistakenly emitted during                              Be sure to attach them correctly.
   WARNING
             cleaning, the laser may enter directly into your or                            Upper filter: 176 x 154 mm, lower filter: 196 x 154
             someone's eye, resulting in loss of eyesight.                                  mm


             Never use cleaning solutions other than acetone or
             ethanol to wipe the window. Do not wipe it directly
  NOTICE
             with a dry cloth. Doing so may scratch the lens or
             remove the protective coating.


                                                 - MD-X1000/1500 Series User's Manual -                                                           27

---

## หน้า 28

Replacing the fan of the marking unit

              Replace the fan of the marking unit when it stops operation.

                            Be sure to turn off the power before replacing the
                 CAUTION
                              fan of the marking unit. Mistakenly touching the
                              terminals may cause an electric shock. The rotating
                              fan may cause injury.


              1. Turn the key-operated switch of the controller to the "OFF" position
                 to turn off the power.

              2. Remove the two screws (M4 x 8) securing the fan connector cover
                 and the four screws (M4 x 35) securing the fan at the rear of the
                 marking unit and remove the following:
                  Fan connector cover
                  Fan guard
                                            Marking unit

                                                      Fan


              Fan connector
                                                                             Fan guard


                                                            Fan connector
                                                            cover


              3. Disconnect the fan connector and remove the fan from the marking
7                unit.

              4. Reverse the above procedures (Steps 1-3) to attach a new fan to
Maintenance


                 the marking unit.

                NOTICE
                            Tighten the screws with a tightening torque of 0.8
                              Nm.


                 CAUTION    Do not forget to attach the fan guard. Otherwise, the
                              rotating fan may cause injury.


                 28                                            - MD-X1000/1500 Series User's Manual -

---

## หน้า 29

8 Troubleshooting                                                        Error No.
                                                                           E011
                                                                                       Error name
                                                                                       Built-in Memory
                                                                                                           Remedy
                                                                                                           Turn off the power, and then turn it
                                                                                       Card                on again.
                                                                                       Unrecognizable
                                                                                       Error
  8-1      Troubleshooting                                                 E012        Head Data
                                                                                       Error
Problems, Causes, and Remedies                                             E013        Expansion           Reduce the number of programs
                                                                                       Memory Full         registered in the index file.
                                                                                       Error               Or, set the index settings to OFF.
If a problem occurs during operation, first check the following
                                                                           E014        Mark Memory         Reduce the number of characters
troubleshooting items. If you cannot fix the problem,
                                                                                       Full Error          or logos contained in the running
contact your nearest KEYENCE office.                                                                       program No.
 Problem       Cause/Remedy                                                E015        No Program          Enter a program No. or confirm the
 Power is      The power supply cable is not connected properly.                       Error               switched program No.
 not           Check the cable connection.                                 E017        No Font File        Transfer the specified font file to
 turning on                                                                            Error               the controller.
                                                           *1
 No            Working distance is not set to 189±21 mm .                  E018        Encoder             Make adjustments so that the input
 marking       *1 MD-X1020/MD-X1020C/MD-X1520/                                         Marking             encoder pulse stays less than 100
 occurs            MD-X1520C：300±21mm/                                                 Over-Speed          kHz, or check the ambient
                   MD-X1050：100±15mm                                                   Error               environment (noise).
               The Z coordinate for block layout is not set to an          E019        Mark Trigger        Increase the trigger delay.
               appropriate value.                                                      Error
               The Z coordinate correction for Unit Setup is not set to    E020        Expansion           Reduce the user font file size or
               an appropriate value.                                                   Memory Full         delete the unnecessary user font
               The Z coordinate for block layout is not set to an                      Error 2             file.
               appropriate value.                                          E021        Sensor Timeout      Remove the workpiece or change
               Scanning speed and laser power are not set to                           Error               the setting for the sensor timeout.
               appropriate values.                                         E022        Over-Area           Check the program, test marking
               Workpiece position does not match marking position.                     Error               offset value, or the installation
               Laser beam cannot pass through because the window                                           position correct setting value.
               is dirty.                                                   E023        On-the-fly          Before the marking is finished, the
 Marking is    Scanning speed and laser power are not set to                           Marking             marking target passed. Either
 misprinted    appropriate values.                                                     Over-Area           make the scan speed faster, or
               Vibration is affecting workpiece and marking unit.                      Error               make the line speed slower.
               There are water drops, dust, or dirt on the workpiece       E025        Logo File Error     Set the logo again.
               surface.                                                    E027        Encode disable      Change the character string
               Laser beam cannot pass through because the window                       Error               contents or the number of
               is dirty.                                                                                   characters.
               Wipe off the dirt gently with a cloth dampened with                                         Or, check the replacing characters.
               acetone or ethanol while paying attention not to scratch    E028        Switching           Register the program number to be

                                                                                                                                                  8
               the window.                                                             Program             saved as an index, or switch the
               Noise is conveyed through the marking unit control                      Unexecutable        program number after program
               cable or power supply cable.                                            Error               saving is completed.
               Check the cable connection and grounding.                   E029        Scanner Error 2     Check for ambient noise.


                                                                                                                                                  Troubleshooting
               Laser ON/OFF timing is incorrect.                           E030        Limit Setting       Correct the set value for the time
               Adjust the laser ON/OFF timing to an appropriate                        Error               limit.
               setting.                                                    E031        Restart Error       Turn on the AC power while the
               The spot variation for Advanced is not set to an                                            key-operated power switch is set
               appropriate value.                                                                          to [OFF].
                                                                           E032        Logo/Custom         Reduce the block size or reduce
                                                                                       Character           the radius of the circle (oval) or
                                                                                       Enlargement         circle arc (oval arc) used for the
  8-2      Error Messages                                                              Error               logos or custom file.
                                                                           E033        Skip Cross          Reduce the skip cross width or
                                                                                       Error               increase the character size.
Error Messages                                                             E034        Encode disable      Change the character string
                                                                                       Error               contents or the number of
When an error occurs, the ERROR LED on the controller illuminates.                                         characters.
The error can be cleared by removing its cause according to the error                                      Or, check the replacing characters.
code, name, and remedy in the following list, and then setting the         E035        Quick Change        Correct the quick change of
                                                                                       of Character        character setup through the
power switch to [POWER ON] once and setting it to [LASER ON] again.
                                                                                       Setup Error         communication.
A software error or an interlock error can be cleared with the [Reset
                                                                           E037        Machinery Oval      Correct the settings so that the
Error] button, external communication (RS-232C/Ethernet), or I/O
                                                                                       Setting Error       size of the rectangle circumscribed
terminal.                                                                                                  by the oval is reduced (with the
 Error No.      Error name          Remedy                                                                 longer edge set below
 E003           Head                 Check for ambient noise.                                             131.08 mm).
                Communication        Turn off the power, and then turn                                    Length of longer edge is different
                Error                 it on again.                                                         depending on the model.
 E004           Scanner Error        This error may be caused by a        E038        Logo/Custom          Reduce the range of the
 E005           Shutter Error         bad connection of the control                    Character              program numbers specified in
 E007           Head Model            cable.                                           Buffer Full Error      [Logo/custom file buffer].
                Error                Disconnect the control cable                                          Reduce the size of the
                                      once and reconnect it.                                                  logo/custom character file
                                                                                                              subject to the logo/custom
                                    Scanner error: When the scanner                                           character buffer function.
                                    is overloaded, it may become hot                                        Change the font replacement
                                    and result in an error.                                                   conditions.
                                    Set a slower scan speed.               E039        Wobble/Scratch      Set the scan speed for the Wobble
 E010           No Marking          Make sure that there is at least one               incorrect setting   or Scratch block to 3000 mm/s or
                Block Error         marking target block or matrix.                    error               less.
                                                                           E040        Link block Error     Change the reference block
                                                                                                              number.
                                                                                                            Set the marking flag of the linked
                                                                                                              block to ON.


                                               - MD-X1000/1500 Series User's Manual -                                                   29

---

## หน้า 30

Error No.   Error name        Remedy                                   Error No.     Error name        Remedy
                  E041        Incorrect 3D      Change the position so that it falls     E252 to       Scanner Error 3   Turn off the power, and then turn it
                              Marking           within the marking range.                E255          to 6              on again.
                              Position Error                                             E270          Controller High   Check that the ambient
                  E042        Marking Loss       Check the operations and                             Temperature       temperature is within the range of
                              Detection Error      connections for the external                        Error             0 to +40°C.
                                                   sensor used for detection.            E271          Controller Low
                                                  Check whether the sensor                            Temperature
                                                   detection position is aligned                       Error
                                                   correctly.                            E280          Marking Unit      Check that the ambient
                  E043        Accidental                                                               High              temperature is within the range of
                                                  Check the operations and                            Temperature       0 to +40°C.
                              Emission             connections for the external
                              Detection Error                                                          Error (Plate)
                                                   sensor used for detection.
                                                                                         E281          Marking Unit
                  E044        Z Area Over        Re-enter the appropriate voltage
                                                                                                       Low
                              Error              for Z analog control, or enter a
                                                                                                       Temperature
                                                 value for the selection setting so
                                                                                                       Error (Plate)
                                                 that the marking does not exceed
                                                 the area.                               E282          Marking Unit
                                                                                                       High
                  E045        Unregistered        Read a barcode with a                               Temperature
                              Barcode Error        registered matching code.                           Error (PC
                                                  Register the correct matching                       board)
                                                   code.                                 E283          Marking Unit
                  E046        Warm Up             Transfer settings for warm up to                    Low
                              Setting Error        program No. 1999.                                   Temperature
                                                  Transfer an appropriate warm up                     Error (PC
                                                   setting again.                                      board)
                                                * A matrix setting, continuous           E284          Scanner High
                                                   marking setting, and grouped                        Temperature
                                                   block settings will cause a warm                    Error
                                                   up setting error.                     E285          Scanner Low
                  E047        3D Block Size      Locate the 3D block again.                            Temperature
                              Error                                                                    Error
                  E048        Z-MAP File        Set the Z-MAP file again.                E300          Memory Check      An abnormality has occurred in the
                              Error                                                                    Error 1           memory in the controller.
                  E049        No Font Error     The font file may be damaged.            E301          Memory Check      An abnormality has occurred in the
                                                Create and transfer the font data                      Error 2           area of replacement (year).
                                                again.                                   E302          Memory Check      An abnormality has occurred in the
                  E050        Marking Dat       Turn off the power and turn it on                      Error 3           area of replacement (month).
                              Generation        again.                                   E303          Memory Check      An abnormality has occurred in the
                              Error                                                                    Error 4           area of replacement (day).
                  E051 to     System Error 2
8
                                                                                         E304          Memory Check      An abnormality has occurred in the
                  E073        to 24                                                                    Error 5           area of replacement (hour).
                  E090        Internal Clock    Check the time setting in the            E305          Memory Check      An abnormality has occurred in the
                              Not Set Error     controller, and set the correct time.                  Error 6           area of replacement (minute).
Troubleshooting


                  E100        LD High           Check that the ambient                   E306          Memory Check      An abnormality has occurred in the
                              Temperature       temperature is within the range of                     Error 7           area of replacement (week).
                              Error             0 to +40°C. Check that the filters of    E307          Memory Check      An abnormality has occurred in the
                                                the controller are not clogged.                        Error 8           area of replacement (day of the
                  E101        LD Low            Check that the operating ambient                                         week).
                              Temperature       temperature is within the range of       E308          Memory Check      An abnormality has occurred in the
                              Error             0 to +40°C.                                            Error 9           area of replacement (shift code).
                  E104        Q-switch Stop      This error may be caused by a          E309          Memory Check      An abnormality has occurred in the
                              Error               bad connection of the control                        Error 10          area of replacement (rank).
                                                  cable.                                 E310          Memory Check      An abnormality has occurred in the
                                                  Disconnect the control cable                         Error 11          area of replacement (counter).
                                                  once and reconnect it.                 E311          Memory Check      An abnormality has occurred in the
                  E105        Q-switch Power     This error may be caused by a                        Error 12          area of replacement (limit).
                              Supply Error        bad connection of the control          E312          Memory Check      An abnormality has occurred in the
                  E106        Q-switch            cable.                                               Error 13          area of replacement (365 days).
                              Control Error       Disconnect the control cable           E313          Memory Check      An abnormality has occurred in the
                  E107        Q-switch            once and reconnect it.                               Error 14          area of font replacement/descend.
                              Operation                                                  E314          Memory Check      An abnormality has occurred in the
                              Check Error                                                              Error 15          area of font replacement/descend.
                  E110        Laser Power       If the current setting is 80％ or         E315          Memory Check      An abnormality has occurred in the
                              Automatic         less, set the calibration setting to                   Error 16          area of Unit Setup.
                              Calibration       OFF.                                     E316          Memory Check      An abnormality has occurred in the
                              Error                                                                    Error 17          area of error history.
                  E111        Height upper      Auto Focus failed. Confirm the           E317          Memory Check      An abnormality has occurred in the
                              limit error       working distance or Auto Focus                         Error 18          area of the running Program No.
                  E112        Height lower      settings.                                                                information.
                              limit error                                                E318          Memory Check      An abnormality has occurred in the
                  E113        Height                                                                   Error 19          common block area.
                              measurement                                                E319          Memory Check      An abnormality has occurred in the
                              failure error                                                            Error 20          area of common counter setting.
                  E202        Controller        Check that the area surrounding         When any of the Memory Check Errors 1 to 20 occurs, turn off the
                              Upper Fan         the fan is not dirty.
                                                                                        power, and then turn it on again.
                              Error             After that, turn off the power once
                                                                                        The program setting described in "Remedy" is initialized upon the
                  E203        Controller        and then turn it on again.
                                                                                        restart.
                              Lower Fan
                              Error                                                     If you use that program, reconfigure the setting.
                  E204        Marking Unit      Make sure that the marking unit          For E317, the running program No. switches to No. 0000 upon the
                              Control Cable     control cable is connected                 restart.
                              Not Connected     properly.
                              Error
                  E224 to     System Error      Turn off the power, and then turn it
                  E237        38 to 51          on again.


                   30                                      - MD-X1000/1500 Series User's Manual -

---

## หน้า 31

T008          Warming up         Wait for the device to finish
                                                                                                             warming up, or cancel the warming
Warning Message                                                                                              up.
                                                                            T009          Laser Power        Wait for the device to finish the
 Error No.      Error name         Remedy                                                 Automatic          laser power automatic calibration,
 W101           Marking Unit       The fan of the marking unit has                        Calibration        or cancel the laser power
                Fan Warning        stopped operation. Replace the                                            automatic calibration.
                                   fan.                                     T010          Adjusting          Wait for the device to finish the
                                   Check that the area surrounding                        Oscillator         adjustment.
                                   the fan is not dirty.                                  Temperature
                                   Check the connection of the fan          T011          Contactor input    Short-circuit both interlock inputs A
                                   wiring.                                                OFF                and B (terminal block).
 W110           Reduction of       Do the laser power calibration.          T012          Communication      The shutter is closed with
                Laser Output                                                              shutter control    communication commands.
                Warning                                                                   in progress
 W111           Marking            Lower the specified threshold value      T013          Upgrading the      Upgrading the version from
                Energy             for the marking energy.                                version            Marking Builder 3. Wait until it is
                Shortage           Perform the laser power                                                   finished.
                Warning            calibration.
 W112           Marking energy     Increase the specified threshold
                excess warning     value for marking energy.
                                   Perform the laser power                 Software Errors
                                   calibration.
 W 120          Controller High    Check that the ambient
                Temperature        temperature is within the range of 0    These errors occur when an attempt is made to perform marking when
                Error              to +40°C.                               the marking data is not set appropriately.
 W 121          Controller Low                                             The controller LED does not change when a software error occurs.
                Temperature                                                If a software error occurs during operation, check the marking data
                Error                                                      according to the following list. Then correct the settings to restart
 W 130          Marking Unit                                               marking.
                High                                                        Error No.     Error name         Remedy
                Temperature                                                 S000          Program            Enter the appropriate settings.
                Error (Plate)                                                             Incorrect Error
 W 131          Marking Unit                                                S001          Program            Reduce the number of programs
                Low                                                                       Memory Full        stored in the controller.
                Temperature                                                               Error
                Error (Plate)                                               S002          Built-in Memory    Reduce the number of files in the
 W 132          Marking Unit                                                              Card Full Error    memory card.
                High                                                        S003          USB Memory         Reduce the number of files in the
                Temperature                                                               Full Error         USB memory, or replace the USB
                Error (PC                                                                                    memory.

                                                                                                                                                     8
                board)                                                      S004          USB Memory         Insert a USB memory.
 W 133          Marking Unit                                                              Not Inserted
                Low                                                                       Error
                Temperature                                                 S005          USB Memory         Replace the USB memory.


                                                                                                                                                     Troubleshooting
                Error (PC                                                                 Unrecognizable     Format the memory card using a
                board)                                                                    Error              personal computer.
 W 140          LD High                                                     S006          Priority Error     Make the unit owning the priority
                Temperature                                                                                  release it and then execute the
                Error                                                                                        operation.
 W 141          LD Low                                                      S008          No-File Error      Check if the file exists.
                Temperature
                                                                            S009          Busy Error         Switch the mode after expansion
                Error
                                                                                                             or marking is completed.
                                                                            S010          No Marking         Make sure that there is at least one
                                                                                          Block Error        target marking block (matrix).
Marking Disabled Due to Input from an External Device                       S011          No. of Logos       Register a number of logos or
                                                                                          and Custom         custom characters that fall within
This error occurs when the marking unit receives an input from the I/O                    Characters         their setting range.
terminal block at the rear of the controller and cannot perform marking.                  Excess Error
The laser oscillation stops only during emergency stop.                     S014          Running            Switch the running program to
                                                                                          Program            another program and then
If one of these errors occurs, reset the system to the ready state by
                                                                                          Operation Error    continue operation.
following the remedies listed below and then restart the marking
                                                                            S015          Logo and           Remove the program that contains
process.
                                                                                          Custom             a logo (custom character or photo)
 Error No.      Error name         Remedy                                                 Character File     you want to delete from the
 T000           Remote             Clear the error by short-circuiting                    Operation Error    operation settings or index
                interlock          both interlock inputs A and B.                                            settings.
 T001           Controlling        Short-circuit the shutter control        S016          Test Mark          Remove the cause of "READY
                Shutter            inputs A and B (to be automatically                    Unexecutable       OFF".
                                   reset).                                                Error               Wait until expansion is
 T002           Trigger Locked     Release the trigger lock input (to                                          completed.
                                   be automatically reset).                                                   Wait until marking is completed.
 T003           Marking Laser      Release the marking laser stop                                             Reset the error.
                Disabled           input (to be automatically reset).                                         Reset the terminal block control.
 T004           Machinery          Release the Machinery operation          S017          Stationary         Set the correct setting again.
                Operation          mode disable input (to be                              Marking Setting
                Mode Disabled      automatically reset).                                  Error
 T005           Distance           The working distance pointer lights      S018          Barcode and        Correct the settings appropriately.
                Pointer ON         up. (READY OFF)                                        2D Code
 T006           Laser not           The key-operated power switch                        Setting
                excited              is not set to [LASER ON].                            Incorrect Error
                                    The laser excitation input             S019          All-Setup          Restore all the settings consistent
                                     (terminal 20) is not                                 Restoration        with the model used.
                                     short-circuited.                                     Error
 T007           Adjusting LD       Wait for the device to finish the        S020          Data Length        Check the connections and
                Temperature        adjustment.                                            Error              ambient noise.


                                              - MD-X1000/1500 Series User's Manual -                                                       31

---

## หน้า 32

Error No.   Error name         Remedy                                Error No.   Error name         Remedy
                  S021        Program            Use a command after registering       S074        Common             An out-of-range selection or input
                              Number Not         an appropriate program number.                    Counter            value was set for the common
                              Registered                                                           Incorrect          counter setting. Set an appropriate
                              Error                                                                Setting Error      value.
                  S022        Block Number       Use a command after registering       S075        Replacement        An out-of-range selection or input
                              Not Registered     an appropriate block number.                      Information        value was set for the replacement
                              Error                                                                Incorrect          setting. Set an appropriate value.
                  S024        Illegal            Check the command.                                Setting Error
                              Command                                                  S076        System             An out-of-range selection or input
                              Error                                                                Information        value was set for the Unit Setup
                  S025        Checksum           Confirm the method for calculating                Incorrect          setting related to 2D editing.
                              Error              checksums, or check the cable                     Setting Error      Set an appropriate value.
                                                 wiring and ambient environment        S077        Font               An out-of-range selection or input
                                                 (noise).                                          Replacement        value was set for the font
                  S026        Format Error       Check the command.                                Information        replacement. Set an appropriate
                  S027        Command            Check the command.                                Incorrect          value.
                              Unrecognizable                                                       Setting Error
                              Error                                                    S078        Scaling            An out-of-range selection or input
                  S028        Response Data      Adjust the parameters so that the                 Information        value was set for the scaling. Set
                              Length Error       response length does not exceed                   Incorrect          an appropriate value.
                                                 4096 bytes.                                       Setting Error
                  S029        Mark Data          Review the transmission timing.       S079        Font Skip          An out-of-range selection or input
                              Request Error                                                        Cross Width        value was set for the font skip
                  S030        Group No.          Register the group number.                        Information        cross width.
                              Unregistered                                                         Incorrect          Set an appropriate value.
                              Error                                                                Setting Error
                  S050        Quick Change       Correct the settings appropriately.   S080        Logo/Custom        An out-of-range selection or input
                              of Character                                                         Character          value was set for the logo/custom
                              Setup Error                                                          Buffer             character buffer.
                  S051        Sample             Remove the cause of "READY                        Information        Set an appropriate value.
                              Marking            OFF".                                             Incorrect
                              Unexecutable        Wait until expansion is                         Setting Error
                              Error                completed.                          S081        Current Value      An out-of-range selection or input
                  S052        Laser                                                                Information        value was set for the current value
                                                  Wait until marking is completed.                Incorrect          information. Set an appropriate
                              Inspection          Reset the error.
                              Unexecutable                                                         Setting Error      value.
                                                  Reset the terminal block control.   S082        3D System          An out-of-range selection or input
                              Error
                  S060        Block Type         An out-of-range selection or input                Information        value was set for the Unit Setup
                              Incorrect          value was set for the type                        Incorrect          setting mainly related to 3D editing.
                              Setting Error      selection. Set an appropriate                     Setting Error      Set an appropriate value.
                                                                                       S083        3D Incorrect       An out-of-range selection or input
8
                                                 value.
                  S061        Block Position     An out-of-range selection or input                Setting            value was set for the settings
                              Incorrect          value was set for the block                       Information        common to blocks mainly related
                              Setting Error      coordinates or rotation angle.                    Error              to 3D.
Troubleshooting


                                                 Set an appropriate value.                                            Set an appropriate value.
                  S062        Character Size     An out-of-range selection or input    S084        Operation          Enable the 3D function by
                              Incorrect          value was set for the character                   Control Error      connecting the PC where
                              Setting Error      size. Set an appropriate value.                                      MB-H3D2 is installed.
                  S063        Character          An out-of-range selection or input    S085        Incompatible       Check the version of the Marking
                              Assignment         value was set for the character                   Data Version       Builder 3 and the controller, then
                              Incorrect          assignment. Set an appropriate                                       update to the compatible versions.
                              Setting Error      value.                                S086        Wobble             Correct the settings appropriately.
                  S064        Character          An out-of-range selection or input                Incorrect
                              Advanced           value was set for the advanced                    Setting Error
                              Incorrect          setting. Set an appropriate value.    S087        2D Code            Try the 2D code reading again.
                              Setting Error                                                        Reading Error
                  S065        Marking            An out-of-range selection or input    S088        Working            The working distance
                              Condition          value was set for the marking                     Distance           measurement failed. Confirm the
                              Incorrect          condition. Set an appropriate                     Measurement        workpiece state.
                              Setting Error      value.                                            Error
                  S066        Barcode and        An out-of-range selection or input    S089        Working            Measure the working distance
                              2D Code            value was set for the barcode/2D                  distance           during a period other than marking,
                              Condition          code condition setting.                           measurement        2DC reading, or finder operation.
                              Incorrect          Set an appropriate value.                         limitation error
                              Setting Error                                            S090        Barcode             Change the registered barcode.
                  S067        Continuous         An out-of-range selection or input                Matching            Enter 20 bytes or less of encoder
                              Marking            value was set for the continuous                  Registration         text.
                              Incorrect          marking. Set an appropriate value.                Error 1
                              Setting Error                                            S091        Barcode and        Check the code type, presence/
                  S070        Matrix             An out-of-range selection or input                2D Code            absence of the link block, and
                              Information        value was set for the matrix                      Setting Error      block No.
                              Incorrect          marking. Set an appropriate value.    S092        Barcode             Register the barcode from either
                              Setting Error                                                        Matching             "Marking Builder 3" or the
                  S071        Matrix Cell        An out-of-range selection or input                Registration         console, but not both.
                              Information        value was set for the individual                  Error 2             Turn off the power, and then turn
                              Incorrect          offset for the matrix marking.                                         it on again.
                              Setting Error      Set an appropriate value.             S094        TrueType font       Reduce the number of TrueType
                  S072        Character          An out-of-range selection or input                file size error      fonts used in the system.
                              String Incorrect   value was set for the character
                              Setting Error      string setting. Set an appropriate
                                                 value.
                  S073        Individual         An out-of-range selection or input
                              Counter            value was set for the individual
                              Incorrect          counter setting. Set an appropriate
                              Setting Error      value.


                   32                                       - MD-X1000/1500 Series User's Manual -

---

## หน้า 33

Appendix

  A-1 Specifications
 Basic specifications
                                                             13 W type                                                 25 W type
                                     Standard area           Wide area               Small spot            Standard area         Wide area
              Marking unit
                                      MD-X1000              MD-X1020                                        MD-X1500                    MD-X1520
              (Controller +                                                          MD-X1050
                                     MD-X1000C*1           MD-X1020C*1                                     MD-X1500C*1                 MD-X1520C*1
              Marking unit)
 Model        Console (sold                                                            MC-P1
              separately)
              2D Code                                                         MD-XAD1 / MD-XAD1A
              Reader add-in
 Marking method                                                   XYZ 3-axis simultaneous scanning method
                                                                     YVO4: Laser Class 4 Laser Product
 Marking                                                          （IEC60825-1, FDA(CDRH) Part 1040.10) *2
 laser           Wavelength                                                       1064 nm
                 Output                                        13 W                                                           25 W
 Q switch frequency                                                CW (continuous oscillation), 1 to 400 kHz
 Guide laser, Working distance
                                                        Semiconductor laser, Wavelength: 655 nm (Class 2 Laser Product)
 pointer
 Marking area                       125 x 125 x 42 mm     330 x 330 x 42 mm        50 x 50 x 30 mm        125 x 125 x 42 mm          330 x 330 x 42 mm
 Standard working distance
                                   189 mm (±21 mm)       300 mm (±21 mm)         100 mm (±15 mm)          189 mm (±21 mm)         300 mm (±21 mm)
 (± variable width)
 Marking resolution                      2 μm                    5 μm                    1 μm                   2 μm                 5 μm
 Scan speed                        Max. 12000 mm/s        Max. 8000 mm/s           Max. 6000 mm/s         Max. 12000 mm/s       Max. 8000 mm/s
                 Font                   Original font (number, letters, katakana, hiragana, kanji)/User font/TrueType font/OpenType font *5
                 Barcode                             CODE39/ITF/2of5/NW7 (CODABAR)/JAN/CODE128/EAN/UPC-A/UPC-E
 Character       2D Code                                  QR code/Micro QR code/DataMatrix (ECC200/GS1 DataMatrix)
 type                                         GS1 DataBar/GS1 DataBar CC-A/GS1 DataBar Stacked/GS1 DataBar Stacked CC-A/
                 GS1 DataBar
                                    GS1 DataBar Limited/GS1 DataBar Limited CC-A/ GS1 DataBar Truncated/ GS1 DataBar Truncated CC-A
                Logo image                               Custom character font and logo (CAD) data, BMP/JPEG/PNG/TIF
                Work status                                        Stationary/On-the-fly (Constant speed/Encoder)
                Marking size
                (marking height      0.1 to 125 mm         0.1 to 330 mm            0.1 to 50 mm           0.1 to 125 mm               0.1 to 330 mm
                and width)
 Marking
                No. of
 parameters
                registered                                                      Max. 2000 programs
                programs
                No. of program
                blocks
                                                                                     256 blocks                                                          A
                                                                                                                        *3
 I/O (Input-output)                                        Terminal block I/O, MIL connector I/O, Contactor control I/O


                                                                                                                                                         Appendix
 Interfaces                                                  RS-232C/USB2.0/Ethernet (100BASE-TX/10BASE-T) *4
 Marking unit installation
                                                                                    All directions
 direction
 Marking unit cable length                                                       4.3 ±0.1 m
 Cooling method                                                               Forced air cooling
 Rated voltage / rated power                    100 to 120 VAC/200 to 240 VAC ±10%                        100 to 120 VAC/200 to 240 VAC ±10%
 consumption                                            50/60 Hz, Max.650 VA                                      50/60 Hz, Max.800 VA
 Overvoltage category                                                                 II
 Pollution degree                                                                     2
 Enclosure rating (Marking unit)                                                    IP64
                Storage
                ambient                                                       -10 to 60°C (No freezing)
                temperature
                Ambient
                                                                                     0 to 40°C
 Environmental temperature
 resistance     Storage
                ambient
                humidity                                                   30 to 85% (No condensation)
                Ambient
                humidity
                Controller                                                            23.0 kg
 Weight         Marking unit                                  13.6 kg                                                        13.9 kg
                Console                                                                2.0 kg

*1: Contactor control terminal block mounted
*2: The laser classification for FDA(CDRH) is implemented based on IEC60825-1 in accordance with the requirements of Laser Notice No.50.
*3: For MD-X1000C/1020C, 1500C/1520C
*4: The USB ports are the port for the USB memory/USB mouse/barcode reader (A connector) and the port dedicated to Marking Builder 3 (ActiveX)
    (B connector).
    The Ethernet port supports the communication with Marking Builder 3 (ActiveX), TCP/IP communication, PROFINET, and EtherNet/IP.
*5: TrueType font and OpenType font only support the fonts when the property of “embedded fonts” is “installable” or “editable”.
    Confirm the property of [Font] from [Control panel].


                                            - MD-X1000/1500 Series User's Manual -                                                             33

---

## หน้า 34

 MPE (Maximum Permissible Exposure)/NOHD (Nominal Ocular Hazard Distance)
                                                                               13W type                                                       25W type
                                                           Standard area       Wide area                   Small spot           Standard area          Wide area
                                                            MD-X1000           MD-X1020                                          MD-X1500              MD-X1520
                   Marking unit model                                                                      MD-X1050
                                                           MD-X1000C *1       MD-X1020C *1                                      MD-X1500C   *1
                                                                                                                                                      MD-X1520C*1
                 MPE (Maximum Permissible
                                                                                   2.48                                                       3.23
                 Exposure) (mW/cm2)
                 NOHD (Nominal Ocular
                                                           40.4                    63.9                      18.8                    47.8                 75.7
                 Hazard Distance) (m)
               *1 Model with a contactor control terminal block


                PC software specifications
                   Model                            Overview
                                                    Marking Builder 3 Ver.2 *2
                   MB3-H2D2-DVD
                                                    2D setting and editing software (focal distance/inclination correction/variable spot/distance pointer adjustment)
                                                    Marking Builder 3 3D add-in software
                 MB3-H3D1
                                                    (marking on planes, cylinders, cones, or spheres; Z-MAP marking)
               * 2 Marking Builder 3 Ver1 is also included.


                   A-2          Dimensions
                Marking unit


                                                                       300                                       433                                    145
                                                                                 68
           MD-X10＊＊: 112
           MD-X15＊＊: 94


                                                                                                                                                                    230


                       43                                     (R110)

                                40.5   10
                                            MD-X15＊＊: 52
                                            MD-X10＊＊: 64


                                                                                       6-M6 depth 8 max.                  φ82
                                                                                       Attaching hole                            (140.8)


A
                                                                                                                                             6.7 125
Appendix


                                                                                          36       150              150             (79)

                                                                                                     274.2                                                    Unit: mm


                           34                                    - MD-X1000/1500 Series User's Manual -

---

## หน้า 35

 Controller unit
                    114                (250)                  405                                  280


                                     φ18
                                                                                                                        421


                               297


                                                                                                                       19
                                                                                                          4-φ30
                                                29
                                                             330


                                                                              210


                                                                              4-M4 depth 6 max.
                                                                              (When the plastic foot is removed)


                                                                                                            Unit: mm

 Marking unit control cable


                          56                          4500                            60
                                                                                                                              A


                                                                                                                              Appendix
          73                                                                                               φ36


                                                φ10


                                                                                                            Unit: mm


                                     - MD-X1000/1500 Series User's Manual -                                        35

---

## หน้า 36

 Touch panel console MC-P1 (sold separately)

                                                  123


                                                  (283)

                                                  270                               57
                                                  (171)                             48   (47)                156   4-M4 depth 5.5 max.
                                         (Effective display area)


                                                                                                                         72
                         display area)
                         (Effective
           (203)


                             129
                   190


                                                                                                                         47
                                         Cable length:5m

                                                                                                                      Unit: mm
                                                                                                                    単位：mm


A
Appendix


                     36                                             - MD-X1000/1500 Series User's Manual -

---

## หน้า 37

A-3        Connection Examples for the MD-X1000/1500 Series and PLC
[1] Input Terminal Connections (NPN Method)                             [2] Input Terminal Connections (PNP Method)
(1) Connections that use the internal power source of the laser         (1) Connections that use the internal power source of the laser
    marker                                                                  marker
             PLC                           MD-X1000/1500 Series                     PLC                         MD-X1000/1500 Series
                   Output                    Input                                        Output                   Input
        COM for output                       COM IN B                         COM for output                       COM IN B
                                             8: COM IN B                                                           8: COM IN B
                                             6： GND for +24 V                                                      6： GND for +24 V
                                             4： COM IN A                                                           4： COM IN A
                                             2：+24V                                                                2：+24V

 Short the wiring between pins 2 and 4 and the one between pins 6       Short the wiring between pins 2 and 8 and the one between pins 4
  and 8.                                                                  and 6.
 COM IN B is shared internally.                                         COM IN B is shared internally.
(2) Connections that use an external power supply                       (2) Connections that use an external power supply
             PLC                           MD-X1000/1500 Series                      PLC                            MD-X1000/1500Series
                   Output                   Input                                          Output                     Input
         COM for output                     COM IN B                         COM for Output                           COM IN B
   External power supply                    8: COM IN B                                                               8: COM IN B
                                                                        External power supply
        Power supply -                      6： GND for +24 V                                                          6: GND for +24V
                                                                               Power supply -
        Power supply +                      4： COM IN A
                                                                              Power supply +                          4 COM IN A
                                            2：+24V
                                                                                                                      2 +24V

 Remove the factory-default short-circuit wire between pins 2 and 4,    Remove the factory-default short-circuit wire between pins 2 and 4,
  and the one between pins 6 and 8.                                       and the one between pins 6 and 8.

(3) Connections that use an external power source to keep the           (3) Connections that use an external power supply to keep
    interlock, shutter control, and laser excitation input always ON        emergency stop, shutter control, and laser indicator input
                                                                            always ON
                                           MD-X1000/1500 Series                                                    MD-X1000/1500 Series         A
                                             Interlock input, etc.                                                   Interlock input, etc.


                                                                                                                                                Appendix
                                            COM IN B                                                                COM IN B
                                            8: COM IN B                    External power supply                    8: COM IN B
   External power supply
        Power supply -                      6： GND for +24 V                       Power supply -                   6： GND for +24 V

         Power supply +                     4： COM IN A                            Power supply +                   4： COM IN A

                                            2：+24V                                                                  2：+24V


 Short the input that will be always ON with COM IN B. After this,      Short the input that will be always ON with COM IN B. After this,
  connect COM IN B to the - side of the external power supply.            connect COM IN B to the + side of the external power supply.
 COM IN B is shared internally.                                         COM IN B is shared internally.
[3] Output Terminal Connections (NPN Method)                            [4] Output Terminal Connections (PNP Method)
            PLC                            MD-X1000/1500 Series                       PLC                          MD-X1000/1500 Series

                    Input                    Output                                          Input                   Output
          COM for input                                                             COM for input


  External power supply                                                   External power supply

        Power supply -                       COM OUT                               Power supply -
        Power supply +                                                             Power supply +                    COM OUT


                                              - MD-X1000/1500 Series User's Manual -                                                    37

---

## หน้า 38

MEMO


A
Appendix


           38   - MD-X1000/1500 Series User's Manual -

---

## หน้า 39

Warranties and Disclaimers                                                Revision History
(1) KEYENCE warrants the Products to be free of defects in materials        Date of printing   Version               Revision contents
    and workmanship for a period of one (1) year from the date of           October 2014       Official release
    shipment. If any models or samples were shown to Buyer, such            October 2014       2nd edition
    models or samples were used merely to illustrate the general type       April 2015         Revised 1st edition
    and quality of the Products and not to represent that the Products
    would necessarily conform to said models or samples. Any
    Products found to be defective must be shipped to KEYENCE with
    all shipping costs paid by Buyer or offered to KEYENCE for
    inspection and examination. Upon examination by KEYENCE,
    KEYENCE, at its sole option, will refund the purchase price of, or
    repair or replace at no charge any Products found to be defective.
    This warranty does not apply to any defects resulting from any
    action of Buyer, including but not limited to improper installation,
    improper interfacing, improper repair, unauthorized modification,
    misapplication and mishandling, such as exposure to excessive
    current, heat, coldness, moisture, vibration or outdoors air.
    Components which wear are not warranted.
(2) KEYENCE is pleased to offer suggestions on the use of its various
    Products. They are only suggestions, and it is Buyer's responsibility
    to ascertain the fitness of the Products for Buyer’s intended use.
    KEYENCE will not be responsible for any damages that may result
    from the use of the Products.
(3) The Products and any samples ("Products/Samples") supplied to
    Buyer are not to be used internally in humans, for human
    transportation, as safety devices or fail-safe systems, unless their
    written specifications state otherwise. Should any
    Products/Samples be used in such a manner or misused in any
    way, KEYENCE assumes no responsibility, and additionally Buyer
    will indemnify KEYENCE and hold KEYENCE harmless from any
    liability or damage whatsoever arising out of any misuse of the
    Products/Samples.
(4) OTHER THAN AS STATED HEREIN, THE PRODUCTS/SAMPLES
    ARE PROVIDED WITH NO OTHER WARRANTIES
    WHATSOEVER. ALL EXPRESS, IMPLIED, AND STATUTORY
    WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
    PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF
    PROPRIETARY RIGHTS, ARE EXPRESSLY DISCLAIMED.
    IN NO EVENT SHALL KEYENCE AND ITS AFFILIATED ENTITIES
    BE LIABLE TO ANY PERSON OR ENTITY FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL OR
    CONSEQUENTIAL DAMAGES (INCLUDING, WITHOUT
    LIMITATION, ANY DAMAGES RESULTING FROM LOSS OF USE,
    BUSINESS INTERRUPTION, LOSS OF INFORMATION, LOSS
    OR INACCURACY OF DATA, LOSS OF PROFITS, LOSS OF
    SAVINGS, THE COST OF PROCUREMENT OF SUBSTITUTED
    GOODS, SERVICES OR TECHNOLOGIES, OR FOR ANY
    MATTER ARISING OUT OF OR IN CONNECTION WITH THE
    USE OR INABILITY TO USE THE PRODUCTS, EVEN IF
    KEYENCE OR ONE OF ITS AFFILIATED ENTITIES WAS
    ADVISED OF A POSSIBLE THIRD PARTY’S CLAIM FOR
    DAMAGES OR ANY OTHER CLAIM AGAINST BUYER. In some
    jurisdictions, some of the foregoing warranty disclaimers or
    damage limitations may not apply.

BUYER'S TRANSFER OBLIGATIONS:
    If the Products/Samples purchased by Buyer are to be resold or
    delivered to a third party, Buyer must provide such third party with
    a copy of this document, all specifications, manuals, catalogs,
    leaflets and written information provided to Buyer pertaining to
    the Products/Samples.

                                                                 E 1101-3


                                               - MD-X1000/1500 Series User's Manual -                                              39

---

## หน้า 40

Copyright (c) 2015 KEYENCE CORPORATION. All rights reserved. 13516E 1045-1 96M13516 Printed in Japan

---
