# LP-RF200P_Alarm_List

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\Laser_Mark\LP-RF200P_Alarm_List.pdf` |
| **จำนวนหน้า** | 13 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---
## หน้า 1

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

## หน้า 2

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

## หน้า 3

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

## หน้า 4

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

## หน้า 5

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

## หน้า 6

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

## หน้า 7

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

## หน้า 8

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

## หน้า 9

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

## หน้า 10

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

## หน้า 11

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

## หน้า 12

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

## หน้า 13

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
