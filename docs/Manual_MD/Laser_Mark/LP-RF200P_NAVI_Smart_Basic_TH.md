# LP-RF200P_NAVI_Smart_Basic_TH

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\Laser_Mark\LP-RF200P_NAVI_Smart_Basic_TH.pdf` |
| **จำนวนหน้า** | 46 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---
## หน้า 1

Laser Marking System
                                            Laser Marker NAVI smart
                                            Quick Reference


                                                                            LP-GS series
                                                                            LP-RC series
                                                                            LP-RH series
                                                                            LP-RF series
                                                                            LP-RV series
                                                                            LP-ZV series


                                            This guide describes the following basic procedures:
                                             • How to start test marking
                                             • How to create a marking data
                                            For more information about the Laser Marker NAVI smart software,
                                            refer to the “Laser Marker NAVI smart Operation Manual”.


ME-NAVIS2-QR-3


2023.11     panasonic.net/id/pidsx/global

---

## หน้า 2

Preface
    Thank you for purchasing our product.
    For full use of this product safely and properly, please read this document carefully.
    This product has been strictly checked and tested prior to its delivery. However, please make sure that this product
    operates properly before using it. In case that the product becomes damaged or does not operate as specified in this
    document, contact the dealer you purchased from or our sales office.

    The English version of this document is the original instructions. All other languages are translations that are based on the
    original documentation.

    ⿎ General terms and conditions of this document
    1. Before using this product, or before every starting operation, please confirm the correct functioning and performance
       of this product.
    2. Contents of this document could be changed without notice.
    3. This document must not be partially or totally copied or revised.
    4. All efforts have been made to ensure the accuracy of all information in this document. If there are any questions,
       mistakes, or comments in this document, please notify us.
    5. Please remind that we assume no liability for any results arising out of operations regardless of the above clauses.

    ⿎ Disclaimer
    The applications described in this document are all intended for examples only. The purchase of our products described in
    this document shall not be regarded as granting of a license to use our products in the described applications. We do NOT
    warrant that we have obtained some intellectual properties, such as patent rights, with respect to such applications, or that
    the described application may not infringe any intellectual property rights, such as patent rights, of a third party.

    ⿎ Trademark
    • Windows is a registered trademark or trademark of Microsoft Corporation in the United States and/or other countries.
    • QR Code is a registered trademarks of DENSO WAVE INCORPORATED.
    • Adobe, Adobe Logo, Adobe Reader, and Adobe Illustrator are either registered trademarks or trademarks of Adobe
      Systems Incorporated in the United States and/or other countries.
    • Bluetooth is a registered trademark of U.S.A. Bluetooth SIG Inc.
    • EtherNet/IP is a trademark of ODVA, Inc.
    • All other product names and companies provided in this document are trademarks or registered trademarks of their
      respective companies.


2

---

## หน้า 3

How to Read this Document
 Symbol description

                      “Notice” denotes any instructions or precautions for using this product. To prevent the damage or
        ワㄐㄕㄊ㄄ㄆ
                      malfunction of the product, observe these precautions fully.


      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ       “Reference” denotes any hints for operation, detail explanations, or references.


 Target model
This manual is subject to the following Laser Marker models.
In this manual, this product is called “laser marker”.
If the setting contents or specifications vary by models, the target models are specified in the text.
In the text, multiple models may be described collectively, as shown in the table below.
Please remind that the illustration and the screen image may vary with the model.

 Target model                                                 Description in the text
 LP-GS051            LP-GS051-E                               LP-GS051             LP-GS051(-L)          LP-GS series
                                                                                                         LP-GS
 LP-GS051-F          LP-GS051-FE          LP-GS051-FN
 LP-GS051-L          LP-GS051-LE                              LP-GS051-L
 LP-GS051-LF         LP-GS051-LFE         LP-GS051-LFN
 LP-GS052            LP-GS052-E                               LP-GS052
 LP-GS052-F          LP-GS052-FE          LP-GS052-FN
 LP-RC350S                                                    LP-RC350S                                  LP-RC series
                                                                                                         LP-RC
 LP-RH300S                                                    LP-RH300                                   LP-RH series
                                                                                                         LP-RH
 LP-RH300T
 LP-RH301S                                                    LP-RH301
 LP-RH301T
 LP-RH305S                                                    LP-RH305
 LP-RH305T
 LP-RH200S                                                    LP-RH200
 LP-RH200T
 LP-RH100S                                                    LP-RH100
 LP-RH100T
 LP-RH101S                                                    LP-RH101
 LP-RH101T
 LP-RF200P                                                    LP-RF200P                                  LP-RF series
                                                                                                         LP-RF
 LP-RV200P                                                    LP-RV200P                                  LP-RV series
                                                                                                         LP-RV
 LP-ZV200P                                                    LP-ZV200P                                  LP-ZV series
                                                                                                         LP-ZV
 LP-ZV205P                                                    LP-ZV205P
 LP-ZV206P                                                    LP-ZV206P
 LP-ZV500P                                                    LP-ZV500P
 LP-ZV505P                                                    LP-ZV505P
 LP-ZV506P                                                    LP-ZV506P


                                                                                                                          3

---

## หน้า 4

 Type of manuals
    For this product, the following manuals are prepared. Read each manuals and operate this product correctly and safely.
    Also, save the manuals for future use.

    Laser Safety Guide
      This manual describes the items required for using this product correctly and safely. All users shall be required for read-
      ing this manual.

    Setup/Maintenance Guide
      This manual describes the items required for introduction and installation of this product as well as for the maintenance
      work.
       • Product specifications, external dimensions
       • Installation and connection method
       • Signal details, I/O rating, and timing chart when I/O is used for control
       • Maintenance details

    Laser Marker NAVI smart Quick Reference
      This manual describes the basic operation procedure for the laser marker configuration software “Laser Marker NAVI
      smart”. Please read this when using the laser marker for the first time.

    Laser Marker NAVI smart Operation Manual
      Instruction manual for the laser marker configuration software “Laser Marker NAVI smart”. This manual describes the
      procedure and method to operate the laser marker, and the screen operations to set marking contents.
      Mainly the users that operate this laser marker for actual marking procedure shall be required for reading this manual.

    Serial Communication Command Guide
      This manual describes the communication commands to control this product externally using the serial communication
      (RS-232C/Ethernet). It describes the communication settings, communication data formats, communication commands,
      and the control samples.
      Mainly the machine builder and system integrator shall be required for reading this manual.

    Serial Communication Command Guide: LP-400/V compatible mode
      This manual describes the communication commands to control LP-GS/LP-RC/LP-RH/LP-RF/LP-RV/LP-ZV externally
      using the compatible command format with the previous models of LP-400/LP-V series.
      Mainly the machine builder and system integrator shall be required for reading this manual.

    Serial Communication Command Guide: LP-M/S/Z compatible mode
      This manual describes the communication commands to control LP-ZV externally using the compatible command format
      with the previous models of LP-M/LP-S/LP-Z series.
      Mainly the machine builder and system integrator shall be required for reading this manual.


       ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
    • The PDF data of each manual can be downloaded from our Internet website.
    • To read the PDF manual, Adobe Reader (Version X or later) of Adobe Systems Incorporated is required.


4

---

## หน้า 5

Contents
     Preface………………………………………………………………………………… 2
     How to Read this Document………………………………………………………… 3

1 Laser Marker NAVI smart Basics…………………………………… 6
     1-1 “Startup” screen…………………………………………………………………… 7
     1-2 “Marking settings” screen………………………………………………………… 8
     1-3 “Monitor” screen…………………………………………………………………… 11
     1-4 “Maintenance” screen…………………………………………………………… 13
     1-5 “Data management” screen………………………………………………………15
     1-6 “System settings” screen………………………………………………………… 17

2 Let's Use Laser Marker NAVI smart…………………………………19
     2-1 Start Laser Marker NAVI smart…………………………………………………21
           2-1-1 Start Laser Marker NAVI smart……………………………………………… 21
           2-1-2 Open a marking file to edit…………………………………………………… 22
     2-2 Create a marking file (offline mode)……………………………………………23
           2-2-1 Create a marking object……………………………………………………… 23
           2-2-2 Specify the layout of a marking object……………………………………… 24
           2-2-3 Set laser parameters…………………………………………………………… 25
     2-3 Save marking data to your PC……………………………………………………26
     2-4 Connect your PC and the laser marking system………………………………27
     2-5 Start the laser marking system…………………………………………………28
     2-6 Establish an online connection…………………………………………………29
     2-7 Transfer a marking file from your PC to the laser marking system……………30
     2-8 Start laser radiation for marking…………………………………………………32
           2-8-1 Check the marking position using the guide laser………………………… 32
           2-8-2 Turn laser pumping on………………………………………………………… 34
           2-8-3 Perform test marking…………………………………………………………… 35
     2-9 Terminate the operation…………………………………………………………36

3 Create Various Marking Data…………………………………………37
     3-1 Mark date and time………………………………………………………………38
     3-2 Mark 2D code……………………………………………………………………… 41
     3-3 Mark a graphic……………………………………………………………………44


                                                                                    5

---

## หน้า 6

1 Laser Marker NAVI smart
  Basics

---

## หน้า 7

1-1 “Startup” screen
When you launch Laser Marker NAVI smart, the “Startup” screen appears.
You can select the software application among “Online”, “Offline”, or “Convert”.

 User interface overview


                                                                           2

        1
                                                                           3


                                                                               4


       Item                      Description

 1     Menu                      With the menu tools, you can set the software preferences such as changing the user
                                 interface language and customizing user interface elements.

 2     Online                    You can establish an online connection between your PC and the laser marking system.
                                 In online mode, you can configure the laser marking system and save the marking data
                                 to the laser marking system.

 3     Offline                   In offline mode, you can create and edit marking files saved on local or network drives.

 4     Convert                   You can convert a backup file or marking file used in the former models such as LP-M/
                                 LP-S/LP-Z (to LP-ZV only) or LP-400/LP-V into the file format that can be opened with
                                 Laser Marker NAVI smart.


                                                                                                                            7

---

## หน้า 8

1-2 “Marking settings” screen
    In this screen, you can create and edit marking data such as character, graphic and bar code objects and save them in a
    file. If you are logged in as “Restricted user”, only the parameters allowed to edit are available.

    You can do the following:
    • Create new marking data.
    • Edit a marking or backup file that is saved on a local or network drive (offline mode).
    • Edit a marking file that is saved on the laser marking system (online mode).
    • Execute test marking (online mode).

     User interface overview


                 1                                                                                                     5
                 2


                 3                                                                                                     6


                 4


          Item                          Description

     1    Ribbon - setting tools        You can use the tools to execute file handling, create or edit marking data.

     2    File number and file          The number and name of the selecting file are displayed in the tab.
          name

     3    Marking image editor          The image of marking data such as characters and graphics is displayed in this area.

     4    Status bar                    In online mode, it displays any of the following information:
                                         • Current operation mode (remote mode or RUN mode)
                                         • Laser pumping status (on or off)
                                         • Error number and error message if any error is occurred

     5    Ribbon - control tools        You can use the tools to control the laser marking system in online mode.

     6    Marking settings              Set the marking data in the following tabs:

          • Object settings         :     Specify settings of the marking object such as character, graphic and bar code objects.
          • Function settings       :     Configure the function such as counter, expiry time and lot.
          • File settings           :     Specify the settings such as position, trigger parameters which are applied to all
                                          objects in a marking file.
          • Laser settings          :     Specify laser parameters such as laser power and scan speed.
          • On-the-fly marking      :     Specify on-the-fly marking settings if you want to mark a workpiece in motion. (LP-RC/
                                          LP-RH/LP-RF/LP-RV/LP-ZV)


8

---

## หน้า 9

 Setting tools in the ribbon

     1        2       3                      4                                    5          6         7         8


     Item                  Description

 1   Open                  Select a marking file to open and edit in the “Marking settings” screen.

 2   Save                  Save the marking files to the connected laser marking system or to your PC.

 3   Undo / redo           You can use these editing tools to revert the most recent operation.
                                Icon       Description          Keyboard shortcut

                                              Undo                    Ctrl + Z

                                              Redo                    Ctrl + Y


 4   Marking objects       Create marking objects (“Character”, “TrueType”, “Graphic”, “Shapes”, “Bar code”, “2D
                           code”, “Point radiation”).

 5   Align / adjust        To align or distribute selected objects, use the “Align” tool. To adjust a character object,
                           use the “Adjust” tool.

 6   Basic editing tools   To perform basic operations, use any of the following icons:
                                Icon       Description          Keyboard shortcut

                                                 Cut                  Ctrl + X

                                                 Copy                Ctrl + C

                                              Delete                  Delete

                                              Paste                   Ctrl + V


 7       3D                Edit the marking layout for 3D shaped workpieces such as cylinders and slopes. (LP-ZV
                           series only)

 8   Camera                Set or operate the internal camera in the head. (LP-ZV series only)


                                                                                                                          9

---

## หน้า 10

 Control tools in the ribbon
                            1         2           3            4          5         6


      Item                  Description

  1   Test marking          Opens the “Test marking/guide laser” dialog to perform test marking, guide laser
                            radiation, and marking time measurement.
  2   Guide laser

  3   Connection            Use this tool to establish or disconnect an online connection between the laser marking
                            system and a PC.

  4   Operation             Use this tool to switch the laser marking system operation to remote or RUN mode.

  5   Laser pumping         Turns laser pumping on or off.

  6   “Stop laser” button   Terminates the laser radiation or disable the laser radiation temporarily.


10

---

## หน้า 11

1-3 “Monitor” screen
In this screen, you can monitor the operation status of the laser marking system during remote mode or RUN mode.

You can do the following:
• Check the marking image.
• Check the marking settings.
• Check the ON or OFF status of I/O terminals.

 User interface overview


             1                                                                                                 4
             2

                                                                                                               5

             3


      Item                         Description

 1    Ribbon - setting tools       You can use the tools to open a marking file or show the I/O monitor.

 2    File number and file         The number and name of the selecting file are displayed in the tab.
      name

 3    Marking image editor         The image of marking data such as characters and graphics is displayed in this area.

 4    Ribbon - control tools       You can use the tools to control the laser marking system in online mode.

 5    Marking settings             You can check the marking data in the following tabs:

      • Current settings       :     You can check some of the marking parameters that are enabled in “System settings”
                                     > “Access permissions” in advance.
      • On-the-fly             :     You can check the status of on-the-fly marking (“ON”/“OFF”) and the line speed. (LP-
                                     RC/LP-RH/LP-RF/LP-RV series)
      • Real-time data               Displays the state of the on-the-fly, the marking energy measurement result and the
                                     workpiece displacement of the auto focus function. (LP-ZV series)
      • Reference character    :     The specified reference character strings are listed.
        strings


                                                                                                                            11

---

## หน้า 12

 Setting tools in the ribbon
                                                1          2          3


         Item                  Description

     1   Open                  You can select and open a marking file on the “Monitor” screen.

     2   I/O monitor           The status (“ON”/“OFF”) of the I/O terminals on the laser marking system is displayed.

     3   Refresh screen        This button is available in the ribbon, if you select “Button “Refresh screen”” in “Startup”
                               > “Preferences” > "Action setting" > “Screen refresh” > “Method”.
                               Use the “Refresh screen” button to manually update the “Monitor” screen.


  Control tools in the ribbon


                                1         2           3           4          5          6


         Item                  Description

     1   Start marking         In RUN mode, you can use this button to trigger the laser radiation manually.

     2   Lock                  Use this tool to unlock or lock the “Start marking” button.

     3   Connection            Use this tool to establish or disconnect an online connection between the laser marking
                               system and a PC.

     4   Operation             Use this tool to switch the laser marking system operation to remote or RUN mode.

     5   Laser pumping         Turns laser pumping on or off.

     6   “Stop laser” button   Terminates the laser radiation or disable the laser radiation temporarily.


12

---

## หน้า 13

1-4 “Maintenance” screen
This screen is used for the maintenance of the laser marking system.

You can do the following:
• Check the operating data.
• Start laser radiation to measure the laser power with a commercial power meter.
• Measure the laser power by using the internal power monitor. (LP-ZV500P/LP-ZV505P/LP-ZV506P only)
• Simulate output operation.
• Check the communication command history.

 User interface overview


              1                                                                                                 3


              2


       Item                         Description

 1     Ribbon - setting tools       You can use the tools to perform output simulation, power check (LP-ZV), or save the
                                    operating information.

 2     Maintenance data *1          You can check the operating information in the following tabs:

       • Operating data         :     You can check the operating data of the laser marking system, such as the total
                                      operating time of the each part.
       • Error log              :     You can view the error log.
       • Command history        :     The transmitted and received communication commands are displayed.
       • Power check history    :     Displays the history of measurement and power correction executed by the power
                                      check function. (LP-ZV500P/LP-ZV505P/LP-ZV506P only)

 3     Ribbon - control tools       You can use the tools to control the laser marking system in online mode.

*1 : When you edit a backup file in offline mode, the data at the time of backup are displayed.


                                                                                                                           13

---

## หน้า 14

 Setting tools in the ribbon
                                         1         2            3             4


         Item                  Description

     1   Save as TSV           Manages the following history information.
                               • Error log
     2   Delete all            • Command history
                               • Power check history (LP-ZV500P/LP-ZV505P/LP-ZV506P only)
                               Select "Save as TSV" to export the logs listed in the displayed tab as a TSV file.
                               Select "Delete all" to delete all logs listed in the displayed tab.

     3   Output simulation     Use the output simulation function to check the operation of external devices connected
                               to the laser marking system by manually changing the status of an output.

     4   Power check           You can measure the laser power by using the internal power monitor and correct the
                               power setting value according to the measurement results. (LP-ZV500P/LP-ZV505P/LP-
                               ZV506P only)


  Control tools in the ribbon

                                   1                 2           3           4          5


         Item                  Description

     1   Laser radiation for   Use this function to check the laser power with a commercial power meter.
         measurement

     2   Connection            Use this tool to establish or disconnect an online connection between the laser marking
                               system and a PC.

     3   Operation             Use this tool to switch the laser marking system operation to remote or RUN mode.

     4   Laser pumping         Turns laser pumping on or off.

     5   “Stop laser” button   Terminates the laser radiation or disable the laser radiation temporarily.


14

---

## หน้า 15

1-5 “Data management” screen
This screen lists all files that are currently saved on the laser marking system, including marking files, graphic files and font
files.

You can do the following:
• Add or delete a marking file, graphic file, or font file.
• Copy a backup file from the laser marking system.
• Save a backup file or restore it to the laser marking system.

 User interface overview


              1                                                              4                                   5

              2
              3

                                                                                                                 6


       Item                       Description

 1     Ribbon - setting tools     You can add, delete or manage files in the laser marking system.

 2     Search for file number     You can search for a marking file by entering a file number.

 3     File list                  All files that are currently saved on the laser marking system, including marking files,
                                  graphic files and font files are listed.

 4     Search for file name       You can search for marking files, font files, or graphic files by entering a character string
                                  in the search box.

 5     Ribbon - control tools     You can use the tools to control the laser marking system in online mode.

 6     Preview                    Displays the image of the selected file.


                                                                                                                                  15

---

## หน้า 16

 Setting tools in the ribbon

                   1        2                      3                      4          5          6          7


      Item                      Description

  1   Add                       Adds a marking file, graphic file, or font file to use it in the laser marking system.

  2   Save to PC                Saves a selected file to your local or network drive.

  3   Copy, Paste, Delete       To manage marking files, graphic files and font files, use the copy, paste, and delete
                                functions.

  4   Edit graphic file         To edit a graphic file in the list, use this tool.

  5   Rename                    To change the name of marking files, use this tool.

  6   Backup                    Saves a backup file (.lzb or .lmb) to your local or network drive.

  7   Restore                   Restores an existing backup file (.lzb or .lmb) to your laser marking system.


  Control tools in the ribbon

                                              1            2          3          4


      Item                      Description

  1   Connection                Use this tool to establish or disconnect an online connection between the laser marking
                                system and a PC.

  2   Operation                 Use this tool to switch the laser marking system operation to remote or RUN mode.

  3   Laser pumping             Turns laser pumping on or off.

  4   “Stop laser” button       Terminates the laser radiation or disable the laser radiation temporarily.


16

---

## หน้า 17

1-6 “System settings” screen
In this screen you set the system properties of the laser marking system.

You can do the following:
• Change the date and time of the system clock.
• Make settings for communication with external devices.
• Specify input and output settings.
• Set the administrator password.
• Make settings for laser power correction and marking position offset.

 User interface overview


              1                                                                                                  3


              2


       Item                         Description

 1     Ribbon - setting tools       You can update the system settings and view information about the laser marking
                                    system.

 2     System parameters            You can configure the system parameters in the following tabs:

       • Operation/             :     Specify the date and time, remote mode settings and other operatinal preferences.
         information
       • System offset          :     Set the laser head direction, adjust the marking field position and laser settings.
       • Inputs/outputs         :     Specify input and output settings.
       • Communication          :     Specify communication settings for such as RS-232C, Ethernet and command format.
       • Linked device          :     Specify the settings for the external device such as the imagechecker and code reader
                                      connection.
       • Access permission      :     Configure permissions for the “Restricted user” and customize the “Monitor” screen.

 3     Ribbon - control tools       You can use the tools to control the laser marking system in online mode.


                                                                                                                            17

---

## หน้า 18

 Setting tools in the ribbon
                                             1                  2            3


      Item                     Description

  1   Apply to laser marking   Updates the system settings in the laser marking system. If any changes are made, “!”
      system                   symbol is appeared on the icon.

  2   System information       Displays information about the laser marking system, such as version or serial number.

  3   Marking field            You can adjust the marking field position when it is misaligned. It is available for LP-RF/
      calibration              LP-RV/LP-ZV.


  Control tools in the ribbon

                                          1            2            3        4


      Item                     Description

  1   Connection               Use this tool to establish or disconnect an online connection between the laser marking
                               system and a PC.

  2   Operation                Use this tool to switch the laser marking system operation to remote or RUN mode.

  3   Laser pumping            Turns laser pumping on or off.

  4   “Stop laser” button      Terminates the laser radiation or disable the laser radiation temporarily.


18

---

## หน้า 19

2 Let's Use Laser Marker
  NAVI smart

---

## หน้า 20

 Setting and operating procedures
 Follow the steps to configure marking settings and perform marking.
 A typical step by step example is given below.


        1. Start Laser Marker NAVI smart

           1) Start Laser Marker NAVI smart
           2) Open a marking file to edit


        2. Create a marking file (offline mode)

           1) Create a marking object
           2) Specify the layout of a marking object
           3) Set laser parameters


        3. Save marking data to your PC


        4. Connect your PC and the laser marking system


        5. Start the laser marking system


        6. Establish an online connection


        7. Transfer a marking file from your PC to the laser marking system


        8. Start laser radiation for marking

           1) Check the marking position using the guide laser
           2) Turn laser pumping on
           3) Perform test marking


        9. Terminate the operation


20

---

## หน้า 21

2-1 Start Laser Marker NAVI smart

2-1-1 Start Laser Marker NAVI smart
1.   Select the program with the following procedures according to your OS version.
     • In Windows 11, open the start menu and select “All Apps” - “Panasonic-ID SUNX Laser” - “Laser Marker NAVI
       smart”.
     • In Windows 10, open the start menu and select “Panasonic-ID SUNX Laser” - “Laser Marker NAVI smart”.

2.   Laser Marker NAVI smart starts and displays the “Startup” screen.


                                                                                                                   21

---

## หน้า 22

2-1-2 Open a marking file to edit
     Select “New...” > “Marking file (.lms)” and select the
     model of your laser marking system.
     In this example, LP-RF200P is selected.


     The “Marking settings” screen opens with an empty
     marking image editor.


22

---

## หน้า 23

2-2 Create a marking file (offline mode)

2-2-1 Create a marking object
Create marking objects and specify the desired marking settings.
A typical procedures to set a marking object, for example character text “ABCD” are given below.

1.   Select “Character” > “Direct input” in the ribbon.


2.   In the dialog, enter the text for your
     character object.
     Make sure that the entered text is             2
     displayed in the “Preview” window.


3.   Select “OK”.


                                                                                                   3


4.   The entered text is displayed in the marking image editor.


                                                                                                       23

---

## หน้า 24

2-2-2 Specify the layout of a marking object
 Typical procedures to set a marking object, for example to set character text “ABCD”, are given below.

                            Character spacing: 5 mm


        Character height:
        4 mm

                            Character width: 4 mm
      X-position: -10 mm
      Y-position: 5 mm


 1.   Open the “Object settings” tab.
                                                                  1

                                                                      2
 2.   To edit the parameters of the character object, select
      the object in the object list or in the marking image
      editor.
      The parameters are displayed in the category below
      the object list.


 3.   Specify the character size.
      Character height:       4 mm
      Character width:        4 mm
      Character spacing:      5 mm
                                                                  3


 4.   Under “Position, rotation”, specify values for the
      following parameters:
      X-position: -10 mm
      Y-position:   5 mm


      Confirm the layout displayed in the marking image editor.


24

---

## หน้า 25

2-2-3 Set laser parameters
Specify laser parameters that apply to all objects in the marking file, such as laser power and scan speed.

1.   Open the “Laser settings” tab.                                                                   1

2.   Specify the value for “Laser power”.
     Laser power: 30.0                                          2
     For test marking, it is recommended to set a lower         3
     laser power value. Check the marking quality and
     adjust the parameters gradually until the marking
     result meets your expectations.

3.   Specify the value for “Scan speed [mm/s]”.
     Scan speed [mm/s]: 300
     Higher scan speed reduces the marking time and the
     thermal effect on the workpiece.


                                                                                                              25

---

## หน้า 26

2-3 Save marking data to your PC
 If you edit a marking file in offline mode, you must save it to your PC before you can transfer it to the laser marking system.

 1.   In the “Marking settings” screen, select “Save” > “Save as” in the ribbon.


 2.   Select the storage location, enter a file name and select “Save”.


      The file is saved in the marking file format .lms to your local or network drive.


26

---

## หน้า 27

2-4 Connect your PC and the laser marking system
1.    Connect the USB cable to the USB interface B on the
      controller.


       ワㄐㄕㄊ㄄ㄆ
• Do not disconnect the USB cable while the laser marking
  system is online.


                                                                     PC                          Controller
     ンㄆㄇㄆㄓㄆㄏ㄄ㄆ                                                                              (LP-RC/LP-RF/LP-RV)

• Before you can make an Ethernet connection, you must make the appropriate communication settings in Laser Marker
  NAVI smart. Connect the PC via USB to make these settings.
• If the laser marking system supports Bluetooth, before you can make a Bluetooth connection, you must make the
  appropriate communication settings in Laser Marker NAVI smart. Connect the PC via USB to make these settings.
• For details of the connection, refer to the “Setup/Maintenance Guide” of your laser marker.


                                                                                                                     27

---

## หน้า 28

2-5 Start the laser marking system
                                            • In case of an emergency stop or an interlock, re-pumping of the laser marking
         WARNING                              system will be necessary. For safety reasons, construct a laser re-pumping
                                              system which must be operated by hand.


 1.   Setup the laser marker connecting head, controller and interfaces. For LP-RV/LP-ZV the oscillator unit should be also
      connected.


 2.   Turn on the key switch on the front of the controller.
                                                                                                   ヱヰ
                                                                                                       ヸ
      LP-GS:                                                                                            ユン
                                                                                        OFF
      MAIN LED on the controller blinks.
                                                                                                                     ヮ
                                                                                                                       モリ
                                                                                                                          ワ
                                                                                                             ON      ロモ
                                                                                                                        ヴユ
                                                                                                                           ン
                                                                                                                     ヮ
                                                                                                                       モン
                                                                                                                           レリ
                                                                                                                     モロ       ワ
                                                                                                                        モン ヨ
                                                                                                                           ヮ


      LP-RC/LP-RF/LP-RV:
      The controller LED display lights and shows “PLEASE WAIT”.


                                                                                        ヱヰ
                                                                                          ヸ
                                                                                             ユン
                                                                                OFF


                                                                                                  ON


 3.   The system startup completes approximately after 10 seconds.
      LP-GS:
      MAIN LED on the controller changes from blinking light to steady light.

      LP-RC/LP-RF/LP-RV:
      The file number is displayed on the controller LED display.


      LP-RH/LP-ZV:
      MAIN LED on the controller lights up.


       ワㄐㄕㄊ㄄ㄆ
 • Do not turn the key switch off before the system startup has been completed.
 • If you turn off the power supply and turn on again soon after, leave the interval five seconds or more.
 • LP-RC/LP-RF/LP-RV: In case the file number is not displayed on the LED display after 10 second passes since turning
   on the key switch, contact our sales office or representatives.
 • LP-RH/LP-ZV: In case the laser marker is not started with the ALARM LED on the controller blinks (cannot connect
   online with Laser Marker NAVI smart), contact our sales office or representatives.


28

---

## หน้า 29

2-6 Establish an online connection
1.   Select the “Connection” tool in the ribbon.
     Alternatively, go to the “Startup” screen and select “Online”.
     The “Connection” dialog appears.


2.   Select the laser marking system
     that you want to connect and select
     “Connect” to establish the connection.


                                                                      29

---

## หน้า 30

2-7 Transfer a marking file from your PC to the laser
      marking system
 1.   Go to the “Marking settings” screen and select “Open” > “From PC” in the ribbon.


 2.   In the dialog, choose a marking file (.lzs or .lms) from your local or network drive and select
      “Open”.A dialog opens and shows a list of all marking files saved on the laser marking system.


 3.   Select a table row to assign the marking file to a number on the laser marking system. Select “OK” to save the marking
      file on the laser marking system.


30

---

## หน้า 31

The marking file is opened in the “Marking settings” screen.


                                                               31

---

## หน้า 32

2-8 Start laser radiation for marking

 2-8-1 Check the marking position using the guide laser
 For LP-GS051, LP-GS051-L, LP-RC, LP-RH, LP-RF, LP-RV and LP-ZV, you can use the guide laser to display the marking
 field, marking image, masked objects, or work distance. For LP-GS052, only the pointer is available as a guide laser
 function.

 1.   Set your workpiece on the marking position.
      Set the appropriate work distance depending on your laser marking system.

                         Model                       Work distance
                       LP-GS051                      111 mm ± 3mm
                     LP-GS051-L                          111mm
                       LP-GS052                          71 mm
                         LP-RC                          103 mm
          LP-RH300, LP-RH200, LP-RH100                  185mm
                LP-RH301, LP-RH101                       111mm
                      LP-RH305                          262mm
                     LP-RF, LP-RV                       190 mm
               LP-ZV200P, LP-ZV500P                  190mm ± 25mm
               LP-ZV205P, LP-ZV505P                  220mm ± 25mm
               LP-ZV206P, LP-ZV506P                  330mm ± 25mm


 2.   Select the “Guide laser” tool in the ribbon.
      The “Test marking/guide laser” dialog appears.


 3.   Select “Work distance” for “Guide laser display” and
      select “Guide laser ON” to start radiating the guide
      laser.


      Adjust the work distance so that the dot overlaps with the center of the crosshairs.


                                                                      The guide laser indicates the work distance.


32

---

## หน้า 33

4.   Select “Guide laser OFF” to stop the radiation of the
     guide laser.


5.   Select “Marking image” for “Guide laser display” and
     select “Guide laser ON” to start radiating the guide
     laser.
     Move the workpiece to the desired marking position.


         The guide laser indicates the marking image.


6.   Select “Guide laser OFF” to stop the radiation of the
     guide laser.

7.   To exit the dialog, select “Close”.


                                                             33

---

## หน้า 34

2-8-2 Turn laser pumping on
 Turn laser pumping on to enable the lasing process.

 1.   Select the “Laser pumping” tool in the ribbon.


 2.   In the confirmation dialog, select “Yes” to start laser pumping.
      A certain amount of time is required to complete laser pumping for the
      different laser marking systems:
      • LP-GS: approx. 8-15s
      • LP-RC: approx. 10s
      • LP-RH: approx. 5-10s
      • LP-RF: approx. 7s
      • LP-RV/LP-ZV: approx. 1s


 3.   After a few seconds, laser pumping is completed and the status icon of
      the “Laser pumping” tool changes.


34

---

## หน้า 35

2-8-3 Perform test marking

1.   Select “Test marking” in the ribbon.


2.   In the dialog, check the values for the laser settings
     and change them if required.
     The available parameters depend on the model of
     your laser marking system.                                    2

3.   Select “Start marking” to trigger the laser radiation.
                                                                  3
     A confirmation dialog appears.


4.   Select “Yes” to start laser radiation.
     The shutter opens automatically and marking starts.


                                              • Take appropriate protective measures during laser radiation such as wearing
        WARNING                                 laser protective goggles or using a protective enclosure.


     During a marking process, you can select “Stop
     marking” to terminate the test marking.


5.   To close the dialog, select “Close”.


                                                                                                                              35

---

## หน้า 36

2-9 Terminate the operation
 1.   To turn laser pumping off, select the “Laser pumping” tool in the
                                                                                              “Laser pumping” tool
      ribbon.


                                                                                  Laser pumping on         Laser pumping off


 2.   Select “Online” in the ribbon. Alternatively, go to the “Startup” screen and select “Online”.
      The “Connection” dialog appears.                                                                           “Online” tool


 3.   Select “Disconnect”.
      The online connection with the laser marking system is now disconnected.


       ワㄐㄕㄊ㄄ㄆ
 • Do not turn off the power supply during an online connection with your PC. Otherwise a data loss or system failure may
   occur.


 4.   Go to the “Startup” screen and select “Exit” from the menu.
      Alternatively, select “X” in the upper right corner of the screen.


 5.   Turn off the power of the laser marking system and remove the key from the controller.                     ヱヰ
                                                                                                                     ヸ
                                                                                                                      ユン
      The laser safety officer must keep the key.
                                                                                                        OFF


                                                                                                                           ON


36

---

## หน้า 37

3 Create Various Marking
  Data

---

## หน้า 38

3-1 Mark date and time
 Set the functional characters to mark the automatically updated date and time. The procedures to set the current time are
 given below.

  Example

                              Item                          Setting
         13 29                Number of characters          2
          hour   minute
                              Date/time type                Hour (24), Minute
                              Zero indication               Zero fill


       ワㄐㄕㄊ㄄ㄆ
 • Functional characters such as current date and time or lot are based on the system clock of the laser marking system.
   It may happen that the system clock deviates from the accurate time due to errors of internal parts or low battery level.
   Therefore, check the system clock in the laser marking system regularly to ensure that the date and time are correct.


38

---

## หน้า 39

 Setting procedures

1.   In the “Marking settings” screen, select “Character” > “Direct input” in the ribbon.
     The “Character” dialog opens.


2.   Select “Functional characters”.
     The “Functional characters” dialog opens.


3.   Select the “Date/time” tab and specify the parameters
     of the functional character.
     • Date/time: Current date/time
     • Number of characters:         2
     • Date/time type:     Hour (24)                              3
     • Zero indication:    Zero fill

4.   Select “OK”.                                                                           4
     In the input window, “%02:H0” is displayed.
     Check the functional characters in the
     “Preview” window.

5.   Select “Functional characters”.
     The “Functional characters” dialog opens.


                                                                                                39

---

## หน้า 40

6.   Select the “Date/time” tab and specify the parameters
      of the functional character.
      • Date/time: Current date/time
      • Number of characters:         2
      • Date/time type:     Minute                                  6
      • Zero indication:    Zero fill

 7.   Select “OK”.                                                                             7
      In the input window, “%02:H0%02:m0” is displayed.
      Check the functional characters in the
      “Preview” window.

 8.   Select “OK” to close the dialog and return
      to the “Marking settings” screen.


 9.   Confirm that the current time is displayed in the
      marking image editor as the marking characters.


 10. If required, change the parameters in the character object settings and laser settings.
      Refer to “2-2 Create a marking file (offline mode)” (P.23).


 11. Perform the test marking.
      Refer to “2-8 Start laser radiation for marking” (P.32).


40

---

## หน้า 41

3-2 Mark 2D code
The procedures to set a QR Code are given below.

 Example

                                                        Item                         Setting
                                                        Code type                    QR Code, Model 2
                                                        Code data                    ABCDEFGHIJKLMN12345
                                                        Error correction level       M
                                  Module height         Module height                0.500 mm
                                                        Module width                 0.500 mm
                                                        Human readable text          Disabled
                  Module width


 Setting procedures

1.   In the “Marking settings” screen, select “2D code” > “QR Code” in the ribbon.
     The “Code data” dialog opens.


2.   Input the characters that you
     want to encode. In this example,
     “ABCDEFGHIJKLMN12345” is entered.
     Select “OK” to close the dialog and return
     to the “Marking settings” screen.


                                                                                                           41

---

## หน้า 42

3.    Confirm that the QR code is displayed in the marking image editor.


 4.    Depending on your code data, specify any of the
       following parameters:
       • Standard: If the code data contains Simplified
         Chinese characters, select “GB/T 18284”. If you
         select “ISO/IEC 18004”, you can set Japanese
         characters.
       • Mode (QR): Select the mode depending on
         the character type. If “Auto” is set, the mode is
         selected automatically depending on the code
         data.                                                  4
                                                                5
 5.    Depending on your desired code specification,            4
       specify any of the following parameters:
                                                                5
       • Model: In most cases, “Model2” is used.
       • Error correction level
       • Version: The allowed number of input characters
                                                                6
         depends on the selected version. If “Auto” is set,
         the version is selected automatically depending
         on the code data.
       • Number of quiet modules: If “Auto” is selected,
         the quiet zone width is set according to the code's
         requirements for the minimum width.

 6.    Specify the module size to enter the value of the following parameters:
       • Module height [mm]
       • Module width [mm]
       In this example, 0.5mm is set for the both values.
       The entire width and height of the code, including the quiet zone are displayed in “Total width [mm]” and “Total height
       [mm]”.

      ンㄆㄇㄆㄓㄆㄏ㄄ㄆ
 • For details of the QR code settings, refer to the “Laser Marker NAVI smart Operation Manual”.


42

---

## หน้า 43

7.   Set the filling pattern parameters for QR Code.
     • Filling pattern:                     Horizontal line
     • Filling width per module [mm]:       0.500
     • Filling height per module [mm]:      0.500                  7


8.   Specify if you use the human readable text or not.
     If you do not mark the human readable text, set as
     follows:
     • Human readable text:          OFF


                                                                   8


9.   Confirm that the QR code is displayed
     in the marking image editor.


10. If required, change the parameters in the 2D code object settings and laser settings.
     Refer to “2-2 Create a marking file (offline mode)” (P.23).

11. Perform the test marking.
     Refer to “2-8 Start laser radiation for marking” (P.32).


                                                                                            43

---

## หน้า 44

3-3 Mark a graphic
 You can add graphic files created with AutoCAD or the Logo Data Editing software to use them in your marking file. The
 procedures to set a graphic are given below.

  Example


  Setting procedures

 1.   In the “Marking settings” screen, select “Graphic” > “Graphic files”
      in the ribbon.
      The “Graphic” dialog opens.


 2.   In the dialog, select “Add”.


 3.   Choose a graphic file from your local or network drive and select “Open”.


44

---

## หน้า 45

4.   Select the graphic to be inserted into the marking file and confirm with “OK”.


5.   The graphic is added and displayed in the marking image editor.


6.   If required, change the parameters in the graphic object settings and laser settings.
     Refer to “2-2 Create a marking file (offline mode)” (P.23).


7.   Perform the test marking.
     Refer to “2-8 Start laser radiation for marking” (P.32).


                                                                                             45

---

## หน้า 46

Panasonic Industrial Devices SUNX Co., Ltd.
https://panasonic.net/id/pidsx/global
Please visit our website for inquiries and about our sales network.

                      © Panasonic Industrial Devices SUNX Co., Ltd. 2020 - 2023
November, 2023

---
