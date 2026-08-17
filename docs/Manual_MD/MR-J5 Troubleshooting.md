# MR-J5 Troubleshooting

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\MR-J5 Troubleshooting.pdf` |
| **จำนวนหน้า** | 268 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---
## หน้า 1

Mitsubishi Electric AC Servo System


MR-J5
User's Manual
(Troubleshooting)

-MR-J5-_G_
-MR-J5W_-_G_
-MR-J5D_-_G_
-MR-J5-_G_-_N1
-MR-J5W_-_G-_N1
-MR-J5D_-_G_-_N1
-MR-J5-_B_
-MR-J5W_-_B_
-MR-J5-_A_

---

## หน้า 2

_(หน้านี้ไม่มีข้อความ — เป็นรูปภาพ/ไดอะแกรมล้วน)_

---

## หน้า 3

SAFETY INSTRUCTIONS
Please read the instructions carefully before using the equipment.
To use the equipment correctly, do not attempt to install, operate, maintain, or inspect the equipment until you have read
through this manual, installation guide, and appended documents carefully. Do not use the equipment until you have a full
knowledge of the equipment, safety information and instructions.
In this manual, the safety instruction levels are classified into "WARNING" and "CAUTION".

                                  Indicates that incorrect handling may cause hazardous conditions, resulting in
        WARNING                   death or severe injury.

                                  Indicates that incorrect handling may cause hazardous conditions, resulting in
        CAUTION                   medium or slight injury.

Note that the CAUTION level may lead to a serious consequence depending on conditions.
Please follow the instructions of both levels because they are important to personnel safety.
Forbidden actions and required actions are indicated by the following diagrammatic symbols.


        Indicates a forbidden action. For example, "No Fire" is indicated by              .

        Indicates a required action. For example, grounding is indicated by               .

In this manual, precautions for hazards that can lead to property damage, instructions for other functions, and other
information are shown separately in the "Point" area.
After reading this manual, keep it accessible to the operator.


                                                                                                                             1

---

## หน้า 4

[Installation/wiring]
        WARNING
    ● To prevent an electric shock, turn off the power and wait for 15 minutes or more (20 minutes or more
      for the converter unit and drive unit) before starting wiring and/or inspection.
    ● To prevent an electric shock, ground the servo amplifier.
    ● To prevent an electric shock, any person who is involved in wiring should be fully competent to do the
      work.
    ● To prevent an electric shock, mount the servo amplifier before wiring.
    ● To prevent an electric shock, connect the protective earth (PE) terminal of the servo amplifier to the
      protective earth (PE) terminal of the cabinet, then connect the grounding lead wire to the ground.
    ● To prevent an electric shock, do not touch the conductive parts.


    [Setting/adjustment]
        WARNING
    ● To prevent an electric shock, do not operate the switches with wet hands.


    [Operation]
        WARNING
    ● To prevent an electric shock, do not operate the switches with wet hands.


    [Maintenance]
        WARNING
    ● To prevent an electric shock, any person who is involved in inspection should be fully competent to do
      the work.
    ● To prevent an electric shock, do not operate the switches with wet hands.


2

---

## หน้า 5

ABOUT THE MANUAL

                e-Manuals are Mitsubishi Electric FA electronic book manuals that can be browsed with a dedicated tool.
                e-Manuals enable the following:
                 • Searching for desired information in multiple manuals at the same time (manual cross searching)
                 • Jumping from a link in a manual to another manual for reference
                 • Browsing for hardware specifications by scrolling over the components shown in product illustrations
                 • Bookmarking frequently referenced information
                 • Copying sample programs to engineering software

If using the servo for the first time, prepare and use the following related manuals to ensure that the servo is used safely. For
the related manuals, refer to the User's Manual (Introduction).


 Introduction


                                                                               This manual is necessary primarily for installing, wiring, and
                                                  Rotary Servo Motor           using options.
                 Hardware                         Linear Servo Motor
                                                  Direct Drive Motor


                                                  Partner Encoder


                                                                               The manual is necessary for operation of servo amplifiers.
                 Function                                                      For the usage of each function, refer to this manual.


                 Communication Function                                        The manual is necessary for using communication functions.


                 Adjustment                                                    The manual is necessary for adjustment of operation status.


                                                                               The manual is necessary for specifying the causes of alarms
                 Troubleshooting
                                                                               and warnings.


                                                  Parameters                   It describes the parameters of the servo amplifier.


                                                  Object Dictionary            It describes the objects for the servo amplifier.


This manual covers the following servo amplifiers.
• MR-J5-_G_/MR-J5W_-_G_/MR-J5D_-_G_/MR-J5-_B_/MR-J5W_-_B_/MR-J5-_A_
In this manual, the servo amplifier names are abbreviated as shown below.
 Abbreviation                 Servo amplifier
 [G]                          MR-J5-_G_/MR-J5W_-_G_/MR-J5D_-_G_
 [B]                          MR-J5-_B_/MR-J5W_-_B_
 [A]                          MR-J5-_A_

When reading this manual to use a drive unit, substitute "drive unit" for "servo amplifier".


                                                                                                                                                3

---

## หน้า 6

Global standards and regulations
    Compliance with the indicated global standards and regulations is current as of the release date of this manual. Some
    standards and regulations may have been modified or withdrawn.


    U.S. CUSTOMARY UNITS
    U.S. customary units are not shown in this manual. Convert the values if necessary according to the following table.
     Quantity                                 SI (metric) unit                          U.S. customary unit
     Mass                                     1 [kg]                                    2.2046 [lb]
     Length                                   1 [mm]                                    0.03937 [inch]
     Torque                                   1 [N•m]                                   141.6 [oz•inch]
     Moment of inertia                        1 [(× 10-4 kg•m2)]                        5.4675 [oz•inch2]
     Load (thrust load/axial load)            1 [N]                                     0.2248 [lbf]
     Temperature                              N [°C] × 9/5 + 32                         N [°F]


4

---

## หน้า 7

CONTENTS
SAFETY INSTRUCTIONS. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .1
ABOUT THE MANUAL . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .3
U.S. CUSTOMARY UNITS . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .4

CHAPTER 1                  SERVO AMPLIFIER TROUBLESHOOTING                                                                                                                        10
1.1      Outline . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
1.2      List of alarm No./warning No.. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 12


                                                                                                                                                                                           CONTENTS
         Explanation of the list . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 12
         List . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
1.3      Handling methods for alarms/warnings . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32
         [AL. 010_Undervoltage]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32
         [AL. 011_Switch setting error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34
         [AL. 012_Memory error 1 (RAM)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35
         [AL. 013_CPU error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 36
         [AL. 014_Control process error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 37
         [AL. 016_Encoder initial communication error 1]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 38
         [AL. 017_Board error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 41
         [AL. 019_Memory error 3] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 43
         [AL. 01A_Servo motor combination error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 44
         [AL. 01B_Protection coordination error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 47
         [AL. 01E_Encoder initial communication error 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 48
         [AL. 01F_Encoder initial communication error 3]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49
         [AL. 020_Encoder normal communication error 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50
         [AL. 021_Encoder normal communication error 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 52
         [AL. 024_Main circuit error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 54
         [AL. 025_Absolute position erased]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 55
         [AL. 027_Initial magnetic pole detection error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 58
         [AL. 028_Linear encoder error 2]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 60
         [AL. 02A_Linear encoder error 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 61
         [AL. 02B_Encoder counter error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62
         [AL. 030_Regenerative error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 63
         [AL. 031_Overspeed]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 65
         [AL. 032_Overcurrent] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 66
         [AL. 033_Overvoltage]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 68
         [AL. 034_SSCNET receive error 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 69
         [AL. 035_Command frequency error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 70
         [AL. 036_SSCNET receive error 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 71
         [AL. 037_Parameter error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 72
         [AL. 03A_Inrush current suppression circuit error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 73
         [AL. 03D_Driver communication parameter setting error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 74
         [AL. 03E_Operation mode error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 74
         [AL. 042_Servo control error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 75
         [AL. 045_Main circuit device overheat] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 78
         [AL. 046_Servo motor overheat] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 79
         [AL. 047_Cooling fan error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 81
         [AL. 050_Overload 1]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 82
         [AL. 051_Overload 2]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 84
         [AL. 052_Excessive error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 85


                                                                                                                                                                                           5

---

## หน้า 8

[AL. 054_Oscillation detection] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 87
    [AL. 056_Forced stop error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 88
    [AL. 061_Operation error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 89
    [AL. 063_STO timing error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 90
    [AL. 066_Encoder initial communication error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 91
    [AL. 067_Encoder normal communication error 1 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 92
    [AL. 068_STO diagnosis error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 93
    [AL. 069_Command error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 94
    [AL. 070_Load-side encoder initial communication error 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 96
    [AL. 071_Load-side encoder normal communication error 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 99
    [AL. 072_Load-side encoder normal communication error 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 101
    [AL. 076_Load-side encoder error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 102
    [AL. 082_Master-slave operation error 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 103
    [AL. 086_Network communication error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 104
    [AL. 088_Watchdog 1]/[AL. 888_Watchdog 1]/[AL. 88888_Watchdog 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 105
    [AL. 08A_Serial communication time-out error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 106
    [AL. 08E_Serial communication error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 107
    [AL. 08F_Two-digit alarm No. display alarm]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 108
    [AL. 090_Homing incomplete warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 110
    [AL. 091_Servo amplifier overheat warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 111
    [AL. 092_Battery cable disconnection warning]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 112
    [AL. 093_ABS data transfer warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 113
    [AL. 095_STO warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 114
    [AL. 096_Home position setting warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 115
    [AL. 098_Software position limit warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 116
    [AL. 099_Stroke limit warning]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 117
    [AL. 09B_Excessive error warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 119
    [AL. 09C_Converter warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 120
    [AL. 09E_Network warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 121
    [AL. 09F_Battery warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 123
    [AL. 0E0_Excessive regeneration warning]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 124
    [AL. 0E1_Overload warning 1]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 125
    [AL. 0E2_Servo motor overheat warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 127
    [AL. 0E3_Absolute position counter warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 128
    [AL. 0E4_Parameter warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 129
    [AL. 0E5_ABS time-out warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 130
    [AL. 0E6_Servo forced stop warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 131
    [AL. 0E7_Controller forced stop warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 132
    [AL. 0E8_Decreased cooling fan speed warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 133
    [AL. 0E9_Main circuit off warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 134
    [AL. 0EA_ABS servo-on warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 136
    [AL. 0EB_The other axis error warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 137
    [AL. 0EC_Overload warning 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 138
    [AL. 0ED_Output watt excess warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 139
    [AL. 0EF_Reverse-side stop warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 140
    [AL. 0F0_Tough drive warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 141
    [AL. 0F2_Drive recorder warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 142
    [AL. 0F3_Oscillation detection warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 143
    [AL. 0F4_Positioning warning]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 144
    [AL. 0F7_Machine diagnosis warning]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 145
    [AL. 0FE_Two-digit warning No. display warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 147


6

---

## หน้า 9

[AL. 118_Encoder diagnosis]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 149
[AL. 119_Memory error 4] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 150
[AL. 11A_Servo motor constant error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 152
[AL. 11B_Protection coordination connection error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 153
[AL. 130_Regenerative error 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 154
[AL. 139_Open-phase error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 155
[AL. 13D_Driver communication network setting error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 156
[AL. 168_STO function error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 157
[AL. 16A_Master-slave operation simultaneous stop error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 158


                                                                                                                                                                   CONTENTS
[AL. 17A_Load-side linear encoder error 1]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 159
[AL. 182_Driver communication error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 160
[AL. 188_Watchdog 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 161
[AL. 19D_IP address setting change warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 162
[AL. 19E_Network warning 2] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 163
[AL. 1BD_Driver communication warning]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 164
[AL. 1E9_Open-phase warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 165
[AL. 1EA_Master-slave operation simultaneous stop warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 166
[AL. 1F6_Manufacturer setting error]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 167
[AL. 1F8_Memory warning 1] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 168
[AL. 201 - 28F_Manufacturer setting error] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 169
[AL. 290 - 2FF_Manufacturer setting warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 170
[AL. 510_Voltage diagnosis error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 171
[AL. 512_Memory error 1 (RAM) (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 172
[AL. 514_Control process error (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 173
[AL. 515_Memory error 2 (ROM) (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 174
[AL. 516_Encoder initial communication error 1 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 175
[AL. 517_Board error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 176
[AL. 518_Synchronous control error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 177
[AL. 519_Memory error 3 (Flash-ROM) (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 178
[AL. 520_Encoder normal communication diagnosis error 1 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 179
[AL. 521_Encoder normal communication diagnosis error 2 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 180
[AL. 522_Encoder normal communication diagnosis error 3 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 181
[AL. 523_Encoder normal communication diagnosis error 4 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 182
[AL. 524_Encoder normal communication diagnosis error 5 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 183
[AL. 525_Encoder normal communication diagnosis error 6 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 184
[AL. 526_Encoder normal communication diagnosis error 7 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 185
[AL. 527_Encoder normal communication diagnosis error 8 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 186
[AL. 528_Encoder normal communication diagnosis error 9 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . 187
[AL. 529_Encoder data error (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 188
[AL. 52A_Position feedback error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 189
[AL. 52B_Encoder thermal error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 190
[AL. 537_Parameter setting range error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 191
[AL. 53A_Parameter verification error (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 192
[AL. 540_Internal diagnosis error 1 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 193
[AL. 541_Internal diagnosis error 2 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 194
[AL. 542_Internal diagnosis error 3 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 195
[AL. 543_Internal diagnosis error 4 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 196
[AL. 544_Temperature diagnosis error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 197
[AL. 545_Internal diagnosis error 5 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 198
[AL. 546_Internal diagnosis error 6 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 199
[AL. 547_Internal diagnosis error 7 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 200


                                                                                                                                                                   7

---

## หน้า 10

[AL. 549_Internal diagnosis error 8 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 201
          [AL. 54A_Internal diagnosis error 9 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 202
          [AL. 54D_Internal diagnosis error 10 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 203
          [AL. 54F_Safety software error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 204
          [AL. 550_Internal diagnosis error 11 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 205
          [AL. 551_Internal diagnosis error 12 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 206
          [AL. 552_Internal diagnosis error 13 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 207
          [AL. 553_Input device diagnosis error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 208
          [AL. 554_Input device internal diagnosis error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 209
          [AL. 555_Output device diagnosis error 1 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 210
          [AL. 556_Output device diagnosis error 2 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 211
          [AL. 557_Input device mismatch detection (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 212
          [AL. 560_Stop error (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 214
          [AL. 561_Safety speed monitor error 1 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 216
          [AL. 562_Safety speed monitor error 2 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 218
          [AL. 563_Deceleration monitor error (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 220
          [AL. 564_Increment monitor error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 222
          [AL. 565_Direction monitor error (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 223
          [AL. 568_Torque monitor error 1 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 225
          [AL. 569_Torque monitor error 2 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 227
          [AL. 580_Safety communication setting error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 229
          [AL. 581_Safety communication error 1 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 230
          [AL. 582_Safety communication error 2 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 232
          [AL. 583_Safety communication error 3 (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 233
          [AL. 584_FSoE communication setting error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 234
          [AL. 585_FSoE communication error 1 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 235
          [AL. 586_FSoE communication error 2 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 237
          [AL. 587_FSoE communication error 3 (safety sub-function)]. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 239
          [AL. 595_STO command off warning (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 241
          [AL. 596_SS1 time-out warning (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 242
          [AL. 59D_Internal diagnosis error (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 243
          [AL. 5E0_Safety input device fixing diagnosis incomplete warning] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 244
          [AL. 5E1_Test mode setting mismatch warning (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 245
          [AL. 5E2_Safety communication warning (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 246
          [AL. 5E6_SS1 command off warning (safety sub-function)] . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 247
    1.4   Trouble which does not trigger an alarm/warning . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 248
          The display shows "A" (unconnected to the controller) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 248
          The display shows "r##" . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 248
          The display shows "b##" . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 249
          The display shows "TST". . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 249
          The display shows "off" . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 249
          The display is off . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 249
          The servo motor does not operate . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 250
          The increase in the servo motor speed is insufficient or excessive. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 252
          Vibration of servo motor at low frequency . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 252
          There is an unusual noise in the servo motor . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 253
          The servo motor vibrates. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 253
          Poor speed accuracy (Unstable speed of servo motor) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 254
          The machine vibrates unsteadily when it stops . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 254
          Overshoot/undershoot occurs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 254
          The servo motor starts moving immediately after the power-on of the servo amplifier or servo-on . . . . . . . . . 255


8

---

## หน้า 11

The home position deviates at the homing . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 255
          The position deviates during operation after the homing. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 256
          A position mismatch occurs at power restoration in an absolute position detection system . . . . . . . . . . . . . . . 257
          Communication with the servo amplifier fails using MR Configurator2 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 257
          Electromagnetic brake went out . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 258
          Electromagnetic brake cannot be released . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 258
          The vertical axis falls when the SBC output is used . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 258
          Coasting distance of the servo motor became longer . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 258
          Executed point table does not work. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 259


                                                                                                                                                                         CONTENTS
          RS-422 communication (Mitsubishi Electric AC servo protocol) cannot be used . . . . . . . . . . . . . . . . . . . . . . . 259
1.5       Two-digit display of alarm/warning number . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 260
REVISIONS . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .262
WARRANTY . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .263
TRADEMARKS . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .264


                                                                                                                                                                         9

---

## หน้า 12

1             SERVO AMPLIFIER TROUBLESHOOTING
       Precautions
     • In the MR-J5 series, the alarm No. and warning No. are shown with three digits, followed by one digit indicating the detail
       No. This has changed since the MR-J4 series, in which these numbers were shown with two digits and one digit,
       respectively.


     1.1               Outline
     If an error occurs in the servo system, the corresponding alarm or warning is displayed. When an alarm occurs, ALM
     (Malfunction) turns off.
     If an alarm or warning is displayed, take appropriate measures according to the following:
     Page 32 Handling methods for alarms/warnings


     Restrictions
     • The following alarms are not recorded in the alarm history.
     [AL. 010.1 Voltage drop in the control circuit power]
     [AL. 037 Parameter error]
     [AL. 537 Parameter setting range error (safety sub-function)]
     [AL. 53A Parameter verification error (safety sub-function)]
     • With the exception of [AL. 0F0 Tough drive warning], warnings are not recorded in the alarm history.
     • Alarms marked with "" in the "Alarm deactivation" column have the deactivation conditions shown in the following table.
      Detail No.                 Alarm deactivation condition
      030.1                      Approximately 30 minutes of cooling time have passed since the cause of the alarm occurrence was removed.
      042.1                      Set the servo parameters as follows.
                                 When in fully closed loop control: Set [Pr. PE03.3 Fully closed loop control error - Reset selection] to "1".
      042.2
                                 When a linear servo motor or a direct drive motor is used: Set [Pr. PL04.3 [AL. 042 Servo control error] detection controller
      042.3                      reset condition selection] to "1".
      042.8
      042.9
      042.A
      046.1                      Approximately 30 minutes of cooling time have passed since the cause of the alarm occurrence was removed.
      046.2
      046.3
      046.4
      046.5
      046.6
      050.1
      050.2
      050.3
      050.4
      050.5
      050.6
      051.1
      051.2
      130.1


          1 SERVO AMPLIFIER TROUBLESHOOTING
10        1.1 Outline

---

## หน้า 13

Precautions
• As soon as an alarm occurs, switch to servo-off status and shut off the main circuit power supply.                                 1
• If an abnormality related to overheating occurs, remove the cause of the abnormality and allow a cooling time of
  approximately 30 minutes.
• The alarm canceling method in [AL. 042 Servo control error] can be changed with [Pr. PL04.3 [AL. 042 Servo control error]
  detection controller reset condition selection] or [Pr. PE03.3 Fully closed loop control error - Reset selection].
• If an alarm which is related to the communication with the controller occurs, resetting the communication may not cancel
  the alarm.
• In the alarm list, alarms marked with "○" in the "Safety reset" column must be canceled while all the safety sub-functions
  have stopped. These alarms cannot be canceled unless all the safety sub-functions have stopped.
• After performing the check/action, cycle the power of the servo amplifier.
• If the alarm remains active even after the check/action of each alarm, the servo amplifier may have malfunctioned. Replace
  the servo amplifier, then check the repeatability.
• If the same problem continues even after replacing the servo amplifier, there may be a problem with the surrounding
  environment or with other devices.
• When [AL. 025 Absolute position erased] occurs, perform homing again to prevent an unexpected operation.
• To prevent malfunctions of the servo amplifier and servo motor, do not deactivate the alarm repeatedly to resume if any of
  the following alarms occur. Remove the cause of occurrence and allow 30 minutes or more for cooling, then resume the
  operation.
[AL. 030 Regenerative error]
[AL. 045 Main circuit device overheat]
[AL. 046 Servo motor overheat]
[AL. 050 Overload 1]
[AL. 051 Overload 2]
• To prevent malfunctions of the servo amplifier and servo motor, do not cycle the power of the servo amplifier repeatedly to
  resume if any of the following warnings occur. If the power of the servo amplifier is switched off/on during the warnings,
  allow more than 30 minutes for cooling before resuming operation.
[AL. 091 Servo amplifier overheat warning]
[AL. 0E0 Excessive regeneration warning]
[AL. 0E1 Overload warning 1]
• When [AL. 0E6 Servo forced stop warning], [AL. 0E9 Main circuit off warning], [AL. 0EA ABS servo-on warning], or [AL.
  0EB The other axis error warning] occurs, the servo amplifier is changed to servo-off status. If any other warning occurs,
  the operation can still be continued, but an alarm may occur.


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                                          1.1 Outline           11

---

## หน้า 14

1.2             List of alarm No./warning No.
     Explanation of the list

     Motor stop method
     Alarms and warnings which have "SD" in the "Motor stop method" column stop the servo motor with the dynamic brake after
     forced stop deceleration. Alarms and warnings which have "DB" or "EDB" in the "Motor stop method" column stop the servo
     motor with the dynamic brake.

     ■Stop method at occurrence of alarms/warnings
     The servo amplifier has the following stop methods:
     Motor stop method        Description
     DB                       Dynamic brake stop (for a servo amplifier without dynamic brake, the servo motor coasts)
     SD                       Forced stop deceleration
                              This stop method is applicable when [Pr. PA04 Function selection A-1] is set to the initial value. The stop method can be
                              changed from SD to DB with [Pr. PA04].
     EDB                      Stop with an electronic dynamic brake (enabled only for specific servo motors)
                              Refer to "Stop method at occurrence of alarms/warnings" in the following manual for the specific servo motors.
                              MR-J5 User's Manual (Function)
     STO/DB                   Dynamic brake stop by the STO function (for a servo amplifier without dynamic brake, the servo motor coasts)
     SS1/SD                   Forced stop deceleration by the SS1 function
                              The stop method is applicable when [Pr. PA04] is set to the initial value. The stop method can be changed from SS1/SD to
                              SS1/DB with [Pr. PA04].
     SS1/EDB                  Stop with an electronic dynamic brake (enabled only for specific servo motors)
                              Refer to "Stop method at occurrence of alarms/warnings" in the following manual for the specific servo motors.
                              MR-J5 User's Manual (Function)
                              The stop method of SS1/DB is applicable to servo motors other than the said specific servo motors.


     ■Specific stop methods
     Quick stop or slow stop can be selected with [Pr. PD30 Function selection D-1] if the MR-J5-_A_ is used.


           1 SERVO AMPLIFIER TROUBLESHOOTING
12         1.2 List of alarm No./warning No.

---

## หน้า 15

Converter main circuit stop target
If alarms and warnings have "○" in the "Converter main circuit stop target" column occur, the main circuit power supply of the
                                                                                                                                        1
converter unit connected with a protection coordination cable is shut off. During servo-on in the drive unit connected with a
protection coordination cable, [AL. 01B Protection coordination error] occurs and the servo motor stops with the dynamic
brake.


Alarm deactivation

                 When using servo motors with functional safety, executing software reset may trigger [AL. 016 Encoder initial
                 communication error 1]. If [AL. 016] occurs, cycle the power.

After the cause of the alarm has been removed, the alarm can be deactivated by using the methods marked with "" in the
"Alarm deactivation" column. Alarms marked with "" in the "Alarm deactivation" column have the deactivation conditions.
Page 10 Restrictions
Alarms are deactivated by alarm reset, communication reset, or power cycling. Alarms can also be deactivated by software
reset instead of power cycling.
Refer to "Alarm function" in the following manual.
MR-J5 User's Manual (Function)


Stop system
This stop system is applicable for the MR-J5W_, MR-J5D2_, and MR-J5D3_.
This indicates which axis to stop when an alarm or a warning occurs.
Each axis: Only the axis where the alarm or warning occurred will stop.
All axes: All axes will stop.


Motor stop warning
Warnings that have "" in the "Motor stop warning" column stop the servo motor when the warning occurs. If a warning that
stops the servo motor occurs, WNGSTOP (Motor stop warning) will turn on.


Safety sub-function stopped
Indicates that the safety sub-function stops when the alarm or warning occurs, disabling input to the safety sub-function and
maintaining the shut-off state of the power supply. "SFTY" on the servo amplifier display turns off when the safety sub-function
stops.
: The safety sub-function stops and "SFTY" turns off.
: The safety sub-function does not stop.


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                          1.2 List of alarm No./warning No.        13

---

## หน้า 16

List
     No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     010      010.1    Alarm     EDB      All axes                                                               
              010.2    Alarm     SD       All axes                                                               
     011      011.1    Alarm     DB       All axes                                                               
              011.2    Alarm     DB       All axes                                                               
     012      012.1    Alarm     DB       All axes                                                               
              012.2    Alarm     DB       All axes                                                               
              012.4    Alarm     DB       All axes                                                               
              012.5    Alarm     DB       All axes                                                               
              012.6    Alarm     DB       All axes                                                               
              012.7    Alarm     DB       All axes                                                               
              012.8    Alarm     DB       All axes                                                               
              012.9    Alarm     DB       All axes                                                               
     013      013.1    Alarm     DB       All axes                                                               
              013.2    Alarm     DB       All axes                                                               
              013.4    Alarm     DB       All axes                                                               
              013.5    Alarm     DB       All axes                                                               
     014      014.1    Alarm     DB       All axes                                                               
              014.2    Alarm     DB       All axes                                                               
              014.3    Alarm     DB       All axes                                                               
              014.4    Alarm     DB       All axes                                                               
              014.5    Alarm     DB       All axes                                                               
              014.8    Alarm     DB       All axes                                                               
              014.9    Alarm     DB       All axes                                                               
              014.C    Alarm     DB       All axes                                                               
     016      016.1    Alarm     DB       Each axis                                                              
              016.2    Alarm     DB       Each axis                                                              
              016.3    Alarm     DB       Each axis                                                              
              016.5    Alarm     DB       Each axis                                                              
              016.6    Alarm     DB       Each axis                                                              
              016.7    Alarm     DB       Each axis                                                              
              016.A    Alarm     DB       Each axis                                                              
              016.B    Alarm     DB       Each axis                                                              
              016.C    Alarm     DB       Each axis                                                              
              016.D    Alarm     DB       Each axis                                                              
              016.E    Alarm     DB       Each axis                                                              
              016.F    Alarm     DB       Each axis                                                              
     017      017.1    Alarm     DB       All axes                                                               
              017.3    Alarm     DB       All axes                                                               
              017.4    Alarm     DB       All axes                                                               
              017.5    Alarm     DB       All axes                                                               
              017.6    Alarm     DB       All axes                                                               
              017.7    Alarm     DB       All axes                                                               
              017.9    Alarm     DB       All axes                                                               
              017.A    Alarm     DB       All axes                                                               


           1 SERVO AMPLIFIER TROUBLESHOOTING
14         1.2 List of alarm No./warning No.

---

## หน้า 17

No.   Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                            Motor     Safety
      No.      Warning   stop     system      main        Safety   Alarm    Communication     Power     stop      sub-
                         method               circuit                                                   warning   function
                                              stop
                                                          reset    reset    reset             cycling
                                                                                                                  stopped         1
                                              target
019   019.1    Alarm     DB       All axes                                                                  
      019.2    Alarm     DB       All axes                                                                  
      019.3    Alarm     DB       All axes                                                                  
      019.6    Alarm     DB       All axes                                                                  
01A   01A.1    Alarm     DB       Each axis                                                                 
      01A.2    Alarm     DB       Each axis                                                                 
      01A.3    Alarm     DB       Each axis                                                                 
      01A.4    Alarm     DB       Each axis                                                                 
      01A.5    Alarm     DB       Each axis                                                                 
      01A.6    Alarm     DB       Each axis                                                                 
01B   01B.1    Alarm     DB       All axes                                                                  
      01B.4    Alarm     DB       All axes                                                                  
01E   01E.1    Alarm     DB       Each axis                                                                 
      01E.2    Alarm     DB       Each axis                                                                 
01F   01F.1    Alarm     DB       Each axis                                                                 
      01F.2    Alarm     DB       Each axis                                                                 
020   020.1    Alarm     EDB      Each axis                                                                 
      020.2    Alarm     EDB      Each axis                                                                 
      020.3    Alarm     EDB      Each axis                                                                 
      020.5    Alarm     EDB      Each axis                                                                 
      020.6    Alarm     EDB      Each axis                                                                 
      020.7    Alarm     EDB      Each axis                                                                 
      020.C    Alarm     EDB      Each axis                                                                 
      020.D    Alarm     EDB      Each axis                                                                 
021   021.1    Alarm     EDB      Each axis                                                                 
      021.2    Alarm     EDB      Each axis                                                                 
      021.3    Alarm     EDB      Each axis                                                                 
      021.4    Alarm     EDB      Each axis                                                                 
      021.5    Alarm     EDB      Each axis                                                                 
      021.6    Alarm     EDB      Each axis                                                                 
024   024.1    Alarm     DB       All axes                                                                  
      024.2    Alarm     DB       All axes                                                                  
025   025.1    Alarm     DB       Each axis                                                                 
      025.2    Alarm     DB       Each axis                                                                 
027   027.1    Alarm     DB       Each axis                                                                 
      027.2    Alarm     DB       Each axis                                                                 
      027.3    Alarm     DB       Each axis                                                                 
      027.4    Alarm     DB       Each axis                                                                 
      027.5    Alarm     DB       Each axis                                                                 
      027.6    Alarm     DB       Each axis                                                                 
      027.7    Alarm     DB       Each axis                                                                 
028   028.1    Alarm     EDB      Each axis                                                                 
      028.2    Alarm     EDB      Each axis                                                                 


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.2 List of alarm No./warning No.        15

---

## หน้า 18

No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     02A      02A.1    Alarm     EDB      Each axis                                                              
              02A.2    Alarm     EDB      Each axis                                                              
              02A.3    Alarm     EDB      Each axis                                                              
              02A.4    Alarm     EDB      Each axis                                                              
              02A.5    Alarm     EDB      Each axis                                                              
              02A.6    Alarm     EDB      Each axis                                                              
              02A.7    Alarm     EDB      Each axis                                                              
              02A.8    Alarm     EDB      Each axis                                                              
     02B      02B.1    Alarm     EDB      Each axis                                                              
              02B.2    Alarm     EDB      Each axis                                                              
     030      030.1    Alarm     DB       All axes                                                               
              030.2    Alarm     DB       All axes                                                               
              030.3    Alarm     DB       All axes                                                               
     031      031.1    Alarm     SD       Each axis                                                              
     032      032.1    Alarm     DB       All axes                                                               
              032.2    Alarm     DB       All axes                                                               
              032.3    Alarm     DB       All axes                                                               
              032.4    Alarm     DB       All axes                                                               
     033      033.1    Alarm     EDB      All axes                                                               
     034      034.1    Alarm     SD       All axes                                                               
              034.2    Alarm     SD       All axes                                                               
              034.3    Alarm     SD       Each axis                                                              
              034.4    Alarm     SD       All axes                                                               
              034.7    Alarm     SD       All axes                                                               
     035      035.1    Alarm     SD       Each axis                                                              
     036      036.1    Alarm     SD       Each axis                                                              
     037      037.1    Alarm     DB       Each axis                                                              
              037.2    Alarm     DB       All axes                                                               
              037.3    Alarm     DB       Each axis                                                              
              037.6    Alarm     DB       Each axis                                                              
              037.7    Alarm     DB       Each axis                                                              
     03A      03A.1    Alarm     EDB      All axes                                                               
     03D      03D.1    Alarm     DB       Each axis                                                              
              03D.2    Alarm     DB       Each axis                                                              
     03E      03E.4    Alarm     DB       Each axis                                                              
              03E.5    Alarm     DB       Each axis                                                              
     03E      03E.9    Alarm     DB       Each axis                                                              
     042      042.1    Alarm     EDB      Each axis                                                              
              042.2    Alarm     EDB      Each axis                                                              
              042.3    Alarm     EDB      Each axis                                                              
              042.8    Alarm     EDB      Each axis                                                              
              042.9    Alarm     EDB      Each axis                                                              
              042.A    Alarm     EDB      Each axis                                                              
     045      045.1    Alarm     EDB      All axes                                                               
              045.2    Alarm     EDB      All axes                                                               


           1 SERVO AMPLIFIER TROUBLESHOOTING
16         1.2 List of alarm No./warning No.

---

## หน้า 19

No.   Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                            Motor     Safety
      No.      Warning   stop     system      main        Safety   Alarm    Communication     Power     stop      sub-
                         method               circuit                                                   warning   function
                                              stop
                                                          reset    reset    reset             cycling
                                                                                                                  stopped         1
                                              target
046   046.1    Alarm     SD       Each axis                                                                 
      046.2    Alarm     SD       Each axis                                                                 
      046.3    Alarm     SD       Each axis                                                                 
      046.4    Alarm     SD       Each axis                                                                 
      046.5    Alarm     DB       Each axis                                                                 
      046.6    Alarm     DB       Each axis                                                                 
      046.7    Alarm     DB       Each axis                                                                 
047   047.1    Alarm     SD       All axes                                                                  
      047.2    Alarm     SD       All axes                                                                  
050   050.1    Alarm     SD       Each axis                                                                 
      050.2    Alarm     SD       Each axis                                                                 
      050.3    Alarm     SD       Each axis                                                                 
      050.4    Alarm     SD       Each axis                                                                 
      050.5    Alarm     SD       Each axis                                                                 
      050.6    Alarm     SD       Each axis                                                                 
051   051.1    Alarm     DB       Each axis                                                                 
      051.2    Alarm     DB       Each axis                                                                 
052   052.1    Alarm     SD       Each axis                                                                 
      052.3    Alarm     SD       Each axis                                                                 
      052.4    Alarm     SD       Each axis                                                                 
      052.5    Alarm     EDB      Each axis                                                                 
      052.6    Alarm     SD       Each axis                                                                 
054   054.1    Alarm     EDB      Each axis                                                                 
056   056.2    Alarm     EDB      Each axis                                                                 
      056.3    Alarm     EDB      Each axis                                                                 
      056.5    Alarm     EDB      Each axis                                                                 
061   061.1    Alarm     DB       Each axis                                                                 
063   063.1    Alarm     DB       Each axis                                                                 
      063.2    Alarm     DB       Each axis                                                                 
066   066.1    Alarm     DB       Each axis                                                                 
      066.2    Alarm     DB       Each axis                                                                 
      066.3    Alarm     DB       Each axis                                                                 
      066.7    Alarm     DB       Each axis                                                                 
      066.9    Alarm     DB       Each axis                                                                 
067   067.1    Alarm     EDB      Each axis                                                                 
      067.2    Alarm     EDB      Each axis                                                                 
      067.3    Alarm     EDB      Each axis                                                                 
      067.4    Alarm     EDB      Each axis                                                                 
      067.7    Alarm     EDB      Each axis                                                                 
068   068.1    Alarm     DB       All axes                                                                  
069   069.1    Alarm     SD       Each axis                                                                 
      069.2    Alarm     SD       Each axis                                                                 
      069.3    Alarm     SD       Each axis                                                                 
      069.4    Alarm     SD       Each axis                                                                 
      069.5    Alarm     SD       Each axis                                                                 
      069.6    Alarm     SD       Each axis                                                                 


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.2 List of alarm No./warning No.        17

---

## หน้า 20

No.        Detail     Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
                No.        Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                     method               circuit     reset    reset   reset           cycling   warning   function
                                                          stop                                                             stopped
                                                          target
     070        070.1      Alarm     DB       Each axis                                                              
                070.2      Alarm     DB       Each axis                                                              
                070.3      Alarm     DB       Each axis                                                              
                070.5      Alarm     DB       Each axis                                                              
                070.6      Alarm     DB       Each axis                                                              
                070.7      Alarm     DB       Each axis                                                              
                070.A      Alarm     DB       Each axis                                                              
                070.B      Alarm     DB       Each axis                                                              
                070.C      Alarm     DB       Each axis                                                              
                070.D      Alarm     DB       Each axis                                                              
                070.E      Alarm     DB       Each axis                                                              
                070.F      Alarm     DB       Each axis                                                              
     071        071.1      Alarm     EDB      Each axis                                                              
                071.2      Alarm     EDB      Each axis                                                              
                071.3      Alarm     EDB      Each axis                                                              
                071.4      Alarm     EDB      Each axis                                                              
                071.5      Alarm     EDB      Each axis                                                              
                071.6      Alarm     EDB      Each axis                                                              
                071.7      Alarm     EDB      Each axis                                                              
                071.C      Alarm     EDB      Each axis                                                              
                071.D      Alarm     EDB      Each axis                                                              
     072        072.1      Alarm     EDB      Each axis                                                              
                072.2      Alarm     EDB      Each axis                                                              
                072.3      Alarm     EDB      Each axis                                                              
                072.4      Alarm     EDB      Each axis                                                              
                072.5      Alarm     EDB      Each axis                                                              
                072.6      Alarm     EDB      Each axis                                                              
     076        076.2      Alarm     DB       Each axis                                                              
                076.3      Alarm     DB       Each axis                                                              
     082        082.1      Alarm     EDB      Each axis                                                              
     086        086.1      Alarm     SD       All axes                                                               
                086.2      Alarm     SD       All axes                                                               
                086.3      Alarm     SD       All axes                                                               
                086.4      Alarm     SD       All axes                                                               
                086.5      Alarm     SD       All axes                                                               
                086.6      Alarm     SD       All axes                                                               
     088/888/   088.1/     Alarm     DB       All axes                                                               
     88888      088/888/
                88888
                088.2      Alarm     DB       All axes                                                               
                088.4      Alarm     DB       All axes                                                               
                088.8      Alarm     DB       All axes                                                               
     08A        08A.1      Alarm     SD       All axes                                                               
     08E        08E.1      Alarm     SD       All axes                                                               
                08E.2      Alarm     SD       All axes                                                               
                08E.3      Alarm     SD       All axes                                                               
                08E.4      Alarm     SD       All axes                                                               
                08E.5      Alarm     SD       All axes                                                               


           1 SERVO AMPLIFIER TROUBLESHOOTING
18         1.2 List of alarm No./warning No.

---

## หน้า 21

No.   Detail   Alarm/    Motor       Stop           Converter     Alarm deactivation                               Motor     Safety
      No.      Warning   stop        system         main          Safety     Alarm     Communication     Power     stop      sub-
                         method                     circuit                                                        warning   function
                                                    stop
                                                                  reset      reset     reset             cycling
                                                                                                                             stopped         1
                                                    target
08F   08F.1    Alarm     Refer to the alarm columns with alarm No. in 100s ([AL. 1_ _]).
      08F.2    Alarm     Refer to the alarm columns with alarm No. in 200s ([AL. 2_ _]).
      08F.3    Alarm     For manufacturer setting
      08F.4    Alarm     For manufacturer setting
      08F.5    Alarm     Refer to the alarm columns with alarm No. in 500s ([AL. 5_ _]).
      08F.6    Alarm     For manufacturer setting
      08F.7    Alarm     For manufacturer setting
      08F.8    Alarm     For manufacturer setting
      08F.9    Alarm     For manufacturer setting
      08F.A    Alarm     For manufacturer setting
      08F.B    Alarm     For manufacturer setting
      08F.C    Alarm     For manufacturer setting
      08F.D    Alarm     For manufacturer setting
      08F.E    Alarm     For manufacturer setting
      08F.F    Alarm     For manufacturer setting
090   090.1    Warning                                                                                               
      090.2    Warning                                                                                               
      090.5    Warning                                                                                               
091   091.1    Warning                                                                                               
092   092.1    Warning                                                                                               
      092.2    Warning                                                                                               
      092.3    Warning                                                                                               
093   093.1    Warning                                                                                               
095   095.1    Warning   DB          Each axis                                                                         
      095.2    Warning   DB          Each axis                                                                         
096   096.1    Warning    *1                                                                                         
                             *1
      096.2    Warning                                                                                               
      096.3    Warning    *1                                                                                         
                             *1
      096.4    Warning                                                                                               
098   098.1    Warning   DB          Each axis                                                                         
      098.2    Warning   DB          Each axis                                                                         
099   099.1    Warning    *2                                                                                         
      099.2    Warning    *2                                                                                         
      099.4    Warning    *2                                                                                         
                             *2
      099.5    Warning                                                                                               
      099.6    Warning    *2                                                                                         
                             *2
      099.7    Warning                                                                                               
      099.8    Warning    *2                                                                                         
      099.9    Warning    *2                                                                                         
09B   09B.1    Warning                                                                                               
      09B.3    Warning                                                                                               
      09B.4    Warning                                                                                               
09C   09C.1    Warning                                                                                               


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                               1.2 List of alarm No./warning No.        19

---

## หน้า 22

No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     09E      09E.2    Warning   DB       All axes                                                               
              09E.3    Warning   DB       All axes                                                               
              09E.4    Warning   DB       All axes                                                               
              09E.5    Warning   DB       All axes                                                               
              09E.6    Warning   DB       All axes                                                               
              09E.7    Warning   DB       All axes                                                               
              09E.8    Warning   DB       All axes                                                               
              09E.9    Warning   DB       All axes                                                               
              09E.A    Warning   DB       All axes                                                               
              09E.B    Warning   DB       All axes                                                               
     09F      09F.1    Warning                                                                                 
              09F.2    Warning                                                                                 
     0E0      0E0.1    Warning                                                                                 
     0E1      0E1.1    Warning                                                                                 
              0E1.2    Warning                                                                                 
              0E1.3    Warning                                                                                 
              0E1.4    Warning                                                                                 
              0E1.5    Warning                                                                                 
              0E1.6    Warning                                                                                 
              0E1.7    Warning                                                                                 
              0E1.8    Warning                                                                                 
     0E2      0E2.1    Warning                                                                                 
              0E2.2    Warning                                                                                 
     0E3      0E3.1    Warning                                                                                 
              0E3.2    Warning                                                                                 
              0E3.5    Warning                                                                                 
              0E3.6    Warning                                                                                 
     0E4      0E4.1    Warning                                                                                 
     0E5      0E5.1    Warning                                                                                 
              0E5.2    Warning                                                                                 
              0E5.3    Warning                                                                                 
     0E6      0E6.1    Warning   SD       All axes                                                               
     0E7      0E7.1    Warning   SD       All axes                                                               
     0E8      0E8.1    Warning                                                                                 
              0E8.2    Warning                                                                                 
     0E9      0E9.1    Warning   DB       All axes                                                               
              0E9.2    Warning   DB       All axes                                                               
              0E9.3    Warning   DB       All axes                                                               
              0E9.4    Warning   DB       All axes                                                               
     0EA      0EA.1    Warning                                                                                 
     0EB      0EB.1    Warning   DB       Each axis                                                              
     0EC      0EC.1    Warning                                                                                 
     0ED      0ED.1    Warning                                                                                 
     0EF      0EF.1    Warning                                                                                 
     0F0      0F0.1    Warning                                                                                 
              0F0.3    Warning                                                                                 


           1 SERVO AMPLIFIER TROUBLESHOOTING
20         1.2 List of alarm No./warning No.

---

## หน้า 23

No.   Detail   Alarm/    Motor       Stop           Converter     Alarm deactivation                              Motor     Safety
      No.      Warning   stop        system         main          Safety    Alarm      Communication    Power     stop      sub-
                         method                     circuit                                                       warning   function
                                                    stop
                                                                  reset     reset      reset            cycling
                                                                                                                            stopped         1
                                                    target
0F2   0F2.1    Warning                                                                                              
      0F2.2    Warning                                                                                              
      0F2.3    Warning                                                                                              
      0F2.4    Warning                                                                                              
      0F2.5    Warning                                                                                              
      0F2.6    Warning                                                                                              
0F3   0F3.1    Warning                                                                                              
0F4   0F4.4    Warning                                                                                              
      0F4.6    Warning                                                                                              
      0F4.7    Warning                                                                                              
      0F4.8    Warning                                                                                              
      0F4.A    Warning                                                                                              
0F7   0F7.1    Warning                                                                                              
      0F7.2    Warning                                                                                              
      0F7.3    Warning                                                                                              
      0F7.4    Warning                                                                                              
      0F7.5    Warning                                                                                              
      0F7.6    Warning                                                                                              
0FE   0FE.1    Warning   Refer to the warning columns with warning No. in 100s ([AL. 1_ _]).
      0FE.2    Warning   Refer to the warning columns with warning No. in 200s ([AL. 2_ _]).
      0FE.3    Warning   For manufacturer setting
      0FE.4    Warning   For manufacturer setting
      0FE.5    Warning   Refer to the warning columns with warning No. in 500s ([AL. 5_ _]).
      0FE.6    Warning   For manufacturer setting
      0FE.7    Warning   For manufacturer setting
      0FE.8    Warning   For manufacturer setting
      0FE.9    Warning   For manufacturer setting
      0FE.A    Warning   For manufacturer setting
      0FE.B    Warning   For manufacturer setting
      0FE.C    Warning   For manufacturer setting
      0FE.D    Warning   For manufacturer setting
      0FE.E    Warning   For manufacturer setting
      0FE.F    Warning   For manufacturer setting
118   118.1    Alarm     DB          All axes                                                                         
119   119.1    Alarm     DB          All axes                                                                         
      119.2    Alarm     DB          All axes                                                                         
      119.3    Alarm     DB          All axes                                                                         
      119.4    Alarm     DB          All axes                                                                         
      119.5    Alarm     DB          All axes                                                                         
      119.6    Alarm     DB          All axes                                                                         
      119.7    Alarm     DB          All axes                                                                         
      119.8    Alarm     DB          All axes                                                                         
11A   11A.1    Alarm     DB          Each axis                                                                        
      11A.2    Alarm     DB          Each axis                                                                        
      11A.3    Alarm     DB          Each axis                                                                        
11B   11B.1    Alarm     DB          All axes                                                                         
130   130.1    Alarm     DB          All axes                                                                         


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                              1.2 List of alarm No./warning No.        21

---

## หน้า 24

No.        Detail   Alarm/    Motor       Stop           Converter   Alarm deactivation                         Motor     Safety
                No.      Warning   stop        system         main        Safety   Alarm   Communication   Power     stop      sub-
                                   method                     circuit     reset    reset   reset           cycling   warning   function
                                                              stop                                                             stopped
                                                              target
     139        139.1    Alarm     DB          All axes                                                                  
                139.2    Alarm     DB          Each axis                                                                 
                139.3    Alarm     DB          Each axis                                                                 
                139.4    Alarm     DB          Each axis                                                                 
     13D        13D.1    Alarm     DB          All axes                                                                  
                13D.2    Alarm     DB          All axes                                                                  
                13D.3    Alarm     DB          All axes                                                                  
     168        168.1    Alarm     DB          All axes                                                                  
     16A        16A.1    Alarm     DB          Each axis                                                                 
                16A.2    Alarm     DB          Each axis                                                                 
     17A        17A.1    Alarm     EDB         Each axis                                                                 
                17A.2    Alarm     EDB         Each axis                                                                 
                17A.3    Alarm     EDB         Each axis                                                                 
                17A.4    Alarm     EDB         Each axis                                                                 
                17A.5    Alarm     EDB         Each axis                                                                 
                17A.6    Alarm     EDB         Each axis                                                                 
                17A.7    Alarm     EDB         Each axis                                                                 
                17A.8    Alarm     EDB         Each axis                                                                 
     182        182.1    Alarm     DB          Each axis                                                                 
                182.2    Alarm     DB          Each axis                                                                 
     188        188.1    Alarm     DB          All axes                                                                  
     19D        19D.1    Warning                                                                                       
                19D.2    Warning                                                                                       
     19E        19E.1    Warning                                                                                       
                19E.2    Warning                                                                                       
                19E.3    Warning                                                                                       
                19E.4    Warning                                                                                       
                19E.5    Warning              Each axis                                                                 
                19E.6    Warning              Each axis                                                                 
     1BD        1BD.1    Warning   DB          All axes                                                                  
                1BD.2    Warning   DB          All axes                                                                  
                1BD.3    Warning   DB          All axes                                                                  
                1BD.4    Warning   DB          All axes                                                                  
     1E9        1E9.1    Warning                                                                                       
     1EA        1EA.1    Warning              Each axis                                                                 
                1EA.2    Warning              Each axis                                                                 
     1F6        1F6.1    Warning              Each axis                                                                 
                1F6.2    Warning              Each axis                                                                 
                1F6.3    Warning              Each axis                                                                 
                1F6.4    Warning              Each axis                                                                 
                1F6.5    Warning              Each axis                                                                 
                1F6.6    Warning              Each axis                                                                 
     1F8        1F8.1    Warning                                                                                       
                1F8.2    Warning                                                                                       
     201 -              Alarm     For manufacturer setting
     28F
     290 -              Warning   For manufacturer setting
     2FF


             1 SERVO AMPLIFIER TROUBLESHOOTING
22           1.2 List of alarm No./warning No.

---

## หน้า 25

No.   Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                            Motor     Safety
      No.      Warning   stop     system      main        Safety   Alarm    Communication     Power     stop      sub-
                         method               circuit                                                   warning   function
                                              stop
                                                          reset    reset    reset             cycling
                                                                                                                  stopped         1
                                              target
510   510.1    Alarm     STO/DB   All axes                                                                  
      510.2    Alarm     STO/DB   All axes                                                                  
      510.7    Alarm     STO/DB   All axes                                                                  
      510.9    Alarm     STO/DB   All axes                                                                  
      510.A    Alarm     STO/DB   All axes                                                                  
      510.B    Alarm     STO/DB   All axes                                                                  
      510.C    Alarm     STO/DB   All axes                                                                  
      510.D    Alarm     STO/DB   All axes                                                                  
      510.E    Alarm     STO/DB   All axes                                                                  
      510.F    Alarm     STO/DB   All axes                                                                  
512   512.2    Alarm     STO/DB   All axes                                                                  
      512.3    Alarm     STO/DB   All axes                                                                  
      512.A    Alarm     STO/DB   All axes                                                                  
      512.B    Alarm     STO/DB   All axes                                                                  
514   514.9    Alarm     STO/DB   All axes                                                                  
      514.A    Alarm     STO/DB   All axes                                                                  
515   515.9    Alarm     STO/DB   All axes                                                                  
      515.A    Alarm     STO/DB   All axes                                                                  
516   516.1    Alarm     STO/DB   Each axis                                                                 
      516.2    Alarm     STO/DB   Each axis                                                                 
      516.3    Alarm     STO/DB   Each axis                                                                 
      516.4    Alarm     STO/DB   Each axis                                                                 
      516.5    Alarm     STO/DB   Each axis                                                                 
      516.9    Alarm     STO/DB   Each axis                                                                 
      516.A    Alarm     STO/DB   Each axis                                                                 
      516.B    Alarm     STO/DB   Each axis                                                                 
      516.C    Alarm     STO/DB   Each axis                                                                 
      516.D    Alarm     STO/DB   Each axis                                                                 
517   517.2    Alarm     STO/DB   All axes                                                                  
      517.9    Alarm     STO/DB   All axes                                                                  
518   518.2    Alarm     STO/DB   All axes                                                                  
      518.A    Alarm     STO/DB   All axes                                                                  
519   519.2    Alarm     STO/DB   All axes                                                                  
      519.A    Alarm     STO/DB   All axes                                                                  
520   520.1    Alarm     STO/DB   Each axis                                                                 
      520.2    Alarm     STO/DB   Each axis                                                                 
      520.3    Alarm     STO/DB   Each axis                                                                 
      520.4    Alarm     STO/DB   Each axis                                                                 
      520.9    Alarm     STO/DB   Each axis                                                                 
      520.A    Alarm     STO/DB   Each axis                                                                 
      520.B    Alarm     STO/DB   Each axis                                                                 
      520.C    Alarm     STO/DB   Each axis                                                                 
521   521.1    Alarm     STO/DB   Each axis                                                                 
      521.2    Alarm     STO/DB   Each axis                                                                 
      521.3    Alarm     STO/DB   Each axis                                                                 
      521.9    Alarm     STO/DB   Each axis                                                                 
      521.A    Alarm     STO/DB   Each axis                                                                 
      521.B    Alarm     STO/DB   Each axis                                                                 


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.2 List of alarm No./warning No.        23

---

## หน้า 26

No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     522      522.1    Alarm     STO/DB   Each axis                                                              
              522.2    Alarm     STO/DB   Each axis                                                              
              522.3    Alarm     STO/DB   Each axis                                                              
              522.4    Alarm     STO/DB   Each axis                                                              
              522.9    Alarm     STO/DB   Each axis                                                              
              522.A    Alarm     STO/DB   Each axis                                                              
              522.B    Alarm     STO/DB   Each axis                                                              
              522.C    Alarm     STO/DB   Each axis                                                              
     523      523.1    Alarm     STO/DB   Each axis                                                              
              523.2    Alarm     STO/DB   Each axis                                                              
              523.3    Alarm     STO/DB   Each axis                                                              
              523.4    Alarm     STO/DB   Each axis                                                              
              523.9    Alarm     STO/DB   Each axis                                                              
              523.A    Alarm     STO/DB   Each axis                                                              
              523.B    Alarm     STO/DB   Each axis                                                              
              523.C    Alarm     STO/DB   Each axis                                                              
     524      524.1    Alarm     STO/DB   Each axis                                                              
              524.2    Alarm     STO/DB   Each axis                                                              
              524.3    Alarm     STO/DB   Each axis                                                              
              524.4    Alarm     STO/DB   Each axis                                                              
              524.9    Alarm     STO/DB   Each axis                                                              
              524.A    Alarm     STO/DB   Each axis                                                              
              524.B    Alarm     STO/DB   Each axis                                                              
              524.C    Alarm     STO/DB   Each axis                                                              
     525      525.1    Alarm     STO/DB   Each axis                                                              
              525.2    Alarm     STO/DB   Each axis                                                              
              525.3    Alarm     STO/DB   Each axis                                                              
              525.4    Alarm     STO/DB   Each axis                                                              
              525.9    Alarm     STO/DB   Each axis                                                              
              525.A    Alarm     STO/DB   Each axis                                                              
              525.B    Alarm     STO/DB   Each axis                                                              
              525.C    Alarm     STO/DB   Each axis                                                              
     526      526.1    Alarm     STO/DB   Each axis                                                              
              526.2    Alarm     STO/DB   Each axis                                                              
              526.3    Alarm     STO/DB   Each axis                                                              
              526.4    Alarm     STO/DB   Each axis                                                              
              526.9    Alarm     STO/DB   Each axis                                                              
              526.A    Alarm     STO/DB   Each axis                                                              
              526.B    Alarm     STO/DB   Each axis                                                              
              526.C    Alarm     STO/DB   Each axis                                                              
     527      527.1    Alarm     STO/DB   Each axis                                                              
              527.2    Alarm     STO/DB   Each axis                                                              
              527.3    Alarm     STO/DB   Each axis                                                              
              527.4    Alarm     STO/DB   Each axis                                                              
              527.9    Alarm     STO/DB   Each axis                                                              
              527.A    Alarm     STO/DB   Each axis                                                              
              527.B    Alarm     STO/DB   Each axis                                                              
              527.C    Alarm     STO/DB   Each axis                                                              


           1 SERVO AMPLIFIER TROUBLESHOOTING
24         1.2 List of alarm No./warning No.

---

## หน้า 27

No.   Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                            Motor     Safety
      No.      Warning   stop     system      main        Safety   Alarm    Communication     Power     stop      sub-
                         method               circuit                                                   warning   function
                                              stop
                                                          reset    reset    reset             cycling
                                                                                                                  stopped         1
                                              target
528   528.1    Alarm     STO/DB   Each axis                                                                 
      528.2    Alarm     STO/DB   Each axis                                                                 
      528.3    Alarm     STO/DB   Each axis                                                                 
      528.4    Alarm     STO/DB   Each axis                                                                 
      528.9    Alarm     STO/DB   Each axis                                                                 
      528.A    Alarm     STO/DB   Each axis                                                                 
      528.B    Alarm     STO/DB   Each axis                                                                 
      528.C    Alarm     STO/DB   Each axis                                                                 
529   529.1    Alarm     STO/DB   Each axis                                                                 
      529.9    Alarm     STO/DB   Each axis                                                                 
52A   52A.1    Alarm     STO/DB   Each axis                                                                 
      52A.9    Alarm     STO/DB   Each axis                                                                 
52B   52B.1    Alarm     STO/DB   Each axis                                                                 
      52B.9    Alarm     STO/DB   Each axis                                                                 
537   537.1    Alarm     STO/DB   Each axis                                                                 
      537.2    Alarm     STO/DB   Each axis                                                                 
      537.3    Alarm     STO/DB   Each axis                                                                 
      537.9    Alarm     STO/DB   Each axis                                                                 
      537.A    Alarm     STO/DB   Each axis                                                                 
53A   53A.2    Alarm     STO/DB   All axes                                                                  
      53A.A    Alarm     STO/DB   All axes                                                                  
540   540.1    Alarm     STO/DB   All axes                                                                  
      540.2    Alarm     STO/DB   All axes                                                                  
      540.3    Alarm     STO/DB   All axes                                                                  
      540.4    Alarm     STO/DB   All axes                                                                  
      540.9    Alarm     STO/DB   All axes                                                                  
      540.A    Alarm     STO/DB   All axes                                                                  
541   541.1    Alarm     STO/DB   All axes                                                                  
      541.2    Alarm     STO/DB   All axes                                                                  
      541.3    Alarm     STO/DB   All axes                                                                  
      541.4    Alarm     STO/DB   All axes                                                                  
      541.5    Alarm     STO/DB   All axes                                                                  
      541.9    Alarm     STO/DB   All axes                                                                  
      541.A    Alarm     STO/DB   All axes                                                                  
      541.B    Alarm     STO/DB   All axes                                                                  
      541.C    Alarm     STO/DB   All axes                                                                  
      541.D    Alarm     STO/DB   All axes                                                                  
542   542.1    Alarm     STO/DB   All axes                                                                  
      542.9    Alarm     STO/DB   All axes                                                                  
543   543.1    Alarm     STO/DB   All axes                                                                  
      543.2    Alarm     STO/DB   All axes                                                                  
      543.3    Alarm     STO/DB   All axes                                                                  
      543.9    Alarm     STO/DB   All axes                                                                  
      543.A    Alarm     STO/DB   All axes                                                                  
      543.B    Alarm     STO/DB   All axes                                                                  
      543.C    Alarm     STO/DB   All axes                                                                  
      543.D    Alarm     STO/DB   All axes                                                                  
      543.E    Alarm     STO/DB   All axes                                                                  


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.2 List of alarm No./warning No.        25

---

## หน้า 28

No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     544      544.1    Alarm     SS1/SD   All axes                                                               
              544.2    Alarm     SS1/SD   All axes                                                               
              544.9    Alarm     SS1/SD   All axes                                                               
              544.A    Alarm     SS1/SD   All axes                                                               
     545      545.2    Alarm     STO/DB   All axes                                                               
     546      546.1    Alarm     STO/DB   All axes                                                               
              546.2    Alarm     STO/DB   All axes                                                               
              546.9    Alarm     STO/DB   All axes                                                               
              546.A    Alarm     STO/DB   All axes                                                               
     547      547.1    Alarm     STO/DB   All axes                                                               
              547.2    Alarm     STO/DB   All axes                                                               
              547.9    Alarm     STO/DB   All axes                                                               
              547.A    Alarm     STO/DB   All axes                                                               
     549      549.1    Alarm     STO/DB   All axes                                                               
              549.9    Alarm     STO/DB   All axes                                                               
     54A      54A.1    Alarm     STO/DB   All axes                                                               
              54A.2    Alarm     STO/DB   All axes                                                               
              54A.3    Alarm     STO/DB   All axes                                                               
              54A.9    Alarm     STO/DB   All axes                                                               
              54A.A    Alarm     STO/DB   All axes                                                               
              54A.B    Alarm     STO/DB   All axes                                                               
     54D      54D.1    Alarm     STO/DB   All axes                                                               
              54D.2    Alarm     STO/DB   All axes                                                               
              54D.3    Alarm     STO/DB   All axes                                                               
              54D.4    Alarm     STO/DB   All axes                                                               
              54D.9    Alarm     STO/DB   All axes                                                               
     54F      54F.1    Alarm     STO/DB   All axes                                                               
     550      550.1    Alarm     STO/DB   Each axis                                                              
              550.2    Alarm     STO/DB   Each axis                                                              
              550.3    Alarm     STO/DB   Each axis                                                              
              550.4    Alarm     STO/DB   Each axis                                                              
              550.9    Alarm     STO/DB   Each axis                                                              
              550.A    Alarm     STO/DB   Each axis                                                              
              550.B    Alarm     STO/DB   Each axis                                                              
              550.C    Alarm     STO/DB   Each axis                                                              
     551      551.1    Alarm     STO/DB   Each axis                                                              
              551.2    Alarm     STO/DB   Each axis                                                              
              551.3    Alarm     STO/DB   Each axis                                                              
              551.4    Alarm     STO/DB   Each axis                                                              
              551.9    Alarm     STO/DB   Each axis                                                              
              551.A    Alarm     STO/DB   Each axis                                                              
              551.B    Alarm     STO/DB   Each axis                                                              
              551.C    Alarm     STO/DB   Each axis                                                              
     552      552.1    Alarm     STO/DB   Each axis                                                              
              552.9    Alarm     STO/DB   Each axis                                                              


           1 SERVO AMPLIFIER TROUBLESHOOTING
26         1.2 List of alarm No./warning No.

---

## หน้า 29

No.   Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                            Motor     Safety
      No.      Warning   stop     system      main        Safety   Alarm    Communication     Power     stop      sub-
                         method               circuit                                                   warning   function
                                              stop
                                                          reset    reset    reset             cycling
                                                                                                                  stopped         1
                                              target
553   553.1    Alarm     SS1/SD   All axes                                                                  
      553.2    Alarm     SS1/SD   All axes                                                                  
      553.3    Alarm     SS1/SD   All axes                                                                  
      553.9    Alarm     SS1/SD   All axes                                                                  
      553.A    Alarm     SS1/SD   All axes                                                                  
      553.B    Alarm     SS1/SD   All axes                                                                  
554   554.1    Alarm     SS1/SD   All axes                                                                  
      554.2    Alarm     SS1/SD   All axes                                                                  
      554.3    Alarm     SS1/SD   All axes                                                                  
      554.9    Alarm     SS1/SD   All axes                                                                  
      554.A    Alarm     SS1/SD   All axes                                                                  
      554.B    Alarm     SS1/SD   All axes                                                                  
555   555.1    Alarm     SS1/SD   All axes                                                                  
      555.2    Alarm     SS1/SD   All axes                                                                  
      555.3    Alarm     SS1/SD   All axes                                                                  
      555.9    Alarm     SS1/SD   All axes                                                                  
      555.A    Alarm     SS1/SD   All axes                                                                  
      555.B    Alarm     SS1/SD   All axes                                                                  
556   556.1    Alarm     SS1/SD   All axes                                                                  
      556.2    Alarm     SS1/SD   All axes                                                                  
      556.3    Alarm     SS1/SD   All axes                                                                  
      556.9    Alarm     SS1/SD   All axes                                                                  
      556.A    Alarm     SS1/SD   All axes                                                                  
      556.B    Alarm     SS1/SD   All axes                                                                  
557   557.1    Alarm     SS1/SD   All axes                                                                  
      557.2    Alarm     SS1/SD   All axes                                                                  
      557.3    Alarm     SS1/SD   All axes                                                                  
      557.9    Alarm     SS1/SD   All axes                                                                  
      557.A    Alarm     SS1/SD   All axes                                                                  
      557.B    Alarm     SS1/SD   All axes                                                                  
560   560.1    Alarm     STO/DB   Each axis                                                                 
      560.2    Alarm     STO/DB   Each axis                                                                 
      560.3    Alarm     STO/DB   Each axis                                                                 
      560.9    Alarm     STO/DB   Each axis                                                                 
      560.A    Alarm     STO/DB   Each axis                                                                 
      560.B    Alarm     STO/DB   Each axis                                                                 
561   561.1    Alarm     STO/DB   Each axis                                                                 
      561.2    Alarm     STO/DB   Each axis                                                                 
      561.3    Alarm     STO/DB   Each axis                                                                 
      561.4    Alarm     STO/DB   Each axis                                                                 
      561.9    Alarm     STO/DB   Each axis                                                                 
      561.A    Alarm     STO/DB   Each axis                                                                 
      561.B    Alarm     STO/DB   Each axis                                                                 
      561.C    Alarm     STO/DB   Each axis                                                                 


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.2 List of alarm No./warning No.        27

---

## หน้า 30

No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     562      562.1    Alarm     STO/DB   Each axis                                                              
              562.2    Alarm     STO/DB   Each axis                                                              
              562.3    Alarm     STO/DB   Each axis                                                              
              562.4    Alarm     STO/DB   Each axis                                                              
              562.9    Alarm     STO/DB   Each axis                                                              
              562.A    Alarm     STO/DB   Each axis                                                              
              562.B    Alarm     STO/DB   Each axis                                                              
              562.C    Alarm     STO/DB   Each axis                                                              
     563      563.1    Alarm     STO/DB   Each axis                                                              
              563.2    Alarm     STO/DB   Each axis                                                              
              563.3    Alarm     STO/DB   Each axis                                                              
              563.4    Alarm     STO/DB   Each axis                                                              
              563.9    Alarm     STO/DB   Each axis                                                              
              563.A    Alarm     STO/DB   Each axis                                                              
              563.B    Alarm     STO/DB   Each axis                                                              
              563.C    Alarm     STO/DB   Each axis                                                              
     564      564.1    Alarm     STO/DB   Each axis                                                              
              564.9    Alarm     STO/DB   Each axis                                                              
     565      565.1    Alarm     STO/DB   Each axis                                                              
              565.2    Alarm     STO/DB   Each axis                                                              
              565.3    Alarm     STO/DB   Each axis                                                              
              565.4    Alarm     STO/DB   Each axis                                                              
              565.9    Alarm     STO/DB   Each axis                                                              
              565.A    Alarm     STO/DB   Each axis                                                              
              565.B    Alarm     STO/DB   Each axis                                                              
              565.C    Alarm     STO/DB   Each axis                                                              
     568      568.1    Alarm     STO/DB   Each axis                                                              
              568.2    Alarm     STO/DB   Each axis                                                              
              568.3    Alarm     STO/DB   Each axis                                                              
              568.4    Alarm     STO/DB   Each axis                                                              
              568.9    Alarm     STO/DB   Each axis                                                              
              568.A    Alarm     STO/DB   Each axis                                                              
              568.B    Alarm     STO/DB   Each axis                                                              
              568.C    Alarm     STO/DB   Each axis                                                              
     569      569.1    Alarm     STO/DB   Each axis                                                              
              569.2    Alarm     STO/DB   Each axis                                                              
              569.3    Alarm     STO/DB   Each axis                                                              
              569.4    Alarm     STO/DB   Each axis                                                              
              569.9    Alarm     STO/DB   Each axis                                                              
              569.A    Alarm     STO/DB   Each axis                                                              
              569.B    Alarm     STO/DB   Each axis                                                              
              569.C    Alarm     STO/DB   Each axis                                                              
     580      580.3    Alarm     SS1/SD   All axes                                                               
              580.B    Alarm     SS1/SD   All axes                                                               


           1 SERVO AMPLIFIER TROUBLESHOOTING
28         1.2 List of alarm No./warning No.

---

## หน้า 31

No.   Detail   Alarm/    Motor    Stop       Converter   Alarm deactivation                            Motor     Safety
      No.      Warning   stop     system     main        Safety   Alarm    Communication     Power     stop      sub-
                         method              circuit                                                   warning   function
                                             stop
                                                         reset    reset    reset             cycling
                                                                                                                 stopped         1
                                             target
581   581.1    Alarm     SS1/SD   All axes                                                                 
      581.2    Alarm     SS1/SD   All axes                                                                 
      581.3    Alarm     SS1/SD   All axes                                                                 
      581.4    Alarm     SS1/SD   All axes                                                                 
      581.5    Alarm     SS1/SD   All axes                                                                 
      581.6    Alarm     SS1/SD   All axes                                                                 
      581.7    Alarm     SS1/SD   All axes                                                                 
      581.9    Alarm     SS1/SD   All axes                                                                 
      581.A    Alarm     SS1/SD   All axes                                                                 
      581.B    Alarm     SS1/SD   All axes                                                                 
      581.C    Alarm     SS1/SD   All axes                                                                 
      581.D    Alarm     SS1/SD   All axes                                                                 
      581.E    Alarm     SS1/SD   All axes                                                                 
      581.F    Alarm     SS1/SD   All axes                                                                 
582   582.1    Alarm     SS1/SD   All axes                                                                 
      582.2    Alarm     SS1/SD   All axes                                                                 
      582.3    Alarm     SS1/SD   All axes                                                                 
      582.4    Alarm     SS1/SD   All axes                                                                 
      582.5    Alarm     SS1/SD   All axes                                                                 
      582.6    Alarm     SS1/SD   All axes                                                                 
      582.7    Alarm     SS1/SD   All axes                                                                 
      582.9    Alarm     SS1/SD   All axes                                                                 
      582.A    Alarm     SS1/SD   All axes                                                                 
      582.B    Alarm     SS1/SD   All axes                                                                 
      582.C    Alarm     SS1/SD   All axes                                                                 
      582.D    Alarm     SS1/SD   All axes                                                                 
      582.E    Alarm     SS1/SD   All axes                                                                 
      582.F    Alarm     SS1/SD   All axes                                                                 
583   583.2    Alarm     SS1/SD   All axes                                                                 
      583.3    Alarm     SS1/SD   All axes                                                                 
      583.4    Alarm     SS1/SD   All axes                                                                 
      583.5    Alarm     SS1/SD   All axes                                                                 
      583.6    Alarm     SS1/SD   All axes                                                                 
      583.A    Alarm     SS1/SD   All axes                                                                 
      583.B    Alarm     SS1/SD   All axes                                                                 
      583.C    Alarm     SS1/SD   All axes                                                                 
      583.D    Alarm     SS1/SD   All axes                                                                 
      583.E    Alarm     SS1/SD   All axes                                                                 
584   584.1    Alarm     SS1/SD   All axes                                                                 
      584.2    Alarm     SS1/SD   All axes                                                                 
      584.3    Alarm     SS1/SD   All axes                                                                 
      584.4    Alarm     SS1/SD   All axes                                                                 
      584.5    Alarm     SS1/SD   All axes                                                                 
      584.9    Alarm     SS1/SD   All axes                                                                 
      584.A    Alarm     SS1/SD   All axes                                                                 
      584.B    Alarm     SS1/SD   All axes                                                                 
      584.C    Alarm     SS1/SD   All axes                                                                 
      584.D    Alarm     SS1/SD   All axes                                                                 


                                                                          1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.2 List of alarm No./warning No.        29

---

## หน้า 32

No.      Detail   Alarm/    Motor    Stop        Converter   Alarm deactivation                         Motor     Safety
              No.      Warning   stop     system      main        Safety   Alarm   Communication   Power     stop      sub-
                                 method               circuit     reset    reset   reset           cycling   warning   function
                                                      stop                                                             stopped
                                                      target
     585      585.1    Alarm     SS1/SD   All axes                                                               
              585.2    Alarm     SS1/SD   All axes                                                               
              585.3    Alarm     SS1/SD   All axes                                                               
              585.4    Alarm     SS1/SD   All axes                                                               
              585.9    Alarm     SS1/SD   All axes                                                               
              585.A    Alarm     SS1/SD   All axes                                                               
              585.B    Alarm     SS1/SD   All axes                                                               
              585.C    Alarm     SS1/SD   All axes                                                               
     586      586.1    Alarm     SS1/SD   All axes                                                               
              586.2    Alarm     SS1/SD   All axes                                                               
              586.3    Alarm     SS1/SD   All axes                                                               
              586.4    Alarm     SS1/SD   All axes                                                               
              586.5    Alarm     SS1/SD   All axes                                                               
              586.9    Alarm     SS1/SD   All axes                                                               
              586.A    Alarm     SS1/SD   All axes                                                               
              586.B    Alarm     SS1/SD   All axes                                                               
              586.C    Alarm     SS1/SD   All axes                                                               
              586.D    Alarm     SS1/SD   All axes                                                               
     587      587.1    Alarm     SS1/SD   All axes                                                               
              587.2    Alarm     SS1/SD   All axes                                                               
              587.3    Alarm     SS1/SD   All axes                                                               
              587.4    Alarm     SS1/SD   All axes                                                               
              587.5    Alarm     SS1/SD   All axes                                                               
              587.6    Alarm     SS1/SD   All axes                                                               
              587.7    Alarm     SS1/SD   All axes                                                               
              587.9    Alarm     SS1/SD   All axes                                                               
              587.A    Alarm     SS1/SD   All axes                                                               
              587.B    Alarm     SS1/SD   All axes                                                               
              587.C    Alarm     SS1/SD   All axes                                                               
              587.D    Alarm     SS1/SD   All axes                                                               
              587.E    Alarm     SS1/SD   All axes                                                               
              587.F    Alarm     SS1/SD   All axes                                                               
     595      595.1    Warning   STO/DB   Each axis                                                              
              595.9    Warning   STO/DB   Each axis                                                              
     596      596.1    Warning   STO/DB   Each axis                                                              
              596.9    Warning   STO/DB   Each axis                                                              
     59D      59D.1    Warning   STO/DB   All axes                                                               
              59D.3    Warning   STO/DB   All axes                                                               
              59D.6    Warning   STO/DB   All axes                                                               
              59D.9    Warning   STO/DB   All axes                                                               
              59D.B    Warning   STO/DB   All axes                                                               
              59D.E    Warning   STO/DB   All axes                                                               
     5E0      5E0.1    Warning   STO/DB   All axes                                                               
              5E0.2    Warning   STO/DB   All axes                                                               
              5E0.3    Warning   STO/DB   All axes                                                               
              5E0.7    Warning   STO/DB   All axes                                                               
              5E0.9    Warning   STO/DB   All axes                                                               
              5E0.A    Warning   STO/DB   All axes                                                               
              5E0.B    Warning   STO/DB   All axes                                                               
              5E0.F    Warning   STO/DB   All axes                                                               


           1 SERVO AMPLIFIER TROUBLESHOOTING
30         1.2 List of alarm No./warning No.

---

## หน้า 33

No.         Detail     Alarm/      Motor       Stop        Converter    Alarm deactivation                                Motor     Safety
            No.        Warning     stop        system      main         Safety    Alarm    Communication        Power     stop      sub-
                                   method                  circuit                                                        warning   function
                                                           stop
                                                                        reset     reset    reset                cycling
                                                                                                                                    stopped         1
                                                           target
5E1         5E1.1      Warning     STO/DB      Each axis                                                                      
            5E1.9      Warning     STO/DB      Each axis                                                                      
5E2         5E2.1      Warning     SS1/SD      All axes                                                                       
            5E2.2      Warning     SS1/SD      All axes                                                                       
            5E2.9      Warning     SS1/SD      All axes                                                                       
            5E2.A      Warning     SS1/SD      All axes                                                                       
5E6         5E6.1      Warning     SS1/SD      Each axis                                                                      
            5E6.9      Warning     SS1/SD      Each axis                                                                      

*1    Because the servo motor is stopped when this alarm is detected, there is no "Motor stop method".
*2    For details of "Motor stop method", refer to "Stop method at stroke limit detection" in the following manual.
      MR-J5 User's Manual (Function)


                                                                                          1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                                   1.2 List of alarm No./warning No.           31

---

## หน้า 34

1.3                 Handling methods for alarms/warnings
     Remove the cause of the alarm and warning in accordance with this section. MR Configurator2 can be referenced to find the
     causes of alarms and warnings.

     [AL. 010_Undervoltage]
     • The voltage of the control circuit power supply has dropped.
     • The voltage of the main circuit power supply has dropped.


     [AL. 010.1_Voltage drop in the control circuit power]
     Cause                                                                  Check/action method                                                                  Model
     1. Connection or wiring of the control circuit                         Check the connection and wiring of the control circuit power supply (screw           [G]
                                                                            tightening state on the power supply route, disconnected cables, and loose           [B]
           power supply is incorrect.
                                                                            connection of the servo amplifier connector).                                        [A]
                                                                            Refer to "Example power circuit connections" in the following manuals.
                                                                            MR-J5 User's Manual (Hardware)
                                                                            MR-J5D User's Manual (Hardware)

     2. The voltage of the control circuit power supply                     Check if the voltage of the control circuit power supply is equal to or lower than
                                                                            the specified value.
           is too low.
                                                                            200 V class: 160 V AC
                                                                            400 V class: 280 V AC

     3. The power was cycled before the internal                            After shutting off the servo amplifier power supply, make sure that the seven-
                                                                            segment LED of the servo amplifier is turned off, then cycle the power.
           control circuit power supply stopped.
     4. An instantaneous power failure lasted for                           Check if the power supply has a problem.
                                                                            After checking, cycle the power of the servo amplifier.
           longer than the specified time.
      • When [Pr. PA20.2 SEMI-F47 function selection] is set to "0"
        (disabled), the specified time is 60 ms.
      • When [Pr. PA20.2] is set to "1" (enabled), the value set in [Pr.
        PF25 SEMI-F47 function - Instantaneous power failure detection
        time (Instantaneous power failure tough drive detection time)] is
        the specified time.


           1 SERVO AMPLIFIER TROUBLESHOOTING
32         1.3 Handling methods for alarms/warnings

---

## หน้า 35

[AL. 010.2_Voltage drop in the main circuit power]
Cause                                                Check/action method                                                                Model        1
1. Connection or wiring of the main circuit power    Check the connection and wiring of the main circuit power supply (screw            [G]
                                                     tightening state on the power supply route, disconnected cables, and loose         [B]
    supply is incorrect.
                                                     connection of the servo amplifier connector).                                      [A]
                                                     Refer to "Example power circuit connections" in the following manual.
                                                     MR-J5 User's Manual (Hardware)

2. The wiring between P3 and P4 is                   Check the wiring between P3 and P4.
                                                     Refer to "Example power circuit connections" in the following manual.
    disconnected.
                                                     MR-J5 User's Manual (Hardware)

3. For the MR-J5D_, the wiring of the main circuit   Check the wiring of the main circuit power supply of the converter unit.           [G]
                                                     Refer to "Example power circuit connections" in the following manual.
    power supply of the converter unit is
                                                     MR-J5D User's Manual (Hardware)
    disconnected.
4. For the MR-J5D_, the magnetic contactor           Check the magnetic contactor control connector of the converter unit.
                                                     Refer to "Magnetic contactor control connector (CN23)" in the following
    control connector of the converter unit is
                                                     manual.
    disconnected.                                    MR-CV Power Regeneration Converter Unit User's Manual

5. For the MR-J5D_, the bus bar that connects        Check if the bus bar has been installed correctly.
                                                     Refer to "How to use the bus bar" in the following manual.
    the converter unit and the MR-J5D_ is
                                                     MR-J5D User's Manual (Hardware)
    disconnected.
6. The voltage of the main circuit power supply is   Check if the voltage of the main circuit power supply is equal to or lower than    [G]
                                                     the specified value. When the voltage is equal to or lower than the specified      [B]
    too low. The main circuit power supply voltage
                                                     value, increase the voltage of the main circuit power supply.                      [A]
    (between P+ and N-) has dropped due to an        200 V class: 160 V AC
    instantaneous power failure or other reasons.    400 V class: 280 V AC
                                                     If an instantaneous power failure is occurring, review the power supply
                                                     environment.

7. When this alarm occurs, the bus voltage is too    Check if the bus voltage during acceleration is lower than the specified value.
                                                     If the bus voltage is lower than the specified value, increase the acceleration
    low at acceleration.
                                                     time constant or the power supply capacity.
                                                     200 V class: 200 V DC
                                                     400 V class: 380 V DC

8. The fuse was disconnected.                        Check the charge light after a certain period of time.

9. The power supply capacity is insufficient.        Check if the specified power supply capacity is satisfied.

10. Main circuit capacitor has deteriorated.         After checking the operation time and ambient temperature, replace the servo
                                                     amplifier if the main circuit capacitor has reached the end of its service life.
                                                     Refer to "Parts with a service life" in the User's Manual (Introduction).

11. The servo amplifier has malfunctioned.           Check the value of the bus voltage. If the bus voltage is lower than the
                                                     specified value even though the voltage of the main circuit power supply is
                                                     within specifications, replace the servo amplifier.
                                                     200 V class: 200 V DC
                                                     400 V class: 380 V DC

12. For the MR-J5D_, the converter unit has          Replace the converter unit, then check the repeatability. If the error does not    [G]
                                                     repeat, replace the converter unit.
    malfunctioned.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                  33

---

## หน้า 36

[AL. 011_Switch setting error]
     • The settings of the DIP switch are incorrect.
     • The settings of the rotary switch are incorrect.


     [AL. 011.1_Rotary switch setting error]
     Cause                                                Check/action method                                                                  Model
     1. Each selected network has its settable range,     Check the settings of the rotary switches (SW1/SW2).                                 [G]
                                                          If the value set with the rotary switch does not match the actual value, the         [B]
          and the values set with the rotary switches
                                                          servo amplifier may have malfunctioned. Replace the servo amplifier.
          (SW1/SW2) were set out of the range.            Specifications on the setting of the rotary switches vary depending on each
                                                          network.
                                                          Refer to "Switch setting and display of the servo amplifier" or "Switch setting
                                                          and display of the drive unit" in the User's Manual (Introduction).


     [AL. 011.2_Disabled axis setting error]
     Cause                                                Check/action method                                                                  Model
     1. The settings of the disabling control axis        Check the setting of the disabling control axis switch.                              [G]
                                                          Refer to "Switch setting and display of the servo amplifier" or "Switch setting
          switch are incorrect.
                                                          and display of the drive unit" in the User's Manual (Introduction).
                                                          If the above case does not apply, the servo amplifier may have malfunctioned.
                                                          Replace the servo amplifier.
                                                          If the disabling control axis switch has been set as shown below, an alarm will      [B]
                                                          occur.
                                                          For 2-axis servo amplifiers
                                                           • The A-axis is disabled.
                                                           • All axes are disabled.
                                                          For 3-axis servo amplifiers
                                                           • Only the A-axis is disabled.
                                                           • Only the B-axis is disabled.
                                                           • The A-axis and B-axis are disabled.
                                                           • The A-axis and C-axis are disabled.
                                                           • All axes are disabled.
                                                          If any of the above conditions is met, check the settings of the disabling control
                                                          axis switch, and set them correctly.
                                                          For information on the settings of the disabling control axis switch, refer to
                                                          "Switch setting and display of the servo amplifier" in the User's Manual
                                                          (Introduction).
                                                          If an alarm still occurs even after the settings have been configured correctly,
                                                          the servo amplifier may have malfunctioned. Replace the servo amplifier.


         1 SERVO AMPLIFIER TROUBLESHOOTING
34       1.3 Handling methods for alarms/warnings

---

## หน้า 37

[AL. 012_Memory error 1 (RAM)]
• The internal part of the servo amplifier (RAM) has malfunctioned.                                                                               1
[AL. 012.1_RAM error 1]
Cause                                                 Check/action method                                                            Model
1. An internal part of the servo amplifier has        Noise from the power supply may have caused the failure. Disconnect all        [G]
                                                      cables except for those for the control circuit power supply, then check the   [B]
     malfunctioned.
                                                      repeatability. If the failure continues, the servo amplifier may have          [A]
                                                      malfunctioned. Replace the servo amplifier.

2. There is a problem with the surrounding            Check the power supply for noise. If there is noise, take countermeasures to
                                                      reduce the noise.
     environment.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)


[AL. 012.2_RAM error 2]
Page 35 [AL. 012.1_RAM error 1]


[AL. 012.4_RAM error 4]
Page 35 [AL. 012.1_RAM error 1]


[AL. 012.5_RAM error 5]
Page 35 [AL. 012.1_RAM error 1]


[AL. 012.6_RAM error 6]
Page 35 [AL. 012.1_RAM error 1]


[AL. 012.7_RAM error 7]
Page 35 [AL. 012.1_RAM error 1]


[AL. 012.8_RAM error 8]
Page 35 [AL. 012.1_RAM error 1]


[AL. 012.9_RAM error 9]
Page 35 [AL. 012.1_RAM error 1]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings               35

---

## หน้า 38

[AL. 013_CPU error]
     • An internal part of the servo amplifier has malfunctioned.
     • A clock transmitted from the controller has an error.


     [AL. 013.1_CPU error 1]
     Cause                                                     Check/action method                                                            Model
     1. An internal part of the servo amplifier has            Noise from the power supply may have caused the failure. Disconnect all        [G]
                                                               cables except for those for the control circuit power supply, then check the   [B]
          malfunctioned.
                                                               repeatability. If the failure continues, replace the servo amplifier.          [A]

     2. A clock transmitted from the controller has an         Check if this alarm occurs when the servo amplifier is connected to the        [G]
                                                               controller. If the alarm occurs, replace the controller.                       [B]
          error.
     3. The servo amplifier of the next axis has               Replace the servo amplifier of the next axis, then check the repeatability.

          malfunctioned.
     4. There is a problem with the surrounding                Check the power supply for noise. If there is noise, take countermeasures to   [G]
                                                               reduce the noise.                                                              [B]
          environment.
                                                               Check if the connector has shorted.                                            [A]
                                                               Refer to "Noise reduction techniques" in the following manuals.
                                                               MR-J5 User's Manual (Hardware)
                                                               MR-J5D User's Manual (Hardware)


     [AL. 013.2_CPU error 2]
     Page 36 [AL. 013.1_CPU error 1]


     [AL. 013.4_CPU error 4]
     Page 36 [AL. 013.1_CPU error 1]


     [AL. 013.5_CPU error 5]
     Page 36 [AL. 013.1_CPU error 1]


         1 SERVO AMPLIFIER TROUBLESHOOTING
36       1.3 Handling methods for alarms/warnings

---

## หน้า 39

[AL. 014_Control process error]
• The process did not complete within the specified time.                                                                                         1
• The internal part of the servo amplifier (communication IC) has malfunctioned. [G]


[AL. 014.1_Control process error 1]
Cause                                                 Check/action method                                                            Model
1. The servo parameter settings are incorrect.        Return the servo parameter to the value it had before the alarm occurrence,    [G]
                                                      then check if the problem occurs again.                                        [B]

2. There is a problem with the surrounding            Check the power supply for noise. If there is noise, take countermeasures to
                                                                                                                                     [A]
                                                      reduce the noise.
     environment.
                                                      Check if the connector has shorted.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)

3. The servo amplifier has malfunctioned.             Replace the servo amplifier.


[AL. 014.2_Control process error 2]
Cause                                                 Check/action method                                                            Model
1. A synchronous signal transmitted from the          Replace the controller, then check the repeatability.                          [G]
                                                                                                                                     [B]
     controller has an error.
2. The servo parameter settings are incorrect.        Return the servo parameter to the value it had before the alarm occurrence,    [G]
                                                      then check if the problem occurs again.                                        [B]

3. There is a problem with the surrounding            Check the power supply for noise. If there is noise, take countermeasures to
                                                                                                                                     [A]
                                                      reduce the noise.
     environment.
                                                      Check if the connector has shorted.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)

4. The servo amplifier has malfunctioned.             Replace the servo amplifier.


[AL. 014.3_Control process error 3]
Page 37 [AL. 014.1_Control process error 1]


[AL. 014.4_Control process error 4]
Page 37 [AL. 014.1_Control process error 1]


[AL. 014.5_Control process error 5]
Page 37 [AL. 014.1_Control process error 1]


[AL. 014.8_Control process error 8]
Page 37 [AL. 014.1_Control process error 1]


[AL. 014.9_Control process error 9]
Page 37 [AL. 014.1_Control process error 1]


[AL. 014.C_Control process error 12]
Page 37 [AL. 014.1_Control process error 1]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings              37

---

## หน้า 40

[AL. 016_Encoder initial communication error 1]
     • There is a communication error between the encoder and servo amplifier.


     [AL. 016.1_Encoder initial communication - Receive data error 1]
     Cause                                                   Check/action method                                                                Model
     1. There is a problem with the encoder cable.           Check if the encoder cable has been disconnected, incorrectly wired, or has        [G]
                                                             shorted.                                                                           [B]
                                                             If there is a problem with the encoder cable, replace or repair the cable.         [A]
                                                             Refer to "A/B/Z-phase differential output type encoder" in the following manual.
                                                             MR-J5 Partner's Encoder User's Manual

     2. If an A/B/Z-phase differential output type           Check if the servo amplifier is compatible with the A/B/Z-phase differential
                                                             output type encoder.
          encoder is being used on the servo motor
                                                             Refer to "Compatible encoder list" in the following manual.
          side, the servo amplifier is not compatible with   MR-J5 Partner's Encoder User's Manual
          the A/B/Z-phase differential output type
          encoder.
     3. If an A/B/Z-phase differential output type           Check if the wiring of the A/B/Z-phase differential output type encoder is
                                                             correct. Check if the encoder is wired to PSEL.
          encoder is being used on the servo motor
                                                             Refer to "A/B/Z-phase differential output type encoder" in the following manual.
          side, the connection with the encoder is           MR-J5 Partner's Encoder User's Manual
          incorrect.
     4. The servo amplifier has malfunctioned.               Replace the servo amplifier.

     5. The encoder has malfunctioned.                       Replace the servo motor.

     6. There is a problem with the surrounding              Check the power supply for noise. If there is noise, take countermeasures to
                                                             reduce the noise.
          environment.
                                                             Check if the connector has shorted.
                                                             Refer to "Noise reduction techniques" in the following manuals.
                                                             MR-J5 User's Manual (Hardware)
                                                             MR-J5D User's Manual (Hardware)


     [AL. 016.2_Encoder initial communication - Receive data error 2]
     Page 38 [AL. 016.1_Encoder initial communication - Receive data error 1]


         1 SERVO AMPLIFIER TROUBLESHOOTING
38       1.3 Handling methods for alarms/warnings

---

## หน้า 41

[AL. 016.3_Encoder initial communication - Receive data error 3]
Cause                                                Check/action method                                                                Model        1
1. For a multi-axis servo amplifier, unused axes     Set the axis not used to disabled with disabling control axis switch (SW3-2/       [G]
                                                     SW3-3/SW3-4).                                                                      [B]
     have not been disabled.
2. The encoder cable is disconnected.                Check if the encoder cable is connected correctly.                                 [G]
                                                                                                                                        [B]
3. The servo parameter settings for the              Set the servo parameter correctly according to the encoder cable
                                                                                                                                        [A]
                                                     communication method (two-wire type/four-wire type).
     communication method are incorrect.
                                                     [G] [B]: [Pr. PC04.3 Encoder cable communication method selection]
                                                     [A]: [Pr. PC22.3 Encoder cable communication method selection]

4. There is a problem with the encoder cable.        Check if the encoder cable has been disconnected or has shorted. If there is a
                                                     problem with the encoder cable, replace or repair the cable.

5. If an A/B/Z-phase differential output type        Check if the wiring of the A/B/Z-phase differential output type encoder is
                                                     correct. Check if the encoder is wired to PSEL.
     encoder is being used on the servo motor
                                                     Refer to "A/B/Z-phase differential output type encoder" in the following manual.
     side, the connection with the encoder is        MR-J5 Partner's Encoder User's Manual
     incorrect.
6. The voltage of the control circuit power supply   Check the voltage of the control circuit power supply.
                                                     If an instantaneous power failure is occurring in the control circuit power
     has become unstable.
                                                     supply, review the power supply environment.

7. The servo amplifier has malfunctioned.            Replace the servo amplifier.

8. The encoder has malfunctioned.                    Replace the servo motor.

9. There is a problem with the surrounding           Check the power supply for noise. If there is noise, take countermeasures to
                                                     reduce the noise.
     environment.
                                                     Check if the connector has shorted.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)


[AL. 016.5_Encoder initial communication - Transmission data error 1]
Page 38 [AL. 016.1_Encoder initial communication - Receive data error 1]


[AL. 016.6_Encoder initial communication - Transmission data error 2]
Page 38 [AL. 016.1_Encoder initial communication - Receive data error 1]


[AL. 016.7_Encoder initial communication - Transmission data error 3]
Page 38 [AL. 016.1_Encoder initial communication - Receive data error 1]


[AL. 016.A_Encoder initial communication - Process error 1]
Cause                                                Check/action method                                                                Model
1. The servo amplifier has malfunctioned.            Replace the servo amplifier.                                                       [G]
                                                                                                                                        [B]
2. The encoder has malfunctioned.                    Replace the servo motor.
                                                                                                                                        [A]
3. There is a problem with the surrounding           Check the power supply for noise. If there is noise, take countermeasures to
                                                     reduce the noise.
     environment.
                                                     Check if the connector has shorted.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                  39

---

## หน้า 42

[AL. 016.B_Encoder initial communication - Process error 2]
     Page 39 [AL. 016.A_Encoder initial communication - Process error 1]


     [AL. 016.C_Encoder initial communication - Process error 3]
     Page 39 [AL. 016.A_Encoder initial communication - Process error 1]


     [AL. 016.D_Encoder initial communication - Process error 4]
     Page 39 [AL. 016.A_Encoder initial communication - Process error 1]


     [AL. 016.E_Encoder initial communication - Process error 5]
     Page 39 [AL. 016.A_Encoder initial communication - Process error 1]


     [AL. 016.F_Encoder initial communication - Process error 6]
     Page 39 [AL. 016.A_Encoder initial communication - Process error 1]


         1 SERVO AMPLIFIER TROUBLESHOOTING
40       1.3 Handling methods for alarms/warnings

---

## หน้า 43

[AL. 017_Board error]
• There is a problem with an internal part of the servo amplifier.                                                                                       1
[AL. 017.1_Board error 1]
Cause                                                   Check/action method                                                                 Model
1. There is a problem with the current detection        Check that this alarm occurs in the servo-on status. If the alarm occurs, the       [G]
                                                        servo amplifier may have malfunctioned. Replace the servo amplifier.                [B]
     circuit.
                                                                                                                                            [A]
2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 017.3_Board error 2]
Page 41 [AL. 017.1_Board error 1]


[AL. 017.4_Board error 3]
Cause                                                   Check/action method                                                                 Model
1. The firmware version of the servo amplifier is       The firmware version is not supported.                                              [G]
                                                        Perform a firmware update to revert to the firmware version prior to the update.    [B]
     not supported.
                                                                                                                                            [A]
2. The recognition signal of the servo amplifier        Disconnect all cables except for those for the control circuit power supply, then
                                                        check the repeatability. If the failure continues, the servo amplifier may have
     was not read properly.
                                                        malfunctioned. Replace the servo amplifier.

3. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 017.5_Board error 4]
Cause                                                   Check/action method                                                                 Model
1. There is a problem with rotary switches (SW1/        After checking the conditions of the rotary switches, cycle the power, then         [G]
                                                        check the repeatability. If the failure continues, the servo amplifier may have     [B]
     SW2).
                                                        malfunctioned. Replace the servo amplifier.

2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 017.6_Board error 5]
Cause                                                   Check/action method                                                                 Model
1. There is a problem with the DIP switch (SW3).        After checking the conditions of the DIP switch, cycle the power, then check        [G]
                                                        the repeatability. If the failure continues, the servo amplifier may have           [B]
                                                        malfunctioned. Replace the servo amplifier.

2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause. If there is noise, take
     environment.
                                                        countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings                   41

---

## หน้า 44

[AL. 017.7_Board error 7]
     Cause                                               Check/action method                                                                 Model
     1. The firmware version of the servo amplifier is   The firmware version is not supported. Perform a firmware update to revert to       [G]
                                                         the firmware version prior to the update.                                           [B]
         not supported.
                                                                                                                                             [A]
     2. The recognition signal of the servo amplifier    Disconnect all cables except for those for the control circuit power supply, then
                                                         check the repeatability. If the failure continues, the servo amplifier may have
         was not read properly.
                                                         malfunctioned. Replace the servo amplifier.

     3. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                         appropriate countermeasures for the cause. If there is noise, take
         environment.
                                                         countermeasures to reduce the noise. Refer to "Noise reduction techniques" in
                                                         the following manuals.
                                                         MR-J5 User's Manual (Hardware)
                                                         MR-J5D User's Manual (Hardware)


     [AL. 017.9_Board error 8]
     Cause                                               Check/action method                                                                 Model
     1. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement           [G]
                                                         appropriate countermeasures for the cause.                                          [B]
         environment.
                                                         If there is noise, take countermeasures to reduce the noise.
                                                         Refer to "Noise reduction techniques" in the following manuals.
                                                         MR-J5 User's Manual (Hardware)
                                                         MR-J5D User's Manual (Hardware)

     2. The servo amplifier has malfunctioned.           Replace the servo amplifier.


     [AL. 017.A_Board error 9]
     Cause                                               Check/action method                                                                 Model
     1. A push button is faulty.                         After checking the conditions of the push buttons, cycle the power, then check      [A]
                                                         the repeatability. If the failure continues, the servo amplifier may have
                                                         malfunctioned. Replace the servo amplifier.

     2. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                         appropriate countermeasures for the cause.
         environment.
                                                         If there is noise, take countermeasures to reduce the noise.
                                                         Refer to "Noise reduction techniques" in the following manuals.
                                                         MR-J5 User's Manual (Hardware)


         1 SERVO AMPLIFIER TROUBLESHOOTING
42       1.3 Handling methods for alarms/warnings

---

## หน้า 45

[AL. 019_Memory error 3]
• The internal part of the servo amplifier (Flash-ROM) has malfunctioned.                                                                        1
[AL. 019.1_Flash-ROM error 1]
Cause                                                Check/action method                                                            Model
1. The Flash-ROM has malfunctioned.                  Noise from the power supply may have caused the failure. Disconnect all        [G]
                                                     cables except for those for the control circuit power supply, then check the   [B]
                                                     repeatability. If the failure continues, replace the servo amplifier.          [A]

2. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
     environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)

3. A firmware installation failed.                   Install the firmware again.


[AL. 019.2_Flash-ROM error 2]
Page 43 [AL. 019.1_Flash-ROM error 1]


[AL. 019.3_Flash-ROM error 3]
Page 43 [AL. 019.1_Flash-ROM error 1]


[AL. 019.6_Flash-ROM error 6]
Page 43 [AL. 019.1_Flash-ROM error 1]


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings               43

---

## หน้า 46

[AL. 01A_Servo motor combination error]
     • The combination of the servo amplifier and servo motor is incorrect.
     • The combination of the servo amplifier and servo motor constant file is incorrect.


     [AL. 01A.1_Servo motor combination error 1]
     Cause                                                  Check/action method                                                            Model
     1. The servo amplifier and the servo motor have        Refer to "Servo amplifier/motor combinations" in the following manual.         [G]
                                                            MR-J5 User's Manual (Hardware)                                                [B]
          been connected incorrectly.
                                                            Refer to "Combination with drive units and servo motors" in the following      [A]
                                                            manual.
                                                            MR-J5D User's Manual (Hardware)

     2. A rotary servo motor that does not support the      Referring to "Servo amplifier/motor combinations" in the following manual,
                                                            check if there are any restrictions on the firmware version.
          firmware version of the servo amplifier is
                                                            MR-J5 User's Manual (Hardware)
          connected to the servo amplifier.                 Refer to "Combination with drive units and servo motors" in the following
                                                            manual.
                                                            MR-J5D User's Manual (Hardware)

     3. A servo motor whose manufacture date is old         Refer to "Servo amplifier/motor combinations" in the following manual.
                                                            MR-J5 User's Manual (Hardware)
          has been connected.
                                                            Refer to "Combination with drive units and servo motors" in the following
                                                            manual.
                                                            MR-J5D User's Manual (Hardware)

     4. [Pr. PA17 Servo motor series setting] and [Pr.      Check if [Pr. PA17] and [Pr. PA18] have been set correctly.

          PA18 Servo motor type setting] were not set
          based on the servo motor to be used.
     5. The encoder has malfunctioned.                      Replace the servo motor.


     [AL. 01A.2_Servo motor control mode combination error]
     Cause                                                  Check/action method                                                            Model
     1. The combination of the servo motor being            Check the [Pr. PA01.1] setting.                                                [G]
                                                                                                                                           [B]
          used and the setting of [Pr. PA01.1 Operation
                                                                                                                                           [A]
          mode selection] is not appropriate.
     2. In the fully closed loop control mode, the servo    Refer to "USING A FULLY CLOSED LOOP SYSTEM" in the following
                                                            manuals.
          motor-side encoder and the load-side encoder
                                                            MR-J5 User's Manual (Hardware)
          are incorrectly connected to the servo            MR-J5D User's Manual (Hardware)
          amplifier.
     3. In the scale measurement mode, the servo            Refer to "Scale measurement function" in the following manual.                 [G]
                                                            MR-J5 User's Manual (Function)                                                [B]
          motor-side encoder and the load-side encoder
                                                            When using the A/B/Z-phase differential output encoder, check if [Pr. PC27.5
          are incorrectly connected to the servo            Scale measurement encoder selection] has been set correctly.
          amplifier.


     [AL. 01A.3_Control mode/load-side encoder combination error]
     Cause                                                  Check/action method                                                            Model
     1. In the fully closed loop control mode, the servo    Refer to "USING A FULLY CLOSED LOOP SYSTEM" in the following                   [G]
                                                            manuals.                                                                       [B]
          motor-side encoder and the load-side encoder
                                                            MR-J5 User's Manual (Hardware)                                                [A]
          are incorrectly connected to the servo            MR-J5D User's Manual (Hardware)
          amplifier.
     2. In the scale measurement mode, the servo            Refer to "Scale measurement function" in the following manual.                 [G]
                                                            MR-J5 User's Manual (Function)                                                [B]
          motor-side encoder and the load-side encoder
                                                            When using the A/B/Z-phase differential output encoder, check if [Pr. PC27.5
          are incorrectly connected to the servo            Scale measurement encoder selection] has been set correctly.
          amplifier.
     3. Values of the servo parameters for                  Set the servo parameters for manufacturer setting to the initial values.

          manufacturer setting have been changed.

         1 SERVO AMPLIFIER TROUBLESHOOTING
44       1.3 Handling methods for alarms/warnings

---

## หน้า 47

[AL. 01A.4_Servo motor combination error 2]
Cause                                                                 Check/action method                                                               Model        1
1. The servo amplifier has malfunctioned.                             Replace the servo amplifier.                                                      [G]
                                                                                                                                                        [B]
                                                                                                                                                        [A]


[AL. 01A.5_Servo motor combination error 3]
Cause                                                                 Check/action method                                                               Model
1. The servo motor that was connected at the                          Check if a servo motor other than the one that was connected at the startup of    [G]
                                                                      the absolute position detection system is connected. If a different servo motor   [B]
      startup of the absolute position detection
                                                                      is connected, reconnect to the servo motor that was connected at the startup      [A]
      system was changed to a different servo                         of the absolute position detection system.
      motor.
2. At occurrence of [AL. 025 Absolute position                        After changing the setting value of [Pr. PA03.1 Servo motor replacement
                                                                      preparation] to "1" (enabled), cycle the power and then deactivate [AL. 01A
      erased], the power was cycled without leaving
                                                                      Servo motor combination error]. Perform homing again.
      the servo motor for 5 s.
3. The servo motor was replaced.
4. After a servo amplifier with the factory settings                                                                                                    [G]
                                                                                                                                                        [B]
      has been connected to a controller for the first
      time, the fully closed loop control mode and an
      absolute position detection system were set
      with the controller, then the servo amplifier
      was turned on again.
5. The servo amplifier was replaced with one that                                                                                                       [B]

      has been set as follows:
 • [Pr. PF63.2] has been set to "1" (enabled).
 • [Pr. PC84] to [Pr. PC91] have been set to values other than "0".

6. The servo amplifier has malfunctioned.                             Replace the servo amplifier.                                                      [G]
                                                                                                                                                        [B]
7. The encoder has malfunctioned.                                     Replace the servo motor.
                                                                                                                                                        [A]
8. There is a problem with the surrounding                            Check the noise, ambient temperature, and other conditions, and implement
                                                                      appropriate countermeasures for the cause.
      environment.
                                                                      If there is noise, take countermeasures to reduce the noise.
                                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                                      MR-J5 User's Manual (Hardware)
                                                                      MR-J5D User's Manual (Hardware)


                                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                                       1.3 Handling methods for alarms/warnings                 45

---

## หน้า 48

[AL. 01A.6_Servo motor combination error 4]
     Cause                                                                 Check/action method                                                             Model
     1. The scale measurement encoder that was                             Check if a scale measurement encoder other than the one that was connected      [G]
                                                                           at the startup of the absolute position detection system is connected. If a     [B]
           connected at the startup of the absolute
                                                                           different scale measurement encoder is connected, reconnect to the scale        [A]
           position detection system was changed to a                      measurement encoder that was connected at the startup of the absolute
           different scale measurement.                                    position detection system.

     2. At occurrence of [AL. 025 Absolute position                        After changing the setting value of [Pr. PA03.2 Scale measurement encoder
                                                                           replacement preparation] to "1", cycle the power and then deactivate [AL. 01A
           erased], the power was cycled without leaving
                                                                           Servo motor combination error].
           the servo motor for 5 s.
     3. The scale measurement encoder was
           replaced.
     4. The servo amplifier was replaced with one that                                                                                                     [B]

           has been set as follows:
      • [Pr. PF63.2] has been set to "1" (enabled).
      • [Pr. PC92] to [Pr. PC95] have been set to values other than "0".

     5. The servo amplifier has malfunctioned.                             Replace the servo amplifier.                                                    [G]
                                                                                                                                                           [B]
     6. The scale measurement encoder has                                  Replace the scale measurement encoder.
                                                                                                                                                           [A]
           malfunctioned.
     7. There is a problem with the surrounding                            Check the noise, ambient temperature, and other conditions, and implement
                                                                           appropriate countermeasures for the cause.
           environment.
                                                                           If there is noise, take countermeasures to reduce the noise.
                                                                           Refer to "Noise reduction techniques" in the following manuals.
                                                                           MR-J5 User's Manual (Hardware)
                                                                           MR-J5D User's Manual (Hardware)


          1 SERVO AMPLIFIER TROUBLESHOOTING
46        1.3 Handling methods for alarms/warnings

---

## หน้า 49

[AL. 01B_Protection coordination error]
• An alarm occurred in the converter unit or another MR-J5D_ connected with a protection coordination cable during servo-                            1
 on.


[AL. 01B.1_Protection coordination error 1]
Cause                                                   Check/action method                                                             Model
1. The protection coordination cable is not             Connect the protection coordination cable correctly.                            [G]
                                                        Refer to "Example power circuit connections" in the following manual.
       connected correctly.
                                                        MR-J5D User's Manual (Hardware)

2. An alarm occurred in the converter unit during       Check the alarm occurred in the converter unit, and take corrective action in
                                                        accordance with "CONVERTER UNIT TROUBLESHOOTING" in the following
       servo-on.
                                                        manual.
                                                        MR-CV Power Regeneration Converter Unit User's Manual

3. An alarm occurred in another MR-J5D_                 Check the alarm occurred in the servo amplifier that is causing the problem,
                                                        and take corrective action.
       connected with a protection coordination cable
       during servo-on.


[AL. 01B.4_Protection coordination error 2]
Cause                                                   Check/action method                                                             Model
1. The protection coordination cable is not             Connect the protection coordination cable correctly.                            [G]
                                                        Refer to "Example power circuit connections" in the following manual.
       connected correctly.
                                                        MR-J5D User's Manual (Hardware)

2. The ready-on command was input while an              Check the alarm occurred in the converter unit, and take corrective action in
                                                        accordance with "CONVERTER UNIT TROUBLESHOOTING" in the following
       alarm was occurring in the converter unit.
                                                        manual.
                                                        MR-CV Power Regeneration Converter Unit User's Manual

3. The ready-on command was input while an              Check the trouble on the device that is causing the problem, and follow the
                                                        procedure.
       alarm was occurring in another MR-J5D_
       connected with a protection coordination
       cable.
4. The ready-on command was not input to                Input the ready-on command at the same time to all MR-J5D_ connected with
                                                        a protection coordination cable.
       another MR-J5D_ connected with a protection
       coordination cable.


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings                 47

---

## หน้า 50

[AL. 01E_Encoder initial communication error 2]
     • The encoder has malfunctioned.


     [AL. 01E.1_Encoder malfunction]
     Cause                                          Check/action method                                                         Model
     1. The encoder has malfunctioned.              Replace the servo motor.                                                    [G]
                                                                                                                                [B]
     2. There is a problem with the surrounding     Check the noise, ambient temperature, and other conditions, and implement
                                                                                                                                [A]
                                                    appropriate countermeasures for the cause.
          environment.
                                                    If there is noise, take countermeasures to reduce the noise.
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)


     [AL. 01E.2_Load-side encoder malfunction]
     Cause                                          Check/action method                                                         Model
     1. The load-side encoder has malfunctioned.    Replace the load-side encoder.                                              [G]
                                                                                                                                [B]
     2. There is a problem with the surrounding     Check the noise, ambient temperature, and other conditions, and implement
                                                                                                                                [A]
                                                    appropriate countermeasures for the cause.
          environment.
                                                    If there is noise, take countermeasures to reduce the noise.
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)


         1 SERVO AMPLIFIER TROUBLESHOOTING
48       1.3 Handling methods for alarms/warnings

---

## หน้า 51

[AL. 01F_Encoder initial communication error 3]
• The connected encoder is not compatible with the servo amplifier.                                                                           1
[AL. 01F.1_Incompatible encoder]
Cause                                                Check/action method                                                         Model
1. An incompatible servo motor or an                 Refer to "Servo amplifier/motor combinations" in the following manual.      [G]
                                                     MR-J5 User's Manual (Hardware)                                             [B]
     incompatible linear encoder was connected to
                                                     Refer to "Combination with drive units and servo motors" in the following   [A]
     the servo amplifier.                            manual.
                                                     MR-J5D User's Manual (Hardware)
                                                     Refer to "Compatible encoder list" in the following manual.
                                                     MR-J5 Partner's Encoder User's Manual

2. The firmware version of the servo amplifier       Refer to "Servo amplifier/motor combinations" in the following manual.
                                                     MR-J5 User's Manual (Hardware)
     does not support the servo motor or linear
                                                     Refer to "Combination with drive units and servo motors" in the following
     encoder.                                        manual.
                                                     MR-J5D User's Manual (Hardware)
                                                     Refer to "Compatible encoder list" in the following manual.
                                                     MR-J5 Partner's Encoder User's Manual

3. The encoder or linear encoder has                 Replace the servo motor or linear encoder.

     malfunctioned.


[AL. 01F.2_Incompatible load-side encoder]
Cause                                                Check/action method                                                         Model
1. A load-side encoder incompatible with the         Check the model name of the load-side encoder.                              [G]
                                                                                                                                 [B]
     servo amplifier was connected.
                                                                                                                                 [A]
2. The firmware version of the servo amplifier       Refer to "Compatible encoder list" in the following manual.
                                                     MR-J5 Partner's Encoder User's Manual
     does not support the load-side encoder.
3. The load-side encoder has malfunctioned.          Replace the load-side encoder, then check the repeatability.
                                                     If the error does not repeat, replace the load-side encoder.


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings            49

---

## หน้า 52

[AL. 020_Encoder normal communication error 1]
     • There is a communication error between the encoder and servo amplifier.


     [AL. 020.1_Encoder normal communication - Receive data error 1]
      Cause                                                  Check/action method                                                                Model
      1. There is a problem with the encoder cable.          Check if the encoder cable has been disconnected or has shorted.                   [G]
                                                             If there is a problem with the cable, repair or replace the cable.                 [B]
                                                             If an A/B/Z-phase differential output type encoder is being used, check if the     [A]
                                                             encoder is wired correctly.
                                                             Refer to "A/B/Z-phase differential output type encoder" in the following manual.
                                                             MR-J5 Partner's Encoder User's Manual

      2. The external conductor of the encoder cable is      Check if the external conductor of the encoder cable is connected to the
                                                             ground plate of the connector.
           not connected to the ground plate of the
                                                             Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
           connector.                                        in the following manual.
                                                             Rotary Servo Motor User's Manual (For MR-J5)

      3. The servo parameter settings for the                Set the servo parameter correctly according to the encoder cable
                                                             communication method (two-wire type/four-wire type).
           communication method are incorrect.
                                                             [G] [B]: [Pr. PC04.3 Encoder cable communication method selection]
                                                             [A]: [Pr. PC22.3 Encoder cable communication method selection]

      4. The servo amplifier has malfunctioned.              Replace the servo amplifier.

      5. The encoder has malfunctioned.                      Replace the servo motor.

      6. There is a problem with the surrounding             Check the noise, ambient temperature, vibration, and other conditions, and
                                                             implement appropriate countermeasures for the cause.
           environment.
                                                             If there is noise, take countermeasures to reduce the noise.
                                                             Refer to "Noise reduction techniques" in the following manuals.
                                                             MR-J5 User's Manual (Hardware)
                                                             MR-J5D User's Manual (Hardware)
                                                             If vibration is the cause, check for any loose connection of connectors due to
                                                             abnormal vibration through components such as an encoder connector of the
                                                             servo amplifier or servo motor.


     [AL. 020.2_Encoder normal communication - Receive data error 2]
     Page 50 [AL. 020.1_Encoder normal communication - Receive data error 1]


     [AL. 020.3_Encoder normal communication - Receive data error 3]
      Cause                                                  Check/action method                                                                Model
      1. The Z-phase signal cannot be detected               Check if the Z-phase pulse signals (PZ and PZR) of the encoder cable have          [G]
                                                             been disconnected or have shorted.                                                 [B]
           despite being on. This does not apply to multi-
                                                             Refer to the specifications provided by the encoder manufacturer or "A/B/Z-        [A]
           axis servo amplifiers.                            phase differential output type encoder" in the following manual.
                                                             MR-J5 Partner's Encoder User's Manual

      2. There is a problem with the encoder cable.          Page 50 [AL. 020.1_Encoder normal communication - Receive data error
                                                             1]
      3. The external conductor of the encoder cable is
           not connected to the ground plate of the
           connector.
      4. The servo parameter settings for the
           communication method are incorrect.
      5. The servo amplifier has malfunctioned.
      6. The encoder has malfunctioned.
      7. There is a problem with the surrounding
           environment.


     [AL. 020.4_Manufacturer setting error]
     This is for manufacturer setting.


          1 SERVO AMPLIFIER TROUBLESHOOTING
50        1.3 Handling methods for alarms/warnings

---

## หน้า 53

[AL. 020.5_Encoder normal communication - Transmission data error 1]
Cause                                               Check/action method                                                           Model        1
1. If an A/B/Z-phase differential output type       Check if the A/B-phase pulse signals (PA, PAR, PB, and PBR) of the encoder    [G]
                                                    cable have been disconnected or have shorted.                                 [B]
     encoder is being used, the wiring of the
                                                    Refer to the specifications provided by the encoder manufacturer or "A/B/Z-   [A]
     encoder is incorrect.                          phase differential output type encoder" in the following manual.
                                                    MR-J5 Partner's Encoder User's Manual

2. There is a problem with the encoder cable.       Page 50 [AL. 020.1_Encoder normal communication - Receive data error
                                                    1]
3. The external conductor of the encoder cable is
     not connected to the ground plate of the
     connector.
4. If an A/B/Z-phase differential output type
     encoder is being used, the servo parameter
     settings are incorrect.
5. The servo amplifier has malfunctioned.
6. The encoder has malfunctioned.
7. There is a problem with the surrounding
     environment.


[AL. 020.6_Encoder normal communication - Transmission data error 2]
Cause                                               Check/action method                                                           Model
1. If an A/B/Z-phase differential output type       Check if the Z-phase pulse signals (PZ and PZR) of the encoder cable have     [G]
                                                    been disconnected or have shorted.                                            [B]
     encoder is being used, the wiring of the
                                                    Refer to the specifications provided by the encoder manufacturer or "A/B/Z-   [A]
     encoder is incorrect.                          phase differential output type encoder" in the following manual.
                                                    MR-J5 Partner's Encoder User's Manual

2. There is a problem with the encoder cable.       Page 50 [AL. 020.1_Encoder normal communication - Receive data error
                                                    1]
3. The external conductor of the encoder cable is
     not connected to the ground plate of the
     connector.
4. If an A/B/Z-phase differential output type
     encoder is being used, the servo parameter
     settings are incorrect.
5. The servo amplifier has malfunctioned.
6. The encoder has malfunctioned.
7. There is a problem with the surrounding
     environment.


[AL. 020.7_Encoder normal communication - Transmission data error 3]
Page 50 [AL. 020.1_Encoder normal communication - Receive data error 1]


[AL. 020.C_Encoder communication protocol error 1]
Page 50 [AL. 020.1_Encoder normal communication - Receive data error 1]


[AL. 020.D_Encoder communication protocol error 2]
Page 50 [AL. 020.1_Encoder normal communication - Receive data error 1]


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.3 Handling methods for alarms/warnings               51

---

## หน้า 54

[AL. 021_Encoder normal communication error 2]
     • The encoder detected an error signal.


     [AL. 021.1_Encoder data error 1]
     Cause                                                   Check/action method                                                              Model
     1. An excessive speed or acceleration was               Decrease the control gain, then check the repeatability. If the error does not   [G]
                                                             repeat, use the encoder with a lower gain.                                       [B]
          detected due to an oscillation or other factors.
                                                                                                                                              [A]
     2. The external conductor of the encoder cable is       Check if the external conductor of the encoder cable is connected to the
                                                             ground plate of the connector.
          not connected to the ground plate of the
                                                             Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
          connector.                                         in the following manual.
                                                             Rotary Servo Motor User's Manual (For MR-J5)

     3. The encoder power supply voltage dropped             When cables are fabricated by the customer, check if wires with specifications
                                                             equivalent to the recommended wires are used for the encoder cable.
          considerably in the encoder cable wiring.
                                                             Use the wires with specifications equivalent to the recommended wires if they
                                                             are not used.
                                                             Refer to "Wires for option cables" in the following manual.
                                                             Rotary Servo Motor User's Manual (For MR-J5)

     4. There is a problem with the encoder cable.           Check if the encoder cable has been disconnected or has shorted.
                                                             If there is a problem with the cable, repair or replace the cable.

     5. The encoder has malfunctioned.                       Replace the servo motor.

     6. There is a problem with the surrounding              Check the noise, ambient temperature, external magnetic field, and other
                                                             conditions, and implement appropriate countermeasures for the cause.
          environment.
                                                             MR-J5 User's Manual (Hardware)
                                                             MR-J5D User's Manual (Hardware)


     [AL. 021.2_Encoder data update error]
     Cause                                                   Check/action method                                                              Model
     1. The encoder has malfunctioned.                       Replace the servo motor.                                                         [G]
                                                                                                                                              [B]
     2. The external conductor of the encoder cable is       Check if the external conductor of the encoder cable is connected to the
                                                                                                                                              [A]
                                                             ground plate of the connector.
          not connected to the ground plate of the
                                                             Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
          connector.                                         in the following manual.
                                                             Rotary Servo Motor User's Manual (For MR-J5)

     3. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                             appropriate countermeasures for the cause.
          environment.
                                                             If there is noise, take countermeasures to reduce the noise.
                                                             Refer to "Noise reduction techniques" in the following manuals.
                                                             MR-J5 User's Manual (Hardware)
                                                             MR-J5D User's Manual (Hardware)


     [AL. 021.3_Encoder data waveform error]
     Page 52 [AL. 021.2_Encoder data update error]


         1 SERVO AMPLIFIER TROUBLESHOOTING
52       1.3 Handling methods for alarms/warnings

---

## หน้า 55

[AL. 021.4_No encoder signal]
Cause                                               Check/action method                                                         Model        1
1. A signal of the encoder has not been input.      Check if the encoder cable is wired correctly.                              [G]
                                                                                                                                [B]
2. The external conductor of the encoder cable is   Check if the external conductor of the encoder cable is connected to the
                                                                                                                                [A]
                                                    ground plate of the connector.
     not connected to the ground plate of the
                                                    Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
     connector.                                     in the following manual.
                                                    Rotary Servo Motor User's Manual (For MR-J5)

3. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                    appropriate countermeasures for the cause.
     environment.
                                                    If there is noise, take countermeasures to reduce the noise.
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)


[AL. 021.5_Encoder hardware error 1]
Page 52 [AL. 021.2_Encoder data update error]


[AL. 021.6_Encoder hardware error 2]
Page 52 [AL. 021.2_Encoder data update error]


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings            53

---

## หน้า 56

[AL. 024_Main circuit error]
     • The servo motor power cable has a ground fault.
     • The servo motor has a ground fault.


     [AL. 024.1_Ground fault detected via hardware detection circuit]
     Cause                                                Check/action method                                                                   Model
     1. The servo motor power cable has a ground          Check if the servo motor power cable has a ground fault. If the servo motor           [G]
                                                          power cable has a ground fault, correct the wiring.                                   [B]
          fault or has shorted.
                                                          Incorrect wiring of the U/V/W cable and grounding cable between the servo             [A]
                                                          amplifier and servo motor may cause a ground fault. Check the wiring.
                                                          Check if the servo motor power cable has shorted. If the servo motor power
                                                          cable has shorted, replace the servo motor power cable.

     2. The servo motor has a ground fault.               After disconnecting the servo motor power cables on the servo motor side,
                                                          check the insulation between phases (U/V/W/      ). If the servo motor has a
                                                          ground fault or has shorted, replace the servo motor.

     3. The main circuit power supply cable and servo     After shutting off the power, make sure that the main circuit power cable and
                                                          the motor power cable are not in contact with each other. If the cables are
          motor power cable have shorted.
                                                          contacting, correct the wiring.

     4. The servo amplifier has malfunctioned.            Check that this alarm occurs as the servo motor power cables (U/V/W) are
                                                          disconnected. If the alarm occurs, replace the servo amplifier.

     5. The wiring of the regenerative resistor           Check if the regenerative resistor (regenerative option) is wired correctly. If the
                                                          regenerative resistor (regenerative option) is wired incorrectly, correct the
          (regenerative option) is incorrect.
                                                          wiring.

     6. The regenerative resistor (regenerative option)   Check if the combination of the regenerative resistor (regenerative option) and
                                                          the servo amplifier is correct as specified.
          and the servo amplifier are connected in a
                                                          Refer to "Regenerative option" in the following manual.
          wrong combination.                              MR-J5 User's Manual (Hardware)

     7. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                          appropriate countermeasures for the cause. If there is noise, take
          environment.
                                                          countermeasures to reduce the noise.
                                                          Refer to "Noise reduction techniques" in the following manuals.
                                                          MR-J5 User's Manual (Hardware)
                                                          MR-J5D User's Manual (Hardware)


     [AL. 024.2_Ground fault detected via software detection processing]
     Cause                                                Check/action method                                                                   Model
     1. The servo motor power cable has a ground          Check if the servo motor power cable has a ground fault. If the servo motor           [G]
                                                          power cable has a ground fault, correct the wiring.                                   [B]
          fault or has shorted.
                                                          Incorrect wiring of the U/V/W cable and grounding cable between the servo             [A]
                                                          amplifier and servo motor may cause a ground fault. Check the wiring.
                                                          Check if the servo motor power cable has shorted. If the servo motor power
                                                          cable has shorted, replace the servo motor power cable.

     2. The servo motor has a ground fault.               After disconnecting the servo motor power cables on the servo motor side,
                                                          check the insulation between phases (U/V/W/      ). If the servo motor has a
                                                          ground fault or has shorted, replace the servo motor.

     3. The main circuit power supply cable and servo     After shutting off the power, make sure that the main circuit power cable and
                                                          the motor power cable are not in contact with each other. If the cables are
          motor power cable have shorted.
                                                          contacting, correct the wiring.

     4. The servo amplifier has malfunctioned.            Check that this alarm occurs as the servo motor power cables (U/V/W) are
                                                          disconnected. If the alarm occurs, replace the servo amplifier.

     5. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                          appropriate countermeasures for the cause. If there is noise, take
          environment.
                                                          countermeasures to reduce the noise.
                                                          Refer to "Noise reduction techniques" in the following manuals.
                                                          MR-J5 User's Manual (Hardware)
                                                          MR-J5D User's Manual (Hardware)


         1 SERVO AMPLIFIER TROUBLESHOOTING
54       1.3 Handling methods for alarms/warnings

---

## หน้า 57

[AL. 025_Absolute position erased]
• The absolute position data has an error.                                                                                        1
• Power was switched on for the first time in the absolute position detection system.
• Power was switched on for the first time after the scale measurement encoder was set for the absolute position detection
 system.
• The servo amplifier was powered on when the battery was degraded or disconnected.


                                                                              1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                1.3 Handling methods for alarms/warnings     55

---

## หน้า 58

[AL. 025.1_Servo motor encoder absolute position erased]
     Cause                                                               Check/action method                                                                Model
     1. Power was switched on for the first time in the                  If the power was switched on for the first time after the absolute position        [G]
                                                                         detection system is set, check that the battery is mounted correctly before        [B]
           absolute position detection system.
                                                                         homing.                                                                            [A]
                                                                         When using a Mitsubishi Electric servo motor equipped with a batteryless
                                                                         absolute position encoder, allow the alarm to occur for 5 s, then cycle the
                                                                         power. Perform homing.

     2. The Mitsubishi Electric servo motor equipped                     Connect the servo motor that was connected at the startup of the absolute
                                                                         position detection system. Start up the absolute position detection system
           with a batteryless absolute position encoder
                                                                         again.
           that was connected to the absolute position
           detection system at startup was changed to
           another servo motor.
     3. After the control circuit power supply was shut                  If the battery was disconnected as described in the left column, check that the
                                                                         battery is mounted correctly before homing.
           off, the battery was removed in either of the
           following situations:
      • When using an MR-BAT6V1SET(-A) battery or MR-BT6VCASE
        battery case, CN4 of the servo amplifier was disconnected with
        the control circuit power supply off.

     4. The power was shut off in either of the                          If the power supply was shut off as described in the left column, check that the
                                                                         battery is mounted correctly before homing.
           following situations:
                                                                         When MR-BAT6V1SET(-A) or MR-BT6VCASE is used, see 5.
      • When using an MR-BAT6V1SET(-A) or MR-BT6VCASE, the
        power was shut off with the battery disconnected from CN4.

     5. The battery voltage is too low. The battery is                   Check the battery voltage with a tester. If the voltage is lower than 3 V DC,
                                                                         replace the battery, then execute homing.
           exhausted.
     6. The voltage dropped considerably in the                          Check if the recommended wires are being used for the encoder cable.
                                                                         If the recommended wires are not being used, use the recommended wires,
           encoder cable wired to the battery.
                                                                         then execute homing.
                                                                         Refer to "Wires for option cables" in the following manual.
                                                                         Rotary Servo Motor User's Manual (For MR-J5)

     7. There is a problem with the battery cable.                       Check for a loose connection with a tester.
                                                                         If there is a loose connection, use a recommended cable, then execute
                                                                         homing.

     8. There is a loose connection of the encoder                       Check for a loose connection with a tester. Measure the voltage on the servo
                                                                         motor side.
           cable on the servo motor side.
                                                                         If there is a loose connection, repair or replace the encoder cable, then
                                                                         execute homing.

     9. When using a direct drive motor, the absolute                    If the absolute position storage unit has not been connected correctly, connect
                                                                         it correctly, then execute homing.
           position storage unit is not connected.
                                                                         Refer to "Combinations of encoder cables" in the following manual.
                                                                         Direct Drive Motor User's Manual

     10. There is a problem with the encoder cable.                      If there is a problem with the encoder cable, replace or repair the cable, then
                                                                         execute homing.

     11. When the Mitsubishi Electric servo motor                        Make sure that the servo motor shaft will not be rotated by an external force at
                                                                         a high speed. After removing the cause, execute homing, then turn the servo
           equipped with a batteryless absolute position
                                                                         motor shaft at least 180 degrees.
           encoder was used, an external force rotated
           the servo motor shaft at a high speed at power
           failure.
     12. There is a problem with the surrounding                         Check the noise, ambient temperature, and other conditions, and implement
                                                                         appropriate countermeasures for the cause. If there is noise, take
           environment when using the Mitsubishi
                                                                         countermeasures to reduce the noise.
           Electric servo motor equipped with a                          Refer to "Noise reduction techniques" in the following manuals.
           batteryless absolute position encoder.                        MR-J5 User's Manual (Hardware)
                                                                         MR-J5D User's Manual (Hardware)
                                                                         After removing the cause, execute homing, then turn the servo motor shaft at
                                                                         least 180 degrees.

     13. The servo amplifier has malfunctioned.                          Replace the servo amplifier.

     14. The encoder has malfunctioned.                                  Replace the servo motor.


          1 SERVO AMPLIFIER TROUBLESHOOTING
56        1.3 Handling methods for alarms/warnings

---

## หน้า 59

[AL. 025.2_Scale measurement encoder - Absolute position erased]
Cause                                                               Check/action method                                                                Model        1
1. Power was switched on for the first time after                   If the power was switched on for the first time, check that the battery is         [G]
                                                                    mounted correctly before homing.                                                   [B]
      the scale measurement encoder was set for
                                                                    When using a Mitsubishi Electric servo motor equipped with a batteryless
      the absolute position detection system.                       absolute position encoder, allow the alarm to occur for 5 s, then cycle the
                                                                    power. Perform homing.

2. The Mitsubishi Electric servo motor equipped                     Connect the servo motor that was connected at the startup of the absolute
                                                                    position detection system. Start up the absolute position detection system
      with a batteryless absolute position encoder
                                                                    again.
      that was connected to the absolute position
      detection system at startup was changed to
      another servo motor or encoder.
3. After the control circuit power supply was shut                  If the battery was disconnected as described in the left column, check that the
                                                                    battery is mounted correctly before homing.
      off, the battery was removed in either of the
      following situations:
 • When using an MR-BAT6V1SET(-A) battery or MR-BT6VCASE
   battery case, CN4 of the servo amplifier was disconnected with
   the control circuit power supply off.

4. The power was shut off in either of the                          If the power supply was shut off as described in the left column, check that the
                                                                    battery is mounted correctly before homing.
      following situations:
 • When using an MR-BAT6V1SET(-A) or MR-BT6VCASE, the
   power was shut off with the battery disconnected from CN4.

5. The battery voltage is too low. The battery is                   Check the battery voltage with a tester. If the voltage is lower than 3 V DC,
                                                                    replace the battery.
      exhausted.
6. The voltage dropped considerably in the                          Check if the recommended wires are being used for the encoder cable.
                                                                    Refer to "Wires for option cables" in the following manual.
      encoder cable wired to the battery.
                                                                    Rotary Servo Motor User's Manual (For MR-J5)
                                                                    Refer to "WIRING OPTION" in the following manual.
                                                                    Direct Drive Motor User's Manual
                                                                    Refer to "OPTION CABLES/CONNECTOR SETS" in the following manual.
                                                                    MR-J5 Partner's Encoder User's Manual

7. There is a problem with the battery cable.                       Check for a loose connection with a tester.
                                                                    If there is a loose connection, use a recommended cable.

8. There is a loose connection of the encoder                       Check for a loose connection with a tester. Measure the voltage on the scale
                                                                    measurement encoder-side.
      cable on the scale measurement encoder-
                                                                    If there is a loose connection, repair or replace the encoder cable.
      side.
9. When the Mitsubishi Electric servo motor                         Make sure that the servo motor shaft will not be rotated by an external force at
                                                                    a high speed.
      equipped with a batteryless absolute position
                                                                    After removing the cause and clearing the alarm, perform homing, then turn
      encoder was used, an external force rotated                   the servo motor shaft at least 180 degrees.
      the servo motor shaft at a high speed at power
      failure.
10. There is a problem with the surrounding                         Check the noise, ambient temperature, and other conditions, and implement
                                                                    appropriate countermeasures for the cause.
      environment when using the Mitsubishi
                                                                    If there is noise, take countermeasures to reduce the noise.
      Electric servo motor equipped with a                          Refer to "Noise reduction techniques" in the following manuals.
      batteryless absolute position encoder.                        MR-J5 User's Manual (Hardware)
                                                                    MR-J5D User's Manual (Hardware)
                                                                    After removing the cause and clearing the alarm, perform homing, then turn
                                                                    the servo motor shaft at least 180 degrees.

11. The servo amplifier has malfunctioned.                          Replace the servo amplifier.

12. The scale measurement encoder has                               Replace the scale measurement encoder.

      malfunctioned.


                                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                                     1.3 Handling methods for alarms/warnings                  57

---

## หน้า 60

[AL. 027_Initial magnetic pole detection error]
     • The initial magnetic pole detection cannot be performed properly.


     [AL. 027.1_Initial magnetic pole detection - Abnormal termination]
     Cause                                                 Check/action method                                                                   Model
     1. A moving part collided against the machine.        If the moving part collides, move the start position of the magnetic pole             [G]
                                                           detection.                                                                            [B]

     2. The wiring of the servo motor power cable is       Check the motor power cable for abnormality.
                                                                                                                                                 [A]
                                                           Refer to "Power supply cable wiring diagrams" in the Linear Servo Motor
          incorrect.
                                                           User's Manual.
                                                           Refer to "Direct drive motor power cable wiring diagram" in the following
                                                           manual.
                                                           Direct Drive Motor User's Manual

     3. The linear encoder resolution setting differs      Check the settings of [Pr. PL02 Linear encoder resolution setting - Numerator]
                                                           and [Pr. PL03 Linear encoder resolution setting - Denominator].
          from the setting value.
     4. The mounting direction of the linear encoder is    Check the polarities of the linear encoder and the linear servo motor.
                                                           If the mounting direction is incorrect, mount the encoder correctly. Change the
          incorrect.
                                                           setting of "Encoder pulse count polarity selection" as required.
                                                           [G] [B]: [Pr. PC27.0 Encoder pulse count polarity selection]
                                                           [A]: [Pr. PC45.0 Encoder pulse count polarity selection]
                                                           Refer to "Setting of linear encoder direction and linear servo motor direction" in
                                                           the following manual.
                                                           MR-J5 User's Manual (Hardware)

     5. The direct current exciting voltage level is too    • When in position detection method
                                                           Check if the travel distance in the magnetic pole detection is small. If the travel
          low.
                                                           distance is small, set a larger value in [Pr. PL09 Magnetic pole detection
                                                           voltage level].
                                                            • When in minute position detection method
                                                           Check if the travel distance in the magnetic pole detection is too large, or if a
                                                           vibration is occurring. If the travel distance is too large or a vibration is
                                                           occurring, review the settings of [Pr. PL17.0 Response selection] and [Pr.
                                                           PL17.1 Load to motor mass ratio/load to motor inertia ratio selection].
                                                           Refer to "Magnetic pole detection" in the following manual.
                                                           MR-J5 User's Manual (Hardware)


     [AL. 027.2_Initial magnetic pole detection - Time out error]
     Cause                                                 Check/action method                                                                   Model
     1. Servo-on was turned on while the primary side      Stop the linear servo motor or the direct drive motor, then turn on the servo-on      [G]
                                                           again.                                                                                [B]
          of the linear servo motor or the rotor of the
                                                                                                                                                 [A]
          direct drive motor was not stopped.
     2. Only one of the limit switches is on during        Check the limit switches and remove the cause.
                                                           Move the start position of the magnetic pole detection.
          magnetic pole detection.
     3. The direct current exciting voltage level is too    • When in position detection method
                                                           Check if the travel distance in the magnetic pole detection is small. If the travel
          low at the time of the initial magnetic pole
                                                           distance is small, set a larger value in [Pr. PL09 Magnetic pole detection
          detection.                                       voltage level].


         1 SERVO AMPLIFIER TROUBLESHOOTING
58       1.3 Handling methods for alarms/warnings

---

## หน้า 61

[AL. 027.3_Initial magnetic pole detection - Limit switch error]
Cause                                                    Check/action method                                                                Model        1
1. In the magnetic pole detection, both limit            Check the limit switch status.                                                     [G]
                                                         If both of the limit switches are turned off, turn on the limit switches.          [B]
      switches are turned off.
                                                         When using a direct drive motor, see also 2.                                       [A]

2. When using a direct drive motor in a system           Check the setting of [Pr. PL08.2 Magnetic pole detection - Stroke limit enabled/
                                                         disabled selection]
      where the motor rotates one revolution or
      more, the following stroke limit signals are not
      disabled with a servo parameter.
[G]: LSP and LSN (FLS and RLS from the controller)
[B]: FLS and RLS
[A]: LSP and LSN

3. The settings of the magnetic pole detection           Check the settings of the servo parameter and other relevant areas.
                                                         Refer to "Magnetic pole detection" in the following manual.
      are incorrect.
                                                         MR-J5 User's Manual (Hardware)


[AL. 027.4_Initial magnetic pole detection - Estimation error]
Page 58 [AL. 027.1_Initial magnetic pole detection - Abnormal termination]


[AL. 027.5_Initial magnetic pole detection - Speed deviation error]
Page 58 [AL. 027.1_Initial magnetic pole detection - Abnormal termination]


[AL. 027.6_Initial magnetic pole detection - Position deviation error]
Page 58 [AL. 027.1_Initial magnetic pole detection - Abnormal termination]


[AL. 027.7_Initial magnetic pole detection - Current error]
Page 58 [AL. 027.1_Initial magnetic pole detection - Abnormal termination]


                                                                                         1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                           1.3 Handling methods for alarms/warnings                 59

---

## หน้า 62

[AL. 028_Linear encoder error 2]
     • There is a problem with the operating environment of the linear encoder.


     [AL. 028.1_Linear encoder environmental error]
     Cause                                                Check/action method                                                           Model
     1. The ambient temperature of the linear encoder     Check the ambient temperature and the specifications of the linear encoder.   [G]
                                                                                                                                        [B]
          is outside of specifications.
                                                                                                                                        [A]
     2. The signal level of the linear encoder dropped. Check the mounting condition of the linear encoder.
     3. A linear encoder alarm was detected.            Refer to "DETAILED EXPLANATION OF [AL. 028 LINEAR ENCODER
                                                          ERROR 2]" in the following manual.
                                                          MR-J5 Partner's Encoder User's Manual


     [AL. 028.2_Load-side linear encoder environmental error]
     Page 60 [AL. 028.1_Linear encoder environmental error]


         1 SERVO AMPLIFIER TROUBLESHOOTING
60       1.3 Handling methods for alarms/warnings

---

## หน้า 63

[AL. 02A_Linear encoder error 1]
• An error of the linear encoder was detected. The content of the errors varies depending on each encoder manufacturer.                       1
[AL. 02A.1_Linear encoder error 1-1]
Cause                                                Check/action method                                                         Model
1. There is a problem with the way that the linear   Adjust the positions of the linear encoder and the head.                    [G]
                                                                                                                                 [B]
     encoder and the head are mounted.
                                                                                                                                 [A]
2. The external conductor of the encoder cable is    Check if the external conductor of the encoder cable is connected to the
                                                     ground plate of the connector.
     not connected to the ground plate of the
                                                     Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
     connector.                                      in the following manual.
                                                     Rotary Servo Motor User's Manual (For MR-J5)

3. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
     environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)

4. A linear encoder alarm was detected.              Refer to "DETAILED EXPLANATION OF [AL. 02A LINEAR ENCODER
                                                     ERROR 1]" in the following manual.
                                                     MR-J5 Partner's Encoder User's Manual


[AL. 02A.2_Linear encoder error 1-2]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


[AL. 02A.3_Linear encoder error 1-3]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


[AL. 02A.4_Linear encoder error 1-4]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


[AL. 02A.5_Linear encoder error 1-5]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


[AL. 02A.6_Linear encoder error 1-6]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


[AL. 02A.7_Linear encoder error 1-7]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


[AL. 02A.8_Linear encoder error 1-8]
Page 61 [AL. 02A.1_Linear encoder error 1-1]


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings            61

---

## หน้า 64

[AL. 02B_Encoder counter error]
     • There is an error in the data created by the encoder.


     [AL. 02B.1_Encoder counter error 1]
     Cause                                                 Check/action method                                                               Model
     1. There is a problem with the encoder cable.         Check if the encoder cable has been disconnected or has shorted.                  [G]
                                                           If there is a problem with the encoder cable, replace or repair the cable, then   [B]
                                                           execute homing.                                                                   [A]

     2. The external conductor of the encoder cable is     Check if the external conductor of the encoder cable is connected to the
                                                           ground plate of the connector.
          not connected to the ground plate of the
                                                           If not connected, connect it correctly, then execute homing.
          connector.                                       Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
                                                           in the following manual.
                                                           Rotary Servo Motor User's Manual (For MR-J5)

     3. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                           appropriate countermeasures for the cause. If there is noise, take
          environment.
                                                           countermeasures to reduce the noise.
                                                           Refer to "Noise reduction techniques" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)
                                                           After removing the cause and clearing the alarm, execute homing.

     4. The encoder has malfunctioned.                     Replace the direct drive motor.


     [AL. 02B.2_Encoder counter error 2]
     Cause                                                 Check/action method                                                               Model
     1. The connection of the servo motor is incorrect.    Check the U/V/W wiring. Refer to "Example power circuit connections" in the       [G]
                                                           following manuals.                                                                [B]
                                                           MR-J5 User's Manual (Hardware)                                                   [A]
                                                           MR-J5D User's Manual (Hardware)

     2. Take actions in accordance with the items shown below.
     Page 62 [AL. 02B.1_Encoder counter error 1]


         1 SERVO AMPLIFIER TROUBLESHOOTING
62       1.3 Handling methods for alarms/warnings

---

## หน้า 65

[AL. 030_Regenerative error]
• The permissible regenerative power of the built-in regenerative resistor or regenerative option was exceeded.                                      1
• The regenerative transistor in the servo amplifier has malfunctioned.


[AL. 030.1_Regenerative heat error]
Cause                                                 Check/action method                                                               Model
1. The settings of the regenerative resistor          Check the regenerative resistor (regenerative option) in use and the setting      [G]
                                                      value of [Pr. PA02 Regenerative option].                                          [B]
     (regenerative option) are incorrect.
                                                      Refer to "Regenerative option" in the following manual.                           [A]
                                                      MR-J5 User's Manual (Hardware)

2. The regenerative resistor (regenerative option)    When the regenerative option is not used, check if P+ and D are connected
                                                      correctly.
     is not connected.
                                                      When the regenerative option is used, disconnect the wiring between P+ and
                                                      D and check if the regenerative option is attached between P+ and C.
                                                      Refer to "Regenerative option" in the following manual.
                                                      MR-J5 User's Manual (Hardware)

3. The regenerative resistor (regenerative option)    Check if the combination of the regenerative resistor (regenerative option) and
                                                      the servo amplifier is correct as specified.
     and the servo amplifier are connected in a
                                                      Refer to "Regenerative option" in the following manual.
     wrong combination.                               MR-J5 User's Manual (Hardware)

4. The power supply voltage is too high.              Check if the voltage of the input power supply exceeds the upper limit of the
                                                      permissible voltage. If the power supply voltage exceeds the upper limit,
                                                      reduce the power supply voltage.
                                                      200 V class: 264 V AC
                                                      400 V class: 528 V AC

5. The regenerative power is too large.               Check whether the regenerative load ratio exceeds the upper limit value when
                                                      the alarm occurs.
                                                      If the alarm is not cleared even after taking the following corrective actions,
                                                      replace the servo amplifier.
                                                       • Reduce the frequency of positioning.
                                                       • Set a longer deceleration time constant.
                                                       • Reduce the load.
                                                       • Use a regenerative option if it is not being used.
                                                       • For a multi-axis servo amplifier, ensure that each axis does not decelerate
                                                          simultaneously.

6. The motor power cable (U/V/W cables) has a         Check if the servo motor power cable has a ground fault. If the servo motor
                                                      power cable has a ground fault, correct the wiring.
     ground fault. (Increase in the bus voltage
     between P and N due to a sneak current
     caused by the ground fault.)


[AL. 030.2_Regenerative signal error]
Cause                                                 Check/action method                                                               Model
1. The servo amplifier has malfunctioned.             Check if the regenerative resistor (regenerative option) is overheating. If the   [G]
                                                      regenerative resistor is overheating, replace the servo amplifier.                [B]
                                                      Check for any of the following wiring problems when connecting the                [A]
                                                      regenerative option.
                                                       • P+ and C are short-circuited.
                                                       • The regenerative option is connected between P+ and C when P+ and D are
                                                         short-circuited.
                                                       • The combination of servo amplifier and regenerative option is incorrect.
                                                         (Resistance of the regenerative option is low, etc.)
                                                      Refer to "Regenerative option" in the following manual.
                                                      MR-J5 User's Manual (Hardware)


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                  63

---

## หน้า 66

[AL. 030.3_Regenerative feedback signal error]
     Cause                                          Check/action method                                                             Model
     1. The servo amplifier has malfunctioned.      Remove the wire of the regenerative option or built-in regenerative resistor,   [G]
                                                    then check if the alarm occurs at power on. If the alarm occurs, replace the    [B]
                                                    servo amplifier.                                                                [A]

     2. There is a problem with the surrounding     Check the noise, ground fault, ambient temperature, and other conditions,
                                                    then take countermeasures against its cause.
         environment.
                                                    If there is noise, take countermeasures to reduce the noise.
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)


         1 SERVO AMPLIFIER TROUBLESHOOTING
64       1.3 Handling methods for alarms/warnings

---

## หน้า 67

[AL. 031_Overspeed]
• The servo motor speed exceeded the maximum speed.                                                                                                       1
[AL. 031.1_Servo motor speed error]
Cause                                                   Check/action method                                                                  Model
1. The command pulse frequency is too high.             Check the command pulse frequency. If the command pulse frequency                    [A]
                                                        exceeds the maximum input pulse frequency, review the operation pattern.

2. The settings of the electronic gear are              Check the setting value of the electronic gear.                                      [G]
                                                        Refer to "Electronic gear function" in the following manual.                         [B]
     incorrect.
                                                        MR-J5 User's Manual (Function)                                                      [A]

3. The command from the controller is excessive. Check if the command from the controller exceeds the maximum speed.                         [G]
                                                        To change the judgment value used to the permissible speed, change the               [B]
                                                        setting of [Pr. PA28.4 Speed range limit selection].

4. The backlash compensation set in the                 Refer to the manual for the controller being used to check if the setting value is
                                                        correct.
     controller is excessive.
5. A speed command exceeding the overspeed              Check that the actual servo motor speed is higher than the overspeed alarm           [G]
                                                        trigger level.                                                                       [B]
     alarm trigger level was input.
                                                                                                                                             [A]
6. The servo motor reaches the maximum torque           Check if the torque (thrust) is the maximum torque (maximum thrust) at the
                                                        acceleration. If the torque (thrust) is the maximum torque (maximum thrust),
     (maximum thrust) at acceleration.
                                                        increase the acceleration/deceleration time constants or reduce the load.

7. The servo system is unstable and oscillating.        Check if the servo motor is oscillating. If the servo motor is oscillating, adjust
                                                        the servo gain or reduce the load.

8. The velocity waveform overshot.                      Check if the velocity waveform has overshot because of the short acceleration/
                                                        deceleration time constant. If the velocity waveform has overshot, increase the
                                                        acceleration/deceleration time constant.

9. The servo motor operation is suddenly                Check the equipment for load interference. If there is load interference,
                                                        remove the cause of the interference.
     interrupted by load interference (such as
                                                        When an external brake is used, check the brake open timing.
     mechanical interference) and then resumed.
10. The connection destination of the servo motor       Check for any incorrect connection destination of the motor power cable or
                                                        encoder cable.
     power cable or the encoder cable is incorrect.
                                                        Refer to "Example power circuit connections" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)

11. The servo motor power cable was                     Check if the motor power cable is disconnected. If the motor power cable is
                                                        disconnected, correct the wiring.
     disconnected. (Instantaneous open-phase due
     to disconnection of one of the U/V/W cables)
12. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                        Refer to "Example power circuit connections" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)
                                                        Refer to "Turning on servo amplifier for the first time" in the User's Manual
                                                        (Introduction).

13. The encoder or linear encoder has                   Check if this alarm occurs when the servo motor rotates at the lower speed
                                                        than the maximum speed. If the alarm occurs, replace the servo motor or the
     malfunctioned.
                                                        linear encoder.
                                                        To change the judgment value used to the permissible speed, change the
                                                        setting of [Pr. PA28.4].


                                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                          1.3 Handling methods for alarms/warnings                   65

---

## หน้า 68

[AL. 032_Overcurrent]
     • A current higher than the permissible current flowed in the servo amplifier.


     [AL. 032.1_Overcurrent detected via hardware detection circuit (during operation)]
     Cause                                                  Check/action method                                                                 Model
     1. The servo amplifier has malfunctioned.              Check if the servo motor power cable has a ground fault. If the servo motor         [G]
                                                            power cable has a ground fault, correct the wiring.                                 [B]
                                                            Check that this alarm occurs as the servo motor power cables (U/V/W) are            [A]
                                                            disconnected.
                                                            If the alarm occurs, replace the servo amplifier.

     2. The servo motor power cable has a ground            Check if the servo motor power cable has shorted.
                                                            If the servo motor power cable has shorted, replace the servo motor power
          fault or has shorted.
                                                            cable.

     3. The servo motor has malfunctioned.                  After disconnecting the servo motor power cables on the servo motor side,
                                                            check the insulation between phases (U/V/W/        or    ).
                                                            If the servo motor has a ground fault or has shorted, replace the servo motor.

     4. The dynamic brake has malfunctioned.                After confirming that the Cause 1, 2, and 3 did not apply, check if this alarm
                                                            occurs when turning on the servo-on command.
                                                            If the alarm occurs, replace the servo amplifier.
                                                            If the alarm does not occur, check 5.

     5. The wiring of the regenerative resistor             If an alarm occurs during regeneration, check if the regenerative resistor
                                                            (regenerative option) is wired correctly and P+ and C are not short-circuited. If
          (regenerative option) is incorrect.
                                                            the regenerative resistor (regenerative option) is wired incorrectly, correct the
                                                            wiring.

     6. The regenerative resistor (regenerative option)     Check if the combination of the regenerative resistor (regenerative option) and
                                                            the servo amplifier is correct as specified.
          and the servo amplifier are connected in a
                                                            Refer to "Regenerative option" in the following manual.
          wrong combination.                                MR-J5 User's Manual (Hardware)

     7. The connection destination of the servo motor       Check the connection destination of the motor power cable or encoder cable.
                                                            Refer to "Example power circuit connections" in the following manuals.
          power cable or the encoder cable is incorrect.
                                                            MR-J5 User's Manual (Hardware)
                                                            MR-J5D User's Manual (Hardware)

     8. There is a problem with the surrounding             Check the noise, ambient temperature, and other conditions, and implement
                                                            appropriate countermeasures for the cause.
          environment.
                                                            If a problem is not found with the surrounding environment, perform the
                                                            following check/action methods.
                                                            Page 78 [AL. 045.1_Main circuit device overheat error 1]
                                                            If there is noise, take countermeasures to reduce the noise.
                                                            Refer to "Noise reduction techniques" in the following manuals.
                                                            MR-J5 User's Manual (Hardware)
                                                            MR-J5D User's Manual (Hardware)


         1 SERVO AMPLIFIER TROUBLESHOOTING
66       1.3 Handling methods for alarms/warnings

---

## หน้า 69

[AL. 032.2_Overcurrent detected via software detection processing (during operation)]
Cause                                                 Check/action method                                                             Model        1
1. The servo gain is too high.                        Check if there is vibration.                                                    [G]
                                                      If there is vibration, reduce the value in [Pr. PB09 Speed control gain].       [B]

2. The servo amplifier has malfunctioned.             Check that this alarm occurs as the servo motor power cables (U/V/W) are
                                                                                                                                      [A]
                                                      disconnected.
                                                      If the alarm occurs, replace the servo amplifier.

3. The servo motor power cable has a ground           Check if the servo motor power cable has a ground fault. If the servo motor
                                                      power cable has a ground fault, correct the wiring.
     fault or has shorted.
                                                      Check if the servo motor power cable has shorted.
                                                      If the servo motor power cable has shorted, replace the servo motor power
                                                      cable.

4. The servo motor has malfunctioned.                 After disconnecting the servo motor power cables on the servo motor side,
                                                      check the insulation between phases (U/V/W/       or    ). If the servo motor
                                                      has a ground fault or has shorted, replace the servo motor.

5. The connection destination of the servo motor      Check the connection destination of the motor power cable or encoder cable.
                                                      Refer to "Example power circuit connections" in the following manuals.
     power cable or the encoder cable is incorrect.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)

6. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                      appropriate countermeasures for the cause.
     environment.
                                                      If there is noise, take countermeasures to reduce the noise.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)


[AL. 032.3_Overcurrent detected via hardware detection circuit (during a stop)]
Page 66 [AL. 032.1_Overcurrent detected via hardware detection circuit (during operation)]


[AL. 032.4_Overcurrent detected via software detection processing (during a stop)]
Page 67 [AL. 032.2_Overcurrent detected via software detection processing (during operation)]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings               67

---

## หน้า 70

[AL. 033_Overvoltage]
     • The value of the bus voltage exceeded the specified value.
     200 V class: 400 V DC
     400 V class: 800 V DC (840 V for the MR-J5D_)


     [AL. 033.1_Main circuit voltage error]
     Cause                                                Check/action method                                                             Model
     1. The settings of the regenerative resistor         Check the regenerative resistor (regenerative option) in use and the setting    [G]
                                                          value of [Pr. PA02.0-1 Regenerative option selection].                          [B]
          (regenerative option) are incorrect.
                                                          Refer to "Regenerative option" in the following manual.                         [A]
                                                          MR-J5 User's Manual (Hardware)

     2. The regenerative resistor (regenerative option)   When the regenerative option is not used, check if P+ and D are connected
                                                          correctly.
          is not connected.
                                                          When the regenerative option is used, disconnect the wiring between P+ and
                                                          D and check if the regenerative option is attached between P+ and C.
                                                          Refer to "Regenerative option" in the following manual.
                                                          MR-J5 User's Manual (Hardware)

     3. The built-in regenerative resistor or             Measure the resistance value of the built-in regenerative resistor or
                                                          regenerative option.
          regenerative option is disconnected.
                                                          If the resistance value is abnormal, take corrective actions as follows:
                                                           • When using a built-in regenerative resistor, replace the servo amplifier.
                                                           • When using a regenerative option, replace the regenerative option.
                                                          Refer to "Regenerative option" in the following manual.
                                                          MR-J5 User's Manual (Hardware)

     4. The regeneration capacity is insufficient.        Set a longer deceleration time constant, then check the repeatability.
                                                          If the error does not repeat, take corrective actions as follows:
                                                           • When using a built-in regenerative resistor, use a regenerative option.
                                                           • When using a regenerative option, use one with a larger capacity.

     5. The power supply voltage is too high.             Check if the voltage of the input power supply exceeds the upper limit of the
                                                          permissible voltage. If the power supply voltage exceeds the upper limit,
                                                          reduce the power supply voltage.
                                                          200 V class: 264 V AC
                                                          400 V class: 528 V AC

     6. The motor power cable (U/V/W cables) has a        Check if the servo motor power cable has a ground fault. If the servo motor
                                                          power cable has a ground fault, correct the wiring.
          ground fault. (Increase in the bus voltage
                                                          If the motor power cable is wired over a long distance or a shielded wire is
          between P and N due to a sneak current          used, a charging phenomenon may occur due to the stray capacitance in the
          caused by the ground fault.)                    wiring.
                                                          Review and correct the wiring condition by means such as using a shorter
                                                          cable and removing the shielded wire.

     7. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                          appropriate countermeasures for the cause.
          environment.
                                                          If there is noise, take countermeasures to reduce the noise.
                                                          Refer to "Noise reduction techniques" in the following manuals.
                                                          MR-J5 User's Manual (Hardware)
                                                          MR-J5D User's Manual (Hardware)

     8. The servo amplifier has malfunctioned.            Check the value of the bus voltage. If the bus voltage exceeds the specified
                                                          value even though the voltage of the main circuit power supply is within the
                                                          specifications, replace the servo amplifier.


          1 SERVO AMPLIFIER TROUBLESHOOTING
68        1.3 Handling methods for alarms/warnings

---

## หน้า 71

[AL. 034_SSCNET receive error 1]
• An error occurred in SSCNET III/H communication. (Communication error for a continuous time of 3.5 ms)                                               1
[AL. 034.1_SSCNET receive data error]
Cause                                                Check/action method                                                                  Model
1. An SSCNET III cable is disconnected.              Check if the SSCNET III cable is connected correctly.                                [B]
                                                     Turn off the control circuit power supply of the servo amplifier, then connect the
                                                     SSCNET III cable correctly.

2. An SSCNET III cable end is dirty.                 Wipe the dirt off the cable end, then check the repeatability. If the error does
                                                     not repeat, take preventive measures so that the SSCNET III cable end does
                                                     not become dirty.

3. An SSCNET III cable is broken or                  Check the SSCNET III cable for abnormality. If there is a problem with the
                                                     SSCNET III cable, replace the cable.
     disconnected.
4. Vinyl tape has been applied to an SSCNET III      Check if vinyl tape has been used.
                                                     If it has been used, implement appropriate countermeasures for the cause.
     cable.
5. A wire insulator containing migratory             Check if the cable comes into contact with other cables.
                                                     If the cables are contacting, implement appropriate countermeasures for the
     plasticizer adhered to an SSCNET III cable.
                                                     cause.

6. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
     environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manual.
                                                     MR-J5 User's Manual (Hardware)

7. The servo amplifier has malfunctioned.            Replace the servo amplifier, then check the repeatability. If the error does not
                                                     repeat, replace the servo amplifier.

8. An alarm occurred in a servo amplifier, and the   Replace the servo amplifier of the previous or next axis, then check the
                                                     repeatability. If the error does not repeat, replace the servo amplifier.
     servo amplifier of the previous or next axis
     malfunctioned.
9. The controller has malfunctioned.                 Replace the controller, then check the repeatability. If the error does not
                                                     repeat, replace the controller.


[AL. 034.2_SSCNET connector connection error]
Page 69 [AL. 034.1_SSCNET receive data error]


[AL. 034.3_SSCNET communication data error]
Page 69 [AL. 034.1_SSCNET receive data error]


[AL. 034.4_Hardware error signal detection]
Page 69 [AL. 034.1_SSCNET receive data error]


[AL. 034.7_SSCNET communication data error 2]
Page 69 [AL. 034.1_SSCNET receive data error]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                    69

---

## หน้า 72

[AL. 035_Command frequency error]
     • The input command pulse frequency is too high.


     [AL. 035.1_Command frequency error]
     Cause                                                    Check/action method                                                                  Model
     1. The command pulse frequency is too high.              Check the command pulse frequency, and if the command pulse frequency                [A]
                                                              exceeds the maximum input pulse frequency, review the operation pattern.

     2. The setting of [Pr. PA13.2 Command input              Check that the setting value of [Pr. PA13.2] is the value that matches the
                                                              command pulse frequency.
          pulse train filter selection] is incorrect.
     3. The command from the controller is excessive. Check if the command from the controller exceeds the maximum speed. If the                   [G]
                                                              command exceeds the maximum speed, review the operation pattern.                     [B]
                                                              To change the judgment value used to the permissible speed, change the
                                                              setting of [Pr. PA28.4 Speed range limit selection].

     4. The backlash compensation set in the                  Refer to the manual for the controller being used to check if the setting value is
                                                              correct.
          controller is excessive.
     5. The setting value of [Pr. PC90 Command                Check the command pulse frequency, and if the command pulse frequency                [A]
                                                              exceeds the setting value, increase the setting value.
          frequency error threshold] is too low.
     6. The controller has malfunctioned.                     Replace the controller.                                                              [G]

     7. There is a problem with the surrounding               Check the noise, ambient temperature, and other conditions, and implement            [G]
                                                              appropriate countermeasures for the cause.                                           [B]
          environment.
                                                              If there is noise, take countermeasures to reduce the noise.                         [A]
                                                              Refer to "Noise reduction techniques" in the following manuals.
                                                              MR-J5 User's Manual (Hardware)
                                                              MR-J5D User's Manual (Hardware)


         1 SERVO AMPLIFIER TROUBLESHOOTING
70       1.3 Handling methods for alarms/warnings

---

## หน้า 73

[AL. 036_SSCNET receive error 2]
• An error occurred in SSCNET III/H communication. (Communication error for an intermittent time of about 70 ms)                                       1
[AL. 036.1_Intermittent communication data error]
Cause                                                Check/action method                                                                  Model
1. An SSCNET III cable is disconnected.              Check if the SSCNET III cable is connected correctly.                                [B]
                                                     Turn off the control circuit power supply of the servo amplifier, then connect the
                                                     SSCNET III cable correctly.

2. An SSCNET III cable end is dirty.                 Wipe the dirt off the cable end, then check the repeatability. If the error does
                                                     not repeat, take preventive measures so that the SSCNET III cable end does
                                                     not become dirty.

3. An SSCNET III cable is broken or                  Check the SSCNET III cable for abnormality. If there is a problem with the
                                                     SSCNET III cable, replace the cable.
     disconnected.
4. Vinyl tape has been applied to an SSCNET III      Check if vinyl tape has been used. If it has been used, implement appropriate
                                                     countermeasures for the cause.
     cable.
5. A wire insulator containing migratory             Check if the cable comes into contact with other cables.
                                                     If the cables are contacting, implement appropriate countermeasures for the
     plasticizer adhered to an SSCNET III cable.
                                                     cause.

6. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
     environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manual.
                                                     MR-J5 User's Manual (Hardware)

7. The servo amplifier has malfunctioned.            Replace the servo amplifier, then check the repeatability. If the error does not
                                                     repeat, replace the servo amplifier.

8. An alarm occurred in a servo amplifier, and the   Replace the servo amplifier of the previous or next axis, then check the
                                                     repeatability. If the error does not repeat, replace the servo amplifier.
     servo amplifier of the previous or next axis
     malfunctioned.
9. The controller has malfunctioned.                 Replace the controller, then check the repeatability. If the error does not
                                                     repeat, replace the controller.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                    71

---

## หน้า 74

[AL. 037_Parameter error]
     • Servo parameter setting values are incorrect.
     • Point table setting values are incorrect.


     [AL. 037.1_Parameter setting range error]
     Cause                                                  Check/action method                                                                Model
     1. A parameter was set outside of the setting          [G] [B]: Check the parameter error No. on the alarm display screen of MR           [G]
                                                            Configurator2 or with another method, then review the setting value of the         [B]
          range.
                                                            parameter.                                                                         [A]
                                                            [A]: Check the parameter error No. on the parameter error No. display screen
                                                            of the servo amplifier display, the alarm display screen of MR Configurator2, or
                                                            with another method, and review the setting value of the parameter.

     2. An inconsistent combination of parameters           [G] [B]: Check the parameter error No. on the alarm display screen of MR
                                                            Configurator2 or with another method, then review the setting value of the
          has been set.
                                                            parameter.
                                                            [A]: Check the parameter error No. on the parameter error No. display screen
                                                            of the servo amplifier display, the alarm display screen of MR Configurator2, or
                                                            with another method, and review the setting value of the parameter.

     3. The setting value of the parameter has              Replace the servo amplifier.

          changed due to the servo amplifier
          malfunction.


     [AL. 037.2_Parameter combination error]
     Cause                                                  Check/action method                                                                Model
     1. An inconsistent combination of parameters           [G] [B]: Check the parameter error No. on the alarm display screen of MR           [G]
                                                            Configurator2 or with another method, then review the setting value of the         [B]
          has been set.
                                                            parameter.                                                                         [A]
                                                            [A]: Check the parameter error No. on the parameter error No. display screen
                                                            of the servo amplifier display, the alarm display screen of MR Configurator2, or
                                                            with another method, and review the setting value of the parameter.

     2. When the master-slave operation function is         Set [Pr. PA01.1] to "0" (standard control mode).                                   [G]
                                                                                                                                               [B]
          enabled, [Pr. PA01.1 Operation mode
          selection] on the master side is set to a value
          other than "0" (standard control mode).
     3. When the master-slave operation function is         Set [Pr. PA01.1] to "0" (standard control mode).

          enabled, [Pr. PA01.1 Operation mode
          selection] on the slave side is set to a value
          other than "0" (standard control mode).
     4. When the master-slave function is enabled,          Set [Pr. PA04.3] to "0" (Forced stop deceleration function disabled).              [B]

          [Pr. PA04.3 Forced stop deceleration function
          selection] is set to "2" (Forced stop
          deceleration function enabled).


     [AL. 037.3_Point table setting error]
     Cause                                                  Check/action method                                                                Model
     1. Point table setting values are incorrect.           Check if the setting value of the point table is within the setting range.         [G]
                                                            Check the error number of the point table with [Point table error No.(Obj.
                                                            2A43h: 01h)]. Or check the setting value in the point table screen of MR
                                                            Configurator2.

     2. The setting value of the point table has            Replace the servo amplifier.

          changed due to the servo amplifier
          malfunction.


         1 SERVO AMPLIFIER TROUBLESHOOTING
72       1.3 Handling methods for alarms/warnings

---

## หน้า 75

[AL. 037.6_Parameter mismatch error]
Cause                                                 Check/action method                                                                Model        1
1. Mismatching with the saved parameters              [G] [B]: Check the parameter error No. on the alarm display screen of MR           [G]
                                                      Configurator2 or with another method. Rewrite the setting value because the        [B]
     occurred because of the error in writing
                                                      value before or after writing has been displayed.                                  [A]
     parameters.                                      [A]: Check the parameter error No. on the parameter error No. display screen
                                                      of the servo amplifier display, the alarm display screen of MR Configurator2, or
                                                      another method. Rewrite the setting value because the value before or after
                                                      writing has been displayed.

2. The setting value of the parameter changed as      Replace the servo amplifier.

     the servo amplifier malfunctioned.


[AL. 037.7_Network parameter setting error]
Cause                                                 Check/action method                                                                Model
1. There is a problem with the network parameter      Check if the setting value of the network parameter is within the setting range.   [G]
                                                      [G]: Check the servo parameter error No. on the alarm display screen of MR         [A]
     settings.
                                                      Configurator2 or with another method. Rewrite the setting value because the
                                                      value before or after writing has been displayed.
                                                      [A]: Check the parameter error No. on the parameter error No. display screen
                                                      of the servo amplifier display, the alarm display screen of MR Configurator2, or
                                                      another method. Rewrite the setting value because the value before or after
                                                      writing has been displayed.

2. The setting value of the network parameter         Replace the servo amplifier.

     changed as the servo amplifier malfunctioned.

[AL. 03A_Inrush current suppression circuit error]
• The inrush current suppression circuit error was detected.


[AL. 03A.1_Inrush current suppression circuit error]
Cause                                                 Check/action method                                                                Model
1. The inrush current limit resistor is overheated    Review the usage.                                                                  [G]
                                                                                                                                         [B]
     due to frequent power ON/OFF.
                                                                                                                                         [A]
2. The servo amplifier has malfunctioned.             Replace the servo amplifier.


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings                  73

---

## หน้า 76

[AL. 03D_Driver communication parameter setting error]
     • The setting values of control parameters for inter-driver communication are incorrect.


     [AL. 03D.1_Slave-side driver communication parameter combination error]
     Cause                                                 Check/action method                                                                Model
     1. The master-side transmission data selection        Review the settings of "Driver communication setting - Master - Transmit data      [B]
                                                           selection 1" and "Driver communication setting - Master - Transmit data
          for inter-driver communication has not been
                                                           selection 2" with the following parameters.
          set correctly.                                   [B]: [Pr. PD16 Driver communication setting - Master - Transmit data selection
                                                           1] and [Pr. PD17 Driver communication setting - Master - Transmit data
                                                           selection 2]


     [AL. 03D.2_Master-side driver communication parameter combination error]
     Page 74 [AL. 03D.1_Slave-side driver communication parameter combination error]

     [AL. 03E_Operation mode error]
     • The operation mode settings have been changed.


     [AL. 03E.4_Control command mismatch 1]
     Cause                                                 Check/action method                                                                Model
     1. The control mode of the MR-J5-_B_-LL servo         Check if the control mode was switched to the torque control mode.                 [B]
                                                           If the control mode was switched, review the controller setting.
          amplifier was switched to the torque control
          mode.


     [AL. 03E.5_Control command mismatch 2]
     Cause                                                 Check/action method                                                                Model
     1. The control mode of the MR-J5-_B_-LL servo         Check if the control mode was switched to the continuous operation to torque       [B]
                                                           control mode.
          amplifier was switched to the continuous
                                                           If the control mode was switched, review the controller setting.
          operation to torque control mode.


     [AL. 03E.9_Connection mode error 1]
     Cause                                                 Check/action method                                                                Model
     1. When an SSCNET III/H controller is                 Restore the settings of the servo amplifier to the factory settings by using the   [B]
                                                           application "MR Mode Change" came with MR Configurator2, set the
          connected, the operation mode is not set to
                                                           operation mode of the controller to MR-J5, then establish a connection.
          MR-J5.


         1 SERVO AMPLIFIER TROUBLESHOOTING
74       1.3 Handling methods for alarms/warnings

---

## หน้า 77

[AL. 042_Servo control error]
• A servo control error occurred. (When a linear servo motor or a direct drive motor is used or in a fully closed loop control)                          1
[AL. 042.1_Servo control error based on position deviation]
Cause                                                  Check/action method                                                                  Model
1. [Pr. PA17 Servo motor series setting] and [Pr.      Check if [Pr. PA17] and [Pr. PA18] have been set correctly.                          [G]
                                                                                                                                            [B]
     PA18 Servo motor type setting] were not set
                                                                                                                                            [A]
     based on the servo motor to be used.
2. The settings of the encoder resolution differ       Check the settings of [Pr. PL02 Linear encoder resolution setting - Numerator]
                                                       and [Pr. PL03 Linear encoder resolution setting - Denominator].
     from the actual value.
                                                       Refer to "Linear encoder resolution setting" in the following manual.
                                                       MR-J5 User's Manual (Hardware)

3. The mounting direction of the encoder is            Check the polarities of the linear encoder and the linear servo motor.
                                                       If the mounting direction is incorrect, mount the encoder correctly.
     incorrect.
                                                       Change the setting of "Encoder pulse count polarity selection" as required.
                                                       [G] [B]: [Pr. PC27.0 Encoder pulse count polarity selection]
                                                       [A]: [Pr. PC45.0 Encoder pulse count polarity selection]
                                                       Refer to "Setting of linear encoder direction and linear servo motor direction" in
                                                       the following manual.
                                                       MR-J5 User's Manual (Hardware)

4. The connection of the servo motor is incorrect. Check the wiring.
                                                       Refer to "SIGNALS AND WIRING" in the following manual.
                                                       MR-J5 User's Manual (Hardware)

5. The initial magnetic pole detection was not         Execute the magnetic pole detection, then check the repeatability.
                                                       Refer to "Magnetic pole detection" in the following manual.
     executed.
                                                       MR-J5 User's Manual (Hardware)

6. The setting value of the position deviation         Check the value of the droop pulses.
                                                       If the deviation is too large, review the operation status. Review the setting of
     error detection level is too low.
                                                       [Pr. PL05 Position deviation error detection level] as required.


[AL. 042.2_Servo control error based on speed deviation]
Cause                                                  Check/action method                                                                  Model
1. [Pr. PA17 Servo motor series setting] and [Pr.      Check if [Pr. PA17] and [Pr. PA18] have been set correctly.                          [G]
                                                                                                                                            [B]
     PA18 Servo motor type setting] were not set
                                                                                                                                            [A]
     based on the servo motor to be used.
2. The settings of the encoder resolution differ       Check the settings of [Pr. PL02 Linear encoder resolution setting - Numerator]
                                                       and [Pr. PL03 Linear encoder resolution setting - Denominator].
     from the actual value.
                                                       Refer to "Linear encoder resolution setting" in the following manual.
                                                       MR-J5 User's Manual (Hardware)

3. The mounting direction of the encoder is            Check the polarities of the linear encoder and the linear servo motor.
                                                       Change the setting of "Encoder pulse count polarity selection" as required.
     incorrect.
                                                       [G] [B]: [Pr. PC27.0 Encoder pulse count polarity selection]
                                                       [A]: [Pr. PC45.0 Encoder pulse count polarity selection]
                                                       Refer to "Setting of linear encoder direction and linear servo motor direction" in
                                                       the following manual.
                                                       MR-J5 User's Manual (Hardware)

4. The connection of the servo motor is incorrect. Check the wiring.
                                                       Refer to "SIGNALS AND WIRING" in the following manual.
                                                       MR-J5 User's Manual (Hardware)

5. The initial magnetic pole detection was not         Execute the magnetic pole detection, then check the repeatability.
                                                       Refer to "Magnetic pole detection" in the following manual.
     executed.
                                                       MR-J5 User's Manual (Hardware)

6. The setting value of the speed deviation error      Calculate the deviation between the speed command and actual speed. If the
                                                       deviation is too large, review the operation status. Review the setting of [Pr.
     detection level is too low.
                                                       PL06 Speed deviation error detection level] as required.


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings                    75

---

## หน้า 78

[AL. 042.3_Servo control error based on torque/thrust deviation]
     Cause                                                 Check/action method                                                                  Model
     1. [Pr. PA17 Servo motor series setting] and [Pr.     Check if [Pr. PA17] and [Pr. PA18] have been set correctly.                          [G]
                                                                                                                                                [B]
          PA18 Servo motor type setting] were not set
                                                                                                                                                [A]
          based on the servo motor to be used.
     2. The settings of the encoder resolution differ      Check the settings of [Pr. PL02 Linear encoder resolution setting - Numerator]
                                                           and [Pr. PL03 Linear encoder resolution setting - Denominator].
          from the actual value.
                                                           Refer to "Linear encoder resolution setting" in the following manual.
                                                           MR-J5 User's Manual (Hardware)

     3. The mounting direction of the encoder is           Check the polarities of the linear encoder and the linear servo motor.
                                                           Change the setting of "Encoder pulse count polarity selection" as required.
          incorrect.
                                                           [G] [B]: [Pr. PC27.0 Encoder pulse count polarity selection]
                                                           [A]: [Pr. PC45.0 Encoder pulse count polarity selection]
                                                           Refer to "Setting of linear encoder direction and linear servo motor direction" in
                                                           the following manual.
                                                           MR-J5 User's Manual (Hardware)

     4. The connection of the servo motor is incorrect. Check the wiring.
                                                           Refer to "SIGNALS AND WIRING" in the following manual.
                                                           MR-J5 User's Manual (Hardware)

     5. The initial magnetic pole detection was not        Check the repeatability.
                                                           Refer to "Magnetic pole detection" in the following manual.
          executed.
                                                           MR-J5 User's Manual (Hardware)

     6. The setting value in the torque/thrust deviation   Calculate the deviation between the current command and torque/thrust. If the
                                                           deviation is too large, review the power-supply environment or the operation
          error detection level is too low.
                                                           status. Review the setting of [Pr. PL07 Torque deviation error detection level]
                                                           as required.


     [AL. 042.8_Fully closed loop control error based on position deviation]
     Cause                                                 Check/action method                                                                  Model
     1. The settings of the load-side encoder              Check the settings of [Pr. PE04 Fully closed loop control - Feedback pulse           [G]
                                                           electronic gear 1 - Numerator] and [Pr. PE05 Fully closed loop control -             [B]
          resolution differ from the actual value.
                                                           Feedback pulse electronic gear 1 - Denominator].                                     [A]

     2. The mounting direction of the load-side            Check the mounting direction of the load-side encoder.
                                                           Change the setting of "Encoder pulse count polarity selection" as required.
          encoder is incorrect.
                                                           [G] [B]: [Pr. PC27.0 Encoder pulse count polarity selection]
                                                           [A]: [Pr. PC45.0 Encoder pulse count polarity selection]
                                                           Refer to "Checking position data of the load-side encoder" in the following
                                                           manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

     3. The setting value of the position deviation        Check the value of the motor-side/load-side position deviation.
                                                           If the deviation is too large, review the mechanism of the equipment or the
          error detection level is too low.
                                                           operation status. Review the setting of [Pr. PE03 Fully closed loop control error
                                                           - Detection function selection] or [Pr. PE07 Fully closed loop control - Position
                                                           deviation error detection level] as required.


         1 SERVO AMPLIFIER TROUBLESHOOTING
76       1.3 Handling methods for alarms/warnings

---

## หน้า 79

[AL. 042.9_Fully closed loop control error based on speed deviation]
Cause                                               Check/action method                                                                 Model        1
1. The settings of the load-side encoder            Check the settings of [Pr. PE04 Fully closed loop control - Feedback pulse          [G]
                                                    electronic gear 1 - Numerator] and [Pr. PE05 Fully closed loop control -            [B]
     resolution differ from the setting value.
                                                    Feedback pulse electronic gear 1 - Denominator].                                    [A]

2. The mounting direction of the load-side          Check the mounting direction of the load-side encoder.
                                                    Change the setting of "Encoder pulse count polarity selection" as required.
     encoder is incorrect.
                                                    [G] [B]: [Pr. PC27.0 Encoder pulse count polarity selection]
                                                    [A]: [Pr. PC45.0 Encoder pulse count polarity selection]
                                                    Refer to "Checking position data of the load-side encoder" in the following
                                                    manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)

3. The setting value of the speed deviation error   Calculate the motor-side/load-side speed deviation.
                                                    If the deviation is too large, review the mechanism of the equipment or the
     detection level is too low.
                                                    operation status. Review the setting of [Pr. PE03 Fully closed loop control error
                                                    - Detection function selection] or [Pr. PE06 Fully closed loop control - Speed
                                                    deviation error detection level] as required.


[AL. 042.A_Fully closed loop control error based on position deviation during
command stop]
Page 76 [AL. 042.8_Fully closed loop control error based on position deviation]


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings                   77

---

## หน้า 80

[AL. 045_Main circuit device overheat]
     • The inside of the servo amplifier overheated.


     [AL. 045.1_Main circuit device overheat error 1]
     Cause                                                      Check/action method                                                           Model
     1. The ambient temperature exceeded the                    Check the ambient temperature, and if the temperature exceeds the specified   [G]
                                                                value, lower the ambient temperature.                                         [B]
          specified value (60 °C).
                                                                                                                                              [A]
     2. The servo amplifier does not meet the                   Check the specifications of close mounting.
                                                                Refer to "Mounting direction and clearances" in the following manual.
          specifications of close mounting.
                                                                MR-J5 User's Manual (Hardware)

     3. The power was turned on and off repeatedly              Check if the overload status occurred frequently.
                                                                If the overload status occurred frequently, review the operation pattern.
          under the overload status.
     4. A cooling fan, heat sink, or opening is clogged. Clean the cooling fan, heat sink, or openings.
     5. The servo amplifier has malfunctioned.           Replace the servo amplifier.


     [AL. 045.2_Main circuit device overheat error 2]
     Page 78 [AL. 045.1_Main circuit device overheat error 1]


         1 SERVO AMPLIFIER TROUBLESHOOTING
78       1.3 Handling methods for alarms/warnings

---

## หน้า 81

[AL. 046_Servo motor overheat]
• The servo motor overheated.                                                                                                                               1
[AL. 046.1_Servo motor temperature error 1]
Cause                                                       Check/action method                                                                Model
1. The ambient temperature of the servo motor               Check the ambient temperature of the servo motor, and if the temperature           [G]
                                                            exceeds the specified value, lower the ambient temperature.                        [B]
     has exceeded the specified value.
                                                            Refer to "Environment" in the following manuals.                                   [A]
                                                            Rotary Servo Motor User's Manual (For MR-J5)
                                                            Direct Drive Motor User's Manual
                                                            Refer to "Environment" in the Linear Servo Motor User's Manual.

2. The servo motor is overloaded.                           Check the effective load ratio.
                                                            If the effective load ratio exceeds 100 %, reduce the load or review the
                                                            operation pattern.

3. The thermal sensor in the encoder has                    Check the servo motor temperature when the alarm occurs. If the servo motor
                                                            temperature is too low, the thermal sensor in the encoder is faulty. Replace the
     malfunctioned.
                                                            servo motor.


[AL. 046.2_Servo motor temperature error 2]
Cause                                                       Check/action method                                                                Model
1. The ambient temperature of the linear servo              Check the ambient temperature of the linear servo motor, direct drive motor, or    [G]
                                                            servo motor with thermistors. If the ambient temperature exceeds the specified     [B]
     motor, direct drive motor, or servo motor with
                                                            value, lower the ambient temperature.                                              [A]
     thermistors has exceeded the specified value.          Refer to "Environment" in the following manuals.
                                                            Rotary Servo Motor User's Manual (For MR-J5)
                                                            Direct Drive Motor User's Manual
                                                            Refer to "Environment" in the Linear Servo Motor User's Manual.

2. The servo motor is overloaded.                           Check the effective load ratio.
                                                            If the effective load ratio exceeds 100 %, reduce the load or review the
                                                            operation pattern.

3. There is a problem with the thermistor wire.             Check if the thermistor wire has shorted. If the thermistor wire has shorted,
                                                            replace or repair the cable. If the thermistor wire has not shorted, replace the
                                                            servo motor.


[AL. 046.3_Thermistor disconnected error]
Cause                                                       Check/action method                                                                Model
1. A servo motor thermistor wire is not                     Check if the servo motor thermistor wire is connected.                             [G]
                                                                                                                                               [B]
     connected.
                                                                                                                                               [A]
2. A servo motor thermistor wire is disconnected. Check for disconnection in the servo motor thermistor wire. If the servo motor
                                                            thermistor wire is disconnected, repair the wire.


[AL. 046.4_Thermistor circuit error]
Cause                                                       Check/action method                                                                Model
1. The thermistor circuit of the servo amplifier            Replace the servo amplifier.                                                       [G]
                                                                                                                                               [B]
     has malfunctioned.
                                                                                                                                               [A]


[AL. 046.5_Servo motor temperature error 3]
Page 79 [AL. 046.1_Servo motor temperature error 1]


                                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                             1.3 Handling methods for alarms/warnings                  79

---

## หน้า 82

[AL. 046.6_Servo motor temperature error 4]
     Cause                                            Check/action method                                                                Model
     1. A current larger than the continuous output   Check the effective load ratio.                                                    [G]
                                                      If the effective load ratio is too high, reduce the load or review the operation   [B]
         current of the servo motor flowed.
                                                      pattern. Alternatively, replace the servo motor with a larger-capacity servo       [A]
                                                      motor.


     [AL. 046.7_Servo motor temperature error 5]
     Cause                                            Check/action method                                                                Model
     1. Values of the servo parameters for            Set the servo parameters for manufacturer setting to the initial values.           [G]
                                                                                                                                         [B]
         manufacturer setting have been changed.
                                                                                                                                         [A]


         1 SERVO AMPLIFIER TROUBLESHOOTING
80       1.3 Handling methods for alarms/warnings

---

## หน้า 83

[AL. 047_Cooling fan error]
• The speed of the servo amplifier cooling fan decreased.                                                                                          1
• The fan speed decreased to 30 % or less of the rated speed of the alarm occurrence level.


[AL. 047.1_Cooling fan stop error]
Cause                                                Check/action method                                                              Model
1. A foreign object was caught in the cooling fan.   Check if a foreign object is caught in the cooling fan. If a foreign object is   [G]
                                                     found, remove it.                                                                [B]

2. The cooling fan has contaminated and              Check the condition of the cooling fan. If it is contaminated and damaged,
                                                                                                                                      [A]
                                                     replace the fan unit.
     damaged. (Contamination and damage due to
                                                     Review the usage environment as needed.
     oil or other liquid ingress)
3. The cooling fan has reached the end of its        Replace the fan unit.

     service life.
4. The servo amplifier has malfunctioned.            Replace the servo amplifier.


[AL. 047.2_Decreased cooling fan speed error]
Cause                                                Check/action method                                                              Model
1. A foreign object was caught in the cooling fan.   Check if a foreign object is caught in the cooling fan. If a foreign object is   [G]
                                                     found, remove it.                                                                [B]

2. The cooling fan has contaminated and              Check the condition of the cooling fan. If it is contaminated and damaged,
                                                                                                                                      [A]
                                                     replace the fan unit.
     damaged. (Contamination and damage due to
                                                     Review the usage environment as needed.
     oil or other liquid ingress)
3. The cooling fan has reached the end of its        Replace the fan unit.

     service life.


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings               81

---

## หน้า 84

[AL. 050_Overload 1]
     • The load exceeded the overload protection characteristics of the servo amplifier.


     [AL. 050.1_Thermal overload error 1 during operation]
     Cause                                                 Check/action method                                                                   Model
     1. The servo motor power cable was                    Check the servo motor power cable, then repair or replace the cable.                  [G]
                                                                                                                                                 [B]
          disconnected.
                                                                                                                                                 [A]
     2. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                           Refer to "Example power circuit connections" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

     3. The electromagnetic brake has not been             Check if the electromagnetic brake has been released during operation.

          released. (The electromagnetic brake has
          been activated.)
     4. A current larger than the continuous output        Check the effective load ratio and operation pattern.
                                                           If the effective load ratio is too high, reduce the load or replace the servo motor
          current of the servo motor flowed.
                                                           with a larger-capacity servo motor.
                                                           Alternatively, review the operation pattern.

     5. For a multi-axis servo amplifier, the connection   Check the connection destinations of CN2A, CN2B, and CN2C.                            [G]
                                                                                                                                                 [B]
          destination of the encoder cable is incorrect.
     6. The servo system is unstable and resonating.       Adjust the gain so that the system does not resonate.                                 [G]
                                                           Refer to the following manual.                                                        [B]
                                                           MR-J5 User's Manual (Adjustment)                                                     [A]

     7. The servo amplifier has malfunctioned.             Replace the servo amplifier.

     8. The encoder (servo motor) or linear encoder        Replace the servo motor or linear encoder.

          has malfunctioned.
     9. There is a problem with the mounting               Check the servo motor shaft for any eccentric load due to a center deviation. If
                                                           there is a problem, review the mounting environment.
          environment of the servo motor.


     [AL. 050.2_Thermal overload error 2 during operation]
     Page 82 [AL. 050.1_Thermal overload error 1 during operation]


     [AL. 050.3_Thermal overload error 4 during operation]
     Page 82 [AL. 050.1_Thermal overload error 1 during operation]


         1 SERVO AMPLIFIER TROUBLESHOOTING
82       1.3 Handling methods for alarms/warnings

---

## หน้า 85

[AL. 050.4_Thermal overload error 1 during a stop]
Cause                                                 Check/action method                                                                   Model        1
1. A moving part collided against the machine.        Review the operation pattern to avoid collision.                                      [G]
                                                      Check that there is no interference with the machine.                                 [B]

2. The servo motor power cable was                    Check the servo motor power cable, then repair or replace the cable.
                                                                                                                                            [A]

     disconnected.
3. Hunting occurs during servo-lock.                  Adjust the gain so that hunting does not occur.
                                                      Refer to the following manual.
                                                      MR-J5 User's Manual (Adjustment)

4. The electromagnetic brake has not been             Check if the electromagnetic brake has been released during operation.

     released. (The electromagnetic brake has
     been activated.)
5. A current larger than the continuous output        Check the effective load ratio and operation pattern.
                                                      If the effective load ratio is too high, reduce the load or replace the servo motor
     current of the servo motor flowed.
                                                      with a larger-capacity servo motor.
                                                      Alternatively, review the operation pattern.

6. For a multi-axis servo amplifier, the connection   Check the connection destinations of CN2A, CN2B, and CN2C.                            [G]
                                                                                                                                            [B]
     destination of the encoder cable is incorrect.
7. The servo system is unstable and resonating.       Adjust the gain so that the system does not resonate.                                 [G]
                                                      Refer to the following manual.                                                        [B]
                                                      MR-J5 User's Manual (Adjustment)                                                     [A]

8. The servo amplifier has malfunctioned.             Replace the servo amplifier.

9. The encoder (servo motor) or linear encoder        Replace the servo motor or linear encoder.

     has malfunctioned.


[AL. 050.5_Thermal overload error 2 during a stop]
Page 83 [AL. 050.4_Thermal overload error 1 during a stop]


[AL. 050.6_Thermal overload error 4 during a stop]
Page 83 [AL. 050.4_Thermal overload error 1 during a stop]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings                     83

---

## หน้า 86

[AL. 051_Overload 2]
     • Maximum output current continuously flowed due to machine collision or other causes.


     [AL. 051.1_Thermal overload error 3 during operation]
     Cause                                                 Check/action method                                                                Model
     1. The servo motor power cable was                    Repair or replace the servo motor power cable.                                     [G]
                                                                                                                                              [B]
          disconnected.
                                                                                                                                              [A]
     2. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                           Refer to "Example power circuit connections" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

     3. The connection of the encoder cable is             Check if the encoder cable is connected correctly.

          incorrect.
     4. The torque is insufficient.                        Check the peak load ratio. If the torque is saturated, reduce the load or review
                                                           the operation pattern.
                                                           Alternatively, replace the servo motor with a larger-capacity servo motor.

     5. The servo amplifier has malfunctioned.             Replace the servo amplifier.

     6. The encoder (servo motor) or linear encoder        Replace the servo motor or linear encoder.

          has malfunctioned.


     [AL. 051.2_Thermal overload error 3 during a stop]
     Cause                                                 Check/action method                                                                Model
     1. A moving part collided against the machine.        Review the operation pattern to avoid collision.                                   [G]
                                                           Check if the machine is interfering with the servo motor.                          [B]

     2. The servo motor power cable was                    Page 84 [AL. 051.1_Thermal overload error 3 during operation]
                                                                                                                                              [A]

          disconnected.
     3. The connection of the servo motor is incorrect.
     4. The connection of the encoder cable is
          incorrect.
     5. The torque is saturated.
     6. The servo amplifier has malfunctioned.
     7. The encoder or linear encoder has
          malfunctioned.


         1 SERVO AMPLIFIER TROUBLESHOOTING
84       1.3 Handling methods for alarms/warnings

---

## หน้า 87

[AL. 052_Excessive error]
• Droop pulses exceeded the alarm occurrence level.                                                                                                        1
[AL. 052.1_Excessive droop pulse 1]
Cause                                                      Check/action method                                                                Model
1. The servo motor power cable was                         Repair or replace the servo motor power cable.                                     [G]
                                                                                                                                              [B]
     disconnected.
                                                                                                                                              [A]
2. The connection of the servo motor is incorrect. Check the U/V/W wiring for forgotten screws, loose screws, and incorrect
                                                           wiring.
                                                           Refer to "Example power circuit connections" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

3. The connection of the encoder cable is                  Check if the encoder cable is connected correctly.

     incorrect.
4. The torque limit has been enabled.                      If the torque has been limited, increase the torque limit value.

5. A moving part collided against the machine.             Review the operation pattern to avoid collision.

6. The electromagnetic brake has not been                  Check if the electromagnetic brake has been released during operation.

     released. (The electromagnetic brake has
     been activated.)
7. The torque is insufficient.                             Check the peak load ratio. If the torque is saturated, reduce the load or review
                                                           the operation pattern. Alternatively, replace the servo motor with a larger-
                                                           capacity servo motor.

8. The power supply voltage has dropped.                   If the bus voltage is too low, review the power supply voltage and power supply
                                                           capacity.

9. Acceleration time constant is too short.                Set a longer acceleration/deceleration time constant, then check the
                                                           repeatability. If the error does not repeat, increase the acceleration/
                                                           deceleration time constant.

10. The position control gain is too small.                Increase the position control gain, then check the repeatability. If the error
                                                           does not repeat, increase the value in [Pr. PB08 position control gain].

11. The excessive error alarm trigger level was not        Check the setting of the excessive error alarm trigger level.
                                                           [G] [B]: [Pr. PC01], [Pr. PC06.3]
     set correctly.
                                                           [A]: [Pr. PC24.3], [Pr. PC43]

12. The servo motor shaft was rotated by an                Measure the actual position under the servo-lock status.
                                                           When an external force rotates the servo motor or moves the linear servo
     external force or the moving part of the linear
                                                           motor, review the machine.
     servo motor was moved by an external force.
13. The servo amplifier has malfunctioned.                 Replace the servo amplifier.

14. The encoder or linear encoder has                      Replace the servo motor or linear encoder.

     malfunctioned.


[AL. 052.3_Excessive droop pulse 2]
Page 85 [AL. 052.1_Excessive droop pulse 1]


[AL. 052.4_Excessive error during 0 torque limit]
Cause                                                      Check/action method                                                                Model
1. The torque limit value is 0.                            Do not input a command when the torque limit value is 0.                           [G]
                                                                                                                                              [B]
                                                                                                                                              [A]


[AL. 052.5_Excessive droop pulse 3]
Page 85 [AL. 052.1_Excessive droop pulse 1]


                                                                                          1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                            1.3 Handling methods for alarms/warnings                  85

---

## หน้า 88

[AL. 052.6_Excessive droop pulse at servo-off]
     Cause                                                 Check/action method                                                           Model
     1. The servo motor shaft was rotated by an            Make sure that the servo motor is not rotated (moved) by an external force.   [G]
                                                                                                                                         [B]
         external force or the moving part of the linear
                                                                                                                                         [A]
         servo motor was moved by an external force.
     2. When the servo motor was rotating or when          Turn servo-on when the servo motor stops.

         the linear servo motor was moving, servo-on
         was executed.
     3. The controller has malfunctioned.                  Replace the controller, then check the repeatability.

     4. The encoder or the servo motor has                 Replace the servo motor or linear encoder, then check the repeatability.

         malfunctioned.
     5. The servo amplifier has malfunctioned.             Replace the servo amplifier, then check the repeatability.


         1 SERVO AMPLIFIER TROUBLESHOOTING
86       1.3 Handling methods for alarms/warnings

---

## หน้า 89

[AL. 054_Oscillation detection]
• The oscillation of the servo motor was detected.                                                                                                     1
[AL. 054.1_Oscillation detection error]
Cause                                                Check/action method                                                                  Model
1. The servo system is unstable and oscillating.     Check the torque ripple with MR Configurator2.                                       [G]
                                                     If the torque ripple is vibrating, adjust the servo gain with the auto tuning. Set   [B]
                                                     the machine resonance suppression filter.                                            [A]

2. The resonance frequency has changed due to        Measure the resonance frequency of the equipment and compare the value
                                                     with the setting value of the machine resonance suppression filter. If the
     aging.
                                                     resonance frequency of the equipment and the value of the filter differs,
                                                     change the setting of the machine resonance suppression filter.

3. The encoder or linear encoder has                 Replace the servo motor or linear encoder.

     malfunctioned.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                    87

---

## หน้า 90

[AL. 056_Forced stop error]
     • The servo motor failed to decelerate normally during a forced stop deceleration.


     [AL. 056.2_Speed exceeded during forced stop]
     Cause                                                 Check/action method                                                                  Model
     1. The forced stop deceleration time constant is      Set a larger value in "Deceleration time constant at forced stop", then check        [G]
                                                           the repeatability. If the error does not repeat, adjust the deceleration time        [B]
          short.
                                                           constant.                                                                            [A]
                                                           [G] [B]: [Pr. PC24 Deceleration time constant at forced stop]
                                                           [A]: [Pr. PC51 Deceleration time constant at forced stop]

     2. The torque limit has been enabled.                 If the torque has been limited, review the torque limit value.

     3. The servo system is unstable and oscillating.      Check the torque ripple with MR Configurator2.
                                                           If the torque ripple is vibrating, adjust the servo gain with the auto tuning. Set
                                                           the machine resonance suppression filter.

     4. The encoder or linear encoder has                  Replace the servo motor or linear encoder.

          malfunctioned.


     [AL. 056.3_Estimated excess distance during forced stop]
     Cause                                                 Check/action method                                                                  Model
     1. The forced stop deceleration time constant is      Set a larger value in "Deceleration time constant at forced stop", then check        [G]
                                                           the repeatability. If the error does not repeat, adjust the deceleration time        [B]
          short.
                                                           constant.                                                                            [A]
                                                           [G] [B]: [Pr. PC24 Deceleration time constant at forced stop]
                                                           [A]: [Pr. PC51 Deceleration time constant at forced stop]

     2. The torque limit has been enabled.                 If the torque has been limited, review the torque limit value.

     3. The encoder or linear encoder has                  Replace the servo motor or linear encoder.

          malfunctioned.


     [AL. 056.5_Travel distance exceeded during forced stop 2]
     Page 88 [AL. 056.2_Speed exceeded during forced stop]


         1 SERVO AMPLIFIER TROUBLESHOOTING
88       1.3 Handling methods for alarms/warnings

---

## หน้า 91

[AL. 061_Operation error]
• The operation of positioning function is incorrect.                                                                                        1
[AL. 061.1_Point table setting range error]
Cause                                                    Check/action method                                                    Model
1. "1" or "3" is set for the auxiliary function of the   Review the settings of the auxiliary function.                         [G]

     last point table.


                                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                          1.3 Handling methods for alarms/warnings      89

---

## หน้า 92

[AL. 063_STO timing error]
     • STO signal turned off when the servo motor is rotating.


     [AL. 063.1_STO1 off]
     Cause                                                 Check/action method                                                      Model
     1. While detection by [AL. 063 STO timing error]      After the servo motor stops, turn off (enable) STO1.                     [G]
                                                           Review the settings of "STO timing error selection" with the following   [B]
           has been enabled, STO1 was turned off
                                                           parameters.                                                              [A]
           (enabled) under the following speed             [G] [B]: [Pr. PF06.1 STO timing error selection]
           conditions.                                     [A]: [Pr. PF09.1 STO timing error selection]

      • Rotary servo motor speed: 50 r/min or higher
      • Linear servo motor speed: 50 mm/s or higher
      • Direct drive motor speed: 5 r/min or higher


     [AL. 063.2_STO2 off]
     Cause                                                 Check/action method                                                      Model
     1. While detection by [AL. 063 STO timing error]      After the servo motor stops, turn off (enable) STO2.                     [G]
                                                           Review the settings of "STO timing error selection" with the following   [B]
           has been enabled, STO2 was turned off
                                                           parameters.                                                              [A]
           (enabled) under the following speed             [G] [B]: [Pr. PF06.1 STO timing error selection]
           conditions.                                     [A]: [Pr. PF09.1 STO timing error selection]

      • Rotary servo motor speed: 50 r/min or higher
      • Linear servo motor speed: 50 mm/s or higher
      • Direct drive motor speed: 5 r/min or higher


          1 SERVO AMPLIFIER TROUBLESHOOTING
90        1.3 Handling methods for alarms/warnings

---

## หน้า 93

[AL. 066_Encoder initial communication error (safety sub-
function)]                                                                                                                                                     1
• The connected encoder is not compatible with the servo amplifier.
• There is a communication error between the encoder and servo amplifier.


[AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]
Cause                                                            Check/action method                                                              Model
1. There is a problem with the encoder cable.                    Check if the encoder cable has been disconnected or has shorted. If there is a   [G]
                                                                 problem with the cable, repair or replace the cable.                             [A]

2. The servo amplifier has malfunctioned.                        Replace the servo amplifier.

3. The encoder has malfunctioned.                                Replace the servo motor.

4. There is a problem with the surrounding                       Check the power supply for noise. If there is noise, take countermeasures to
                                                                 reduce the noise.
      environment.
                                                                 Refer to "Noise reduction techniques" in the following manuals.
                                                                 MR-J5 User's Manual (Hardware)
                                                                 MR-J5D User's Manual (Hardware)


[AL. 066.2_Encoder initial communication - Receive data error 2 (safety sub-function)]
Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


[AL. 066.3_Encoder initial communication - Receive data error 3 (safety sub-function)]
Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


[AL. 066.7_Encoder initial communication - Transmission data error 1 (safety sub-
function)]
Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


[AL. 066.9_Encoder initial communication - Processing error 1 (safety sub-function)]
Cause                                                            Check/action method                                                              Model
1. A servo motor with functional safety is not                   Use a servo motor with functional safety.                                        [G]
                                                                                                                                                  [A]
      connected.
2. Take actions in accordance with the items shown below.
Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


                                                                                                1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                                  1.3 Handling methods for alarms/warnings                91

---

## หน้า 94

[AL. 067_Encoder normal communication error 1 (safety sub-
     function)]
     • There is a communication error between the encoder and servo amplifier.


     [AL. 067.1_Encoder normal communication - Receive data error 1 (safety sub-function)]
     Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


     [AL. 067.2_Encoder normal communication - Receive data error 2 (safety sub-function)]
     Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


     [AL. 067.3_Encoder normal communication - Receive data error 3 (safety sub-function)]
     Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


     [AL. 067.4_Encoder normal communication - Receive data error 4 (safety sub-function)]
     Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


     [AL. 067.7_Encoder normal communication - Transmission data error 1 (safety sub-
     function)]
     Page 91 [AL. 066.1_Encoder initial communication - Receive data error 1 (safety sub-function)]


          1 SERVO AMPLIFIER TROUBLESHOOTING
92        1.3 Handling methods for alarms/warnings

---

## หน้า 95

[AL. 068_STO diagnosis error]
• An error was detected in the STO input signal.                                                                                                     1
[AL. 068.1_STO signal mismatch error]
Cause                                              Check/action method                                                                  Model
1. STO1 or STO2 is input incorrectly.              Check that STO1 and STO2 of the CN8 connector are wired correctly.                   [G]
                                                   Refer to "USING STO FUNCTION" in the following manuals.                              [B]
                                                   MR-J5 User's Manual (Hardware)                                                      [A]
                                                   MR-J5D User's Manual (Hardware)

2. The input status of STO1 and STO2 are           If the on/off status of STO1 and STO2 are different, create the same input
                                                   status for STO1 and STO2.
     different.
3. The setting of [Pr. PF18 STO diagnosis error    Set a longer time in the servo parameter setting, then check the repeatability. If
                                                   the error does not repeat, review the setting value of the servo parameter.
     detection time] is incorrect.
4. The STO circuit has malfunctioned.              Replace the servo amplifier.

5. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                   appropriate countermeasures for the cause.
     environment.
                                                   If there is noise, take countermeasures to reduce the noise.
                                                   Refer to "Noise reduction techniques" in the following manuals.
                                                   MR-J5 User's Manual (Hardware)
                                                   MR-J5D User's Manual (Hardware)


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings                    93

---

## หน้า 96

[AL. 069_Command error]
     • When the software limit was activated, the command position exceeded 32 bits (-2147483648 to 2147483647).
     • When the software limit was activated, the command position exceeded 30 bits (-536870912 to 536870911) from the value
       that was set.
     • The command position exceeded 30 bits (-536870912 to 536870911) from the position which was detected after detecting
       LSP (Forward rotation stroke end) or LSN (Reverse rotation stroke end).
     • The command position exceeded 30 bits (-536870912 to 536870911) from the position that was detected after detecting
       FLS (Upper stroke limit) or RLS (Lower stroke limit).


     [AL. 069.1_Forward rotation-side software limit detection - Command excess error]
     Cause                                                     Check/action method                                                         Model
     1. The command position exceeded 32 bits when             Check if the command is set for a position which exceeds 32 bits. Set the   [G]
                                                               command position correctly.
          the software limit was activated.
     2. The command position has exceeded 30 bits              Check the software limit.
                                                               [Pr. PT15 Software position limit +]
          from the software limit setting value.
                                                               [Pr. PT17 Software position limit -]

     3. The controller has malfunctioned.                      Replace the controller.

     4. There is a problem with the surrounding                Check the noise, ambient temperature, and other conditions, and implement
                                                               appropriate countermeasures for the cause.
          environment.
                                                               If there is noise, take countermeasures to reduce the noise.
                                                               Refer to "Noise reduction techniques" in the following manuals.
                                                               MR-J5 User's Manual (Hardware)
                                                               MR-J5D User's Manual (Hardware)


     [AL. 069.2_Reverse rotation-side software limit detection - Command excess error]
     Page 94 [AL. 069.1_Forward rotation-side software limit detection - Command excess error]


     [AL. 069.3_Forward rotation stroke end detection - Command excess error]
     Cause                                                     Check/action method                                                         Model
     1. The command position exceeded 30 bits from             Review the operation pattern so that the command does not exceed 30 bits.   [G]

          the position that was detected after detecting
          LSP (Forward rotation stroke end).
     2. The forward rotation stroke limit switch is not        Check if the limit switch is connected correctly.

          connected to LSP (Forward rotation stroke
          end).
     3. The controller has malfunctioned.                      Replace the controller.

     4. There is a problem with the surrounding                Check the noise, ambient temperature, and other conditions, and implement
                                                               appropriate countermeasures for the cause.
          environment.
                                                               If there is noise, take countermeasures to reduce the noise.
                                                               Refer to "Noise reduction techniques" in the following manuals.
                                                               MR-J5 User's Manual (Hardware)
                                                               MR-J5D User's Manual (Hardware)


          1 SERVO AMPLIFIER TROUBLESHOOTING
94        1.3 Handling methods for alarms/warnings

---

## หน้า 97

[AL. 069.4_Reverse rotation stroke end detection - Command excess error]
Cause                                                  Check/action method                                                               Model        1
1. The command position exceeded 30 bits from          Review the operation pattern so that the command does not exceed 30 bits.         [G]

     the position which was detected after detecting
     LSN (Reverse rotation stroke end).
2. The reverse rotation stroke limit switch is not     Check if the limit switch is connected correctly.

     connected to LSN (Reverse rotation stroke
     end).
3. The controller has malfunctioned.                   Replace the controller.

4. There is a problem with the surrounding             Check the noise, ambient temperature, and other conditions, and implement
                                                       appropriate countermeasures for the cause.
     environment.
                                                       If there is noise, take countermeasures to reduce the noise.
                                                       Refer to "Noise reduction techniques" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)


[AL. 069.5_Upper stroke limit detection - Command excess error]
Cause                                                  Check/action method                                                               Model
1. The command position exceeded 30 bits from          Review the operation pattern so that the command does not exceed 30 bits.         [G]

     the position which was detected after detecting
     FLS (Upper stroke limit).
2. The upper stroke limit switch is not wired or       Check if the limit switch is connected correctly or if the switch is positioned
                                                       incorrectly.
     the switch is positioned incorrectly.
3. There is a problem with the surrounding             Check the noise, ambient temperature, and other conditions, and implement
                                                       appropriate countermeasures for the cause.
     environment.
                                                       If there is noise, take countermeasures to reduce the noise.
                                                       Refer to "Noise reduction techniques" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)

4. The controller has malfunctioned.                   Replace the controller.


[AL. 069.6_Lower stroke limit detection - Command excess error]
Cause                                                  Check/action method                                                               Model
1. The command position exceeded 30 bits from          Review the operation pattern so that the command does not exceed 30 bits.         [G]

     the position which was detected after detecting
     RLS (Lower stroke limit).
2. The lower stroke limit switch is not wired or the   Check if the limit switch is connected correctly or if the switch is positioned
                                                       incorrectly.
     switch is positioned incorrectly.
3. There is a problem with the surrounding             Check the noise, ambient temperature, and other conditions, and implement
                                                       appropriate countermeasures for the cause.
     environment.
                                                       If there is noise, take countermeasures to reduce the noise.
                                                       Refer to "Noise reduction techniques" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)

4. The controller has malfunctioned.                   Replace the controller.


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings                 95

---

## หน้า 98

[AL. 070_Load-side encoder initial communication error 1]
     • There is a communication error between the load-side encoder and servo amplifier.


     [AL. 070.1_Load-side encoder initial communication - Receive data error 1]
     Cause                                                 Check/action method                                                                Model
     1. There is a problem with the load-side encoder      Check if the load-side encoder cable has been disconnected, incorrectly wired,     [G]
                                                           or has shorted.                                                                    [B]
          cable.
                                                           If there is a problem with the cable, replace or repair the cable.                 [A]

     2. If an A/B/Z-phase differential output type         Check if the servo amplifier is compatible with the A/B/Z-phase differential
                                                           output type encoder.
          encoder is being used, the servo amplifier is
                                                           Refer to "Compatible encoder list" in the following manual.
          not compatible with the A/B/Z-phase              MR-J5 Partner's Encoder User's Manual
          differential output type encoder.
     3. If an A/B/Z-phase differential output type         Check if the wiring of the A/B/Z-phase differential output type encoder is
                                                           correct. Check if the encoder is wired to PSEL.
          encoder is being used, the connection with the
                                                           Refer to "A/B/Z-phase differential output type encoder" in the following manual.
          encoder is incorrect.                            MR-J5 Partner's Encoder User's Manual

     4. The servo amplifier has malfunctioned.             Replace the servo amplifier.

     5. The load-side encoder has malfunctioned.           Replace the load-side encoder.

     6. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                           appropriate countermeasures for the cause.
          environment.
                                                           If there is noise, take countermeasures to reduce the noise.
                                                           Refer to "Noise reduction techniques" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)


     [AL. 070.2_Load-side encoder initial communication - Receive data error 2]
     Page 96 [AL. 070.1_Load-side encoder initial communication - Receive data error 1]


          1 SERVO AMPLIFIER TROUBLESHOOTING
96        1.3 Handling methods for alarms/warnings

---

## หน้า 99

[AL. 070.3_Load-side encoder initial communication - Receive data error 3]
Cause                                                Check/action method                                                                Model        1
1. For a multi-axis servo amplifier, unused axes     Set the axis not used to disabled with disabling control axis switch (SW3-2/       [G]
                                                     SW3-3/SW3-4).                                                                      [B]
    have not been disabled.
2. The load-side encoder cable is disconnected.      Check if the load-side encoder cable is connected correctly.                       [G]
                                                                                                                                        [B]
3. There is a problem with the load-side encoder     Check if the load-side encoder cable has been disconnected or has shorted.
                                                                                                                                        [A]
                                                     If there is a problem with the load-side encoder cable, replace or repair the
    cable.
                                                     cable.

4. When an external power supply was used for        Review the power supply capacity and the voltage of the external power
                                                     supply.
    the load-side encoder, the voltage of the
    external power supply became unstable.
5. The servo parameter settings for the              Set the servo parameter according to the encoder cable communication
                                                     method (two-wire type/four-wire type).
    communication method are incorrect. This
                                                     [G] [B]: [Pr. PC26.3 Load-side encoder cable communication method
    does not apply to multi-axis servo amplifiers.   selection]
                                                     [A]: [Pr. PC44.3 Load-side encoder cable communication method selection]

6. If an A/B/Z-phase differential output type        Check if the wiring of the A/B/Z-phase differential output type encoder is
                                                     correct. Check if the encoder is wired to PSEL.
    encoder is being used, the connection with the
                                                     Refer to "A/B/Z-phase differential output type encoder" in the following manual.
    encoder is incorrect.                            MR-J5 Partner's Encoder User's Manual

7. When using a four-wire type linear encoder,       Check if the servo amplifier is compatible with the four-wire type linear
                                                     encoder.
    the servo amplifier is not compatible with the
                                                     Refer to "Parts identification" in the User's Manual (Introduction).
    four-wire type linear encoder.
8. The servo amplifier has malfunctioned.            Replace the servo amplifier.

9. The load-side encoder has malfunctioned.          Replace the load-side encoder.

10. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
    environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)

11. Values of the servo parameters for               Set the servo parameters for manufacturer setting to the initial values.           [G]

    manufacturer setting have been changed.


[AL. 070.5_Load-side encoder initial communication - Transmission data error 1]
Cause                                                Check/action method                                                                Model
1. If an A/B/Z-phase differential output type        Check if the A/B-phase pulse signals (PA, PAR, PB, and PBR) of the encoder         [G]
                                                     cable have been disconnected or have shorted.                                      [B]
    encoder is being used, the wiring of the
                                                     Refer to "A/B/Z-phase differential output type encoder" in the following manual.   [A]
    encoder is incorrect.                            MR-J5 Partner's Encoder User's Manual

2. There is a problem with the load-side encoder     Page 96 [AL. 070.1_Load-side encoder initial communication - Receive
                                                     data error 1]
    cable.
3. The servo amplifier has malfunctioned.
4. The load-side encoder has malfunctioned.
5. There is a problem with the surrounding
    environment.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                  97

---

## หน้า 100

[AL. 070.6_Load-side encoder initial communication - Transmission data error 2]
     Cause                                              Check/action method                                                                Model
     1. If an A/B/Z-phase differential output type      Check if the Z-phase pulse signals (PZ and PZR) of the encoder cable have          [G]
                                                        been disconnected or have shorted.                                                 [B]
          encoder is being used, the wiring of the
                                                        Refer to "A/B/Z-phase differential output type encoder" in the following manual.   [A]
          encoder is incorrect.                         MR-J5 Partner's Encoder User's Manual

     2. There is a problem with the load-side encoder   Page 96 [AL. 070.1_Load-side encoder initial communication - Receive
                                                        data error 1]
          cable.
     3. The servo amplifier has malfunctioned.
     4. The load-side encoder has malfunctioned.
     5. There is a problem with the surrounding
          environment.


     [AL. 070.7_Load-side encoder initial communication - Transmission data error 3]
     Page 96 [AL. 070.1_Load-side encoder initial communication - Receive data error 1]


     [AL. 070.A_Load-side encoder initial communication - Process error 1]
     Cause                                              Check/action method                                                                Model
     1. The servo amplifier has malfunctioned.          Replace the servo amplifier.                                                       [G]
                                                                                                                                           [B]
     2. The load-side encoder has malfunctioned.        Replace the load-side encoder.
                                                                                                                                           [A]
     3. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
          environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


     [AL. 070.B_Load-side encoder initial communication - Process error 2]
     Page 96 [AL. 070_Load-side encoder initial communication error 1]


     [AL. 070.C_Load-side encoder initial communication - Process error 3]
     Page 96 [AL. 070_Load-side encoder initial communication error 1]


     [AL. 070.D_Load-side encoder initial communication - Process error 4]
     Page 96 [AL. 070_Load-side encoder initial communication error 1]


     [AL. 070.E_Load-side encoder initial communication - Process error 5]
     Page 96 [AL. 070_Load-side encoder initial communication error 1]


     [AL. 070.F_Load-side encoder initial communication - Process error 6]
     Page 96 [AL. 070_Load-side encoder initial communication error 1]


          1 SERVO AMPLIFIER TROUBLESHOOTING
98        1.3 Handling methods for alarms/warnings

---

## หน้า 101

[AL. 071_Load-side encoder normal communication error 1]
• There is a communication error between the load-side encoder and servo amplifier.                                                                      1
[AL. 071.1_Load-side encoder normal communication - Receive data error 1]
Cause                                                         Check/action method                                                           Model
1. There is a problem with the load-side encoder              Check if the encoder cable has been disconnected, incorrectly wired, or has   [G]
                                                              shorted.                                                                      [B]
     cable.
                                                              If there is a problem with the encoder cable, replace or repair the cable.    [A]

2. The external conductor of the encoder cable is             Check if the external conductor of the encoder cable is connected to the
                                                              ground plate of the connector.
     not connected to the ground plate of the
                                                              Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
     connector.                                               in the following manual.
                                                              Rotary Servo Motor User's Manual (For MR-J5)

3. The servo parameter settings for the                       Set the servo parameter correctly according to the encoder cable
                                                              communication method (two-wire type/four-wire type).
     communication method are incorrect. This
                                                              [G] [B]: [Pr. PC26.3 Load-side encoder cable communication method
     does not apply to multi-axis servo amplifiers.           selection]
                                                              [A]: [Pr. PC44.3 Load-side encoder cable communication method selection]

4. The servo amplifier has malfunctioned.                     Replace the servo amplifier.

5. The load-side encoder has malfunctioned.                   Replace the load-side encoder.

6. There is a problem with the surrounding                    Check the noise, ambient temperature, and other conditions, and implement
                                                              appropriate countermeasures for the cause.
     environment.
                                                              If there is noise, take countermeasures to reduce the noise.
                                                              Refer to "Noise reduction techniques" in the following manuals.
                                                              MR-J5 User's Manual (Hardware)
                                                              MR-J5D User's Manual (Hardware)


[AL. 071.2_Load-side encoder normal communication - Receive data error 2]
Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


[AL. 071.3_Load-side encoder normal communication - Receive data error 3]
Cause                                                         Check/action method                                                           Model
1. The Z-phase signal cannot be detected                      Check if the Z-phase pulse signals (PZ and PZR) of the encoder cable have     [G]
                                                              been disconnected or have shorted.                                            [B]
     despite being on. This does not apply to multi-
                                                              Refer to the specifications provided by the encoder manufacturer or "A/B/Z-   [A]
     axis servo amplifiers.                                   phase differential output type encoder" in the following manual.
                                                              MR-J5 Partner's Encoder User's Manual

2. Take actions in accordance with the items shown below.
Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


[AL. 071.4_Erroneous number of load-side Z-phase interval pulses]
Cause                                                         Check/action method                                                           Model
1. The number of Z-phase interval pulses is                   Check if [Pr. PE51 Load-side encoder resolution setting] has been set         [G]
                                                              correctly.                                                                    [A]
     different from the value of the encoder
     resolution setting.


                                                                                             1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                               1.3 Handling methods for alarms/warnings             99

---

## หน้า 102

[AL. 071.5_Load-side encoder normal communication - Transmission data error 1]
  Cause                                                         Check/action method                                                           Model
  1. If an A/B/Z-phase differential output type                 Check if the A/B-phase pulse signals (PA, PAR, PB, and PBR) of the encoder    [G]
                                                                cable have been disconnected or have shorted.                                 [B]
       encoder is being used, the wiring of the
                                                                Refer to the specifications provided by the encoder manufacturer or "A/B/Z-   [A]
       encoder is incorrect.                                    phase differential output type encoder" in the following manual.
                                                                MR-J5 Partner's Encoder User's Manual

  2. Take actions in accordance with the items shown below.
  Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


  [AL. 071.6_Load-side encoder normal communication - Transmission data error 2]
  Cause                                                         Check/action method                                                           Model
  1. If an A/B/Z-phase differential output type                 Check if the A/B-phase pulse signals (PZ and PZR) of the encoder cable have   [G]
                                                                been disconnected or have shorted.                                            [B]
       encoder is being used, the wiring of the
                                                                Refer to the specifications provided by the encoder manufacturer or "A/B/Z-   [A]
       encoder is incorrect.                                    phase differential output type encoder" in the following manual.
                                                                MR-J5 Partner's Encoder User's Manual

  2. Take actions in accordance with the items shown below.
  Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


  [AL. 071.7_Load-side encoder normal communication - Transmission data error 3]
  Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


  [AL. 071.C_Load-side encoder communication protocol error 1]
  Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


  [AL. 071.D_Load-side encoder communication protocol error 2]
  Page 99 [AL. 071.1_Load-side encoder normal communication - Receive data error 1]


       1 SERVO AMPLIFIER TROUBLESHOOTING
100    1.3 Handling methods for alarms/warnings

---

## หน้า 103

[AL. 072_Load-side encoder normal communication error 2]
• The load-side encoder detected an error signal.                                                                                                    1
[AL. 072.1_Load-side encoder data error 1]
Cause                                                   Check/action method                                                              Model
1. An excessive speed or acceleration was               Decrease the control gain, then check the repeatability. If the error does not   [G]
                                                        repeat, use the encoder with a lower gain.                                       [B]
     detected due to an oscillation or other factors.
                                                                                                                                         [A]
2. The load-side encoder has malfunctioned.             Replace the load-side encoder.

3. There is a problem with the surrounding              Check the noise, ambient temperature, external magnetic field, and other
                                                        conditions, and implement appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 072.2_Load-side encoder data update error]
Cause                                                   Check/action method                                                              Model
1. The load-side encoder has malfunctioned.             Replace the load-side encoder.                                                   [G]
                                                                                                                                         [B]
2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                                                                                                         [A]
                                                        appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 072.3_Load-side encoder data waveform error]
Page 101 [AL. 072.2_Load-side encoder data update error]


[AL. 072.4_No load-side encoder signal]
Cause                                                   Check/action method                                                              Model
1. A signal of the load-side encoder has not been       Check if the encoder cable is wired correctly.                                   [G]
                                                                                                                                         [B]
     input.
                                                                                                                                         [A]
2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 072.5_Load-side encoder hardware error 1]
Page 101 [AL. 072.2_Load-side encoder data update error]


[AL. 072.6_Load-side encoder hardware error 2]
Page 101 [AL. 072.2_Load-side encoder data update error]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings               101

---

## หน้า 104

[AL. 076_Load-side encoder error]
  • There is an error in a parameter.


  [AL. 076.2_Load-side encoder error 2]
  Cause                                          Check/action method                                                        Model
  1. Values of the servo parameters for          Set the servo parameters for manufacturer setting to the initial values.   [G]

       manufacturer setting have been changed.


  [AL. 076.3_Load-side encoder error 3]
  Cause                                          Check/action method                                                        Model
  1. Values of the servo parameters for          Set the servo parameters for manufacturer setting to the initial values.   [G]

       manufacturer setting have been changed.


      1 SERVO AMPLIFIER TROUBLESHOOTING
102   1.3 Handling methods for alarms/warnings

---

## หน้า 105

[AL. 082_Master-slave operation error 1]
• An inter-driver communication error was detected.                                                      1
[AL. 082.1_Master-slave operation error 1]
Page 69 [AL. 034.1_SSCNET receive data error]


                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                        1.3 Handling methods for alarms/warnings   103

---

## หน้า 106

[AL. 086_Network communication error]
  • An error occurred in the network communication.


  [AL. 086.1_Network communication error 1]
  Cause                                               Check/action method                                                                  Model
  1. A network cable is disconnected.                 Check if the network cable is connected correctly.                                   [G]
                                                      Turn off the control circuit power supply of the servo amplifier, then connect the
                                                      network cable correctly.

  2. The wiring of the network cable was incorrect.   Check if the connection of network cable is correct.

  3. A network cable has been disconnected.           Check for disconnection in the network cable.

  4. Devices on the network (including repeaters      Check that the devices on the network are turned on.

       such as hubs) are turned off.
  5. The network was disconnected by an incorrect     Check if the network was disconnected by a correct procedure for each type of
                                                      network.
       procedure.
                                                      Refer to "Disconnecting the communication" in the User's Manual
                                                      (Communication function).

  6. Data transmission from the controller was        Check if data transmission from the controller has not been interrupted. If the
                                                      data transmission has been interrupted, review the controller communication
       interrupted for a certain time.
                                                      setting.

  7. The settings of the controller were incorrect.   Check the controller settings.
                                                      When using CC-Link IE TSN, review communication settings such as those for
                                                      increasing the transient transmission time of the controller. Alternatively,
                                                      reduce the number of servo amplifiers that enter the network midway.

  8. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                      appropriate countermeasures for the cause.
       environment.
                                                      If there is noise, take countermeasures to reduce the noise.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)

  9. The servo amplifier has malfunctioned.           Replace the servo amplifier.

  10. The controller has malfunctioned.               Replace the controller.

  11. Devices on the network (including repeaters     Replace the devices on the network.

       such as hubs) have malfunctioned.


  [AL. 086.2_Network communication error 2]
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 086.3_Network communication error 3]
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 086.4_Network communication error 4]
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 086.5_Network communication error 5]
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 086.6_Network communication error 6]
  Page 104 [AL. 086.1_Network communication error 1]


      1 SERVO AMPLIFIER TROUBLESHOOTING
104   1.3 Handling methods for alarms/warnings

---

## หน้า 107

[AL. 088_Watchdog 1]/[AL. 888_Watchdog 1]/[AL.
88888_Watchdog 1]                                                                                                                         1
• The CPU or other component parts have malfunctioned.


[AL. 088.1_Watchdog 1-1]/[AL. 088_Watchdog 1-1]/[AL. 888_Watchdog 1-1]/[AL.
88888_Watchdog 1-1]
Cause                                             Check/action method                                                         Model
1. There is a problem with the surrounding        Check the noise, ambient temperature, and other conditions, and implement   [G]
                                                  appropriate countermeasures for the cause.                                  [B]
     environment.
                                                  If there is noise, take countermeasures to reduce the noise.                [A]
                                                  Refer to "Noise reduction techniques" in the following manuals.
                                                  MR-J5 User's Manual (Hardware)
                                                  MR-J5D User's Manual (Hardware)

2. The servo amplifier has malfunctioned.         Replace the servo amplifier.


[AL. 088.2_Watchdog 1-2]
Page 105 [AL. 088.1_Watchdog 1-1]/[AL. 088_Watchdog 1-1]/[AL. 888_Watchdog 1-1]/[AL. 88888_Watchdog 1-1]


[AL. 088.4_Watchdog 1-4]
Page 105 [AL. 088.1_Watchdog 1-1]/[AL. 088_Watchdog 1-1]/[AL. 888_Watchdog 1-1]/[AL. 88888_Watchdog 1-1]


[AL. 088.8_Watchdog 1-8]
Page 105 [AL. 088.1_Watchdog 1-1]/[AL. 088_Watchdog 1-1]/[AL. 888_Watchdog 1-1]/[AL. 88888_Watchdog 1-1]


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.3 Handling methods for alarms/warnings         105

---

## หน้า 108

[AL. 08A_Serial communication time-out error]
  • The communication between the servo amplifier and the personal computer or the controller was lost for the specified time
      or longer.
  • There is a problem with the serial communication (Mitsubishi Electric AC servo protocol).


  [AL. 08A.1_Serial communication time-out error]
  Cause                                                 Check/action method                                                       Model
  1. The communication command has not been             Check if the command has been transmitted from the personal computer or   [A]
                                                        other equipment.
         transmitted.
  2. The communication cable has been                   Replace the communication cable.

         disconnected.
  3. The servo amplifier has malfunctioned.             Replace the servo amplifier.


         1 SERVO AMPLIFIER TROUBLESHOOTING
106      1.3 Handling methods for alarms/warnings

---

## หน้า 109

[AL. 08E_Serial communication error]
• A communication error occurred between the servo amplifier and the personal computer or the controller.                                           1
• There is a problem with the USB communication or serial communication (Mitsubishi Electric AC servo protocol).


[AL. 08E.1_Serial communication receive error]
Cause                                                    Check/action method                                                            Model
1. The settings of the personal computer or other        Check the settings of the personal computer and other equipment.               [G]
                                                                                                                                        [B]
     equipment are incorrect.
                                                                                                                                        [A]
2. There is a problem with the communication             Check the communication cable, then check the repeatability.

     cable.
3. The servo amplifier has malfunctioned.                Replace the servo amplifier, then check the repeatability.

4. There is a problem with the surrounding               Check the power supply for noise. If there is noise, take countermeasures to
                                                         reduce the noise.
     environment.
                                                         Check if the connector has shorted.
                                                         Refer to "Noise reduction techniques" in the following manuals.
                                                         MR-J5 User's Manual (Hardware)
                                                         MR-J5D User's Manual (Hardware)


[AL. 08E.2_Serial communication checksum error]
Cause                                                    Check/action method                                                            Model
1. The settings of the personal computer or other        Check the settings of the personal computer and other equipment.               [G]
                                                                                                                                        [B]
     equipment are incorrect.
                                                                                                                                        [A]


[AL. 08E.3_Serial communication character error]
Cause                                                    Check/action method                                                            Model
1. An unsupported character was transmitted.             Check the character code at the time of transmission. If an unsupported        [G]
                                                         character was transmitted, correct the transmission data.                      [B]

2. The communication protocol has a problem.             Check if the transmission data complies with the communication protocol.
                                                                                                                                        [A]

3. The settings of the personal computer or other        Check the settings of the personal computer and other equipment.

     equipment are incorrect.


[AL. 08E.4_Serial communication command error]
Cause                                                    Check/action method                                                            Model
1. An unsupported command was transmitted.               Check the command at the time of transmission. If an unsupported command       [G]
                                                         was transmitted, correct the transmission data.                                [B]

2. The communication protocol has a problem.             Check if the transmission data complies with the communication protocol.
                                                                                                                                        [A]

3. The settings of the personal computer or other        Check the settings of the personal computer and other equipment.

     equipment are incorrect.


[AL. 08E.5_Serial communication data number error]
Cause                                                    Check/action method                                                            Model
1. An unsupported data number was transmitted. Check the data number at the time of transmission. If an unsupported data                [G]
                                                         number was transmitted, correct the transmission data.                         [B]

2. The communication protocol has a problem.             Check if the transmission data complies with the communication protocol.
                                                                                                                                        [A]

3. The settings of the personal computer or other        Check the settings of the personal computer and other equipment.

     equipment are incorrect.


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings             107

---

## หน้า 110

[AL. 08F_Two-digit alarm No. display alarm]
  • A three-digit alarm is occurring.


  [AL. 08F.1_Two-digit alarm No. display alarm for AL. 100 to AL. 1FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 100s ([AL. 1_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.2_Two-digit alarm No. display alarm for AL. 200 to AL. 2FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 200s ([AL. 2_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.3_Two-digit alarm No. display alarm for AL. 300 to AL. 3FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 300s ([AL. 3_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.4_Two-digit alarm No. display alarm for AL. 400 to AL. 4FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 400s ([AL. 4_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.5_Two-digit alarm No. display alarm for AL. 500 to AL. 5FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 500s ([AL. 5_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.6_Two-digit alarm No. display alarm for AL. 600 to AL. 6FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 600s ([AL. 6_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.7_Two-digit alarm No. display alarm for AL. 700 to AL. 7FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 700s ([AL. 7_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


  [AL. 08F.8_Two-digit alarm No. display alarm for AL. 800 to AL. 8FF]
  Cause                                                Check/action method                                                             Model
  1. An alarm with alarm No. in 800s ([AL. 8_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                       the servo amplifier display, or MR Configurator2, and take corrective action.
       occurring.


      1 SERVO AMPLIFIER TROUBLESHOOTING
108   1.3 Handling methods for alarms/warnings

---

## หน้า 111

[AL. 08F.9_Two-digit alarm No. display alarm for AL. 900 to AL. 9FF]
Cause                                                Check/action method                                                             Model       1
1. An alarm with alarm No. in 900s ([AL. 9_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


[AL. 08F.A_Two-digit alarm No. display alarm for AL. A00 to AL. AFF]
Cause                                                Check/action method                                                             Model
1. An alarm with alarm No. in A00s ([AL. A_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


[AL. 08F.B_Two-digit alarm No. display alarm for AL. B00 to AL. BFF]
Cause                                                Check/action method                                                             Model
1. An alarm with alarm No. in B00s ([AL. B_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


[AL. 08F.C_Two-digit alarm No. display alarm for AL. C00 to AL. CFF]
Cause                                                Check/action method                                                             Model
1. An alarm with alarm No. in C00s ([AL. C_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


[AL. 08F.D_Two-digit alarm No. display alarm for AL. D00 to AL. DFF]
Cause                                                Check/action method                                                             Model
1. An alarm with alarm No. in D00s ([AL. D_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


[AL. 08F.E_Two-digit alarm No. display alarm for AL. E00 to AL. EFF]
Cause                                                Check/action method                                                             Model
1. An alarm with alarm No. in E00s ([AL. E_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


[AL. 08F.F_Two-digit alarm No. display alarm for AL. F00 to AL. FFF]
Cause                                                Check/action method                                                             Model
1. An alarm with alarm No. in F00s ([AL. F_ _]) is   Check the alarm number using an object that can read three-digit numbers,       [G]
                                                     the servo amplifier display, or MR Configurator2, and take corrective action.
    occurring.


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings              109

---

## หน้า 112

[AL. 090_Homing incomplete warning]
  • Homing has not been finished.
  • Homing did not complete properly.
  • Homing was executed with the Z-phase unpassed.


  [AL. 090.1_Homing incomplete]
  Cause                                                      Check/action method                                                                 Model
  1. Homing has not been executed.                           Check if homing was executed.                                                       [G]
                                                             If homing was not executed, execute homing.

  2. Positioning operation was executed without              Execute homing after dealing with [AL. 025].
                                                             Refer to "Homing mode (hm)" in the following manual.
       homing after [AL. 025 Absolute position
                                                             MR-J5 User's Manual (Function)
       erased] occurred in the absolute position
       detection system.
  3. Homing completion 2 (S_ZP2) turned off after            Remove the causes that turned off homing completion 2 (S_ZP2), then
                                                             execute homing again.
       homing was executed.
                                                             Refer to "Homing method list" in the following manual.
                                                             MR-J5 User's Manual (Function)

  4. [AL. 069 Command error] occurred.                       Execute homing after dealing with [AL. 069].
                                                             Refer to "Homing mode (hm)" in the following manual.
                                                             MR-J5 User's Manual (Function)


  [AL. 090.2_Homing abnormal termination]
  Cause                                                      Check/action method                                                                 Model
  1. The proximity dog is not connected to DOG.              Check if the proximity dog is connected correctly.                                  [G]
                                                             Check the status of the input signal on the I/O monitor screen of MR
                                                             Configurator2.

  2. The stroke limit was detected after homing              Check if the stroke limit switch is connected to the servo amplifier correctly,
                                                             or check if the stroke limit has been reached.
       was started.
  3. Deceleration from the homing speed to the               There is a possibility that the proximity dog turned off before deceleration from
                                                             the homing speed to the creep speed was completed.
       creep speed was not possible.
                                                             Review the dog position,
                                                             or review the parameter values of the homing speed, the creep speed, and the
                                                             travel distance after proximity dog.


  [AL. 090.5_Z-phase unpassed]
  Cause                                                      Check/action method                                                                 Model
  1. Homing was executed while the servo motor               Review the homing start position and the proximity dog position so that the         [G]
                                                             servo motor passes the Z-phase signal until the proximity dog turns off after
       did not pass the Z-phase.
                                                             homing started.

  2. The Z-phase signal was not detected normally. Check if the Z-phase signal of the servo motor or the linear servo motor was
                                                             detected normally.
                                                             If a linear encoder is being used, replace the linear encoder.
                                                             Replace the rotary servo motor or the direct drive motor.


      1 SERVO AMPLIFIER TROUBLESHOOTING
110   1.3 Handling methods for alarms/warnings

---

## หน้า 113

[AL. 091_Servo amplifier overheat warning]
• The temperature inside of the servo amplifier has reached a warning level.                                                               1
[AL. 091.1_Main circuit device overheat warning]
Cause                                                  Check/action method                                                     Model
1. The ambient temperature of the servo                Lower the ambient temperature.                                          [G]
                                                                                                                               [B]
     amplifier exceeded the specified value (60 °C).
                                                                                                                               [A]
2. The servo amplifier does not meet the               Check the specifications of close mounting.
                                                       Refer to "Mounting direction and clearances" in the following manual.
     specifications of close mounting.
                                                       MR-J5 User's Manual (Hardware)

3. Cooling performance has deteriorated due to         Remove causes such as the clogging of the heat sink.

     clogging of the heat sink and other factors.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings       111

---

## หน้า 114

[AL. 092_Battery cable disconnection warning]
  • The battery voltage for the absolute position detection system has decreased.


  [AL. 092.1_Encoder battery cable disconnection warning]
  Cause                                                Check/action method                                                               Model
  1. The MR-BAT6V1SET(-A) battery or MR-               Check if the battery is connected correctly.                                      [G]
                                                                                                                                         [B]
       BT6VCASE battery case is not connected to
                                                                                                                                         [A]
       CN4.
  2. The battery cable has been disconnected.          Check if the battery cable has malfunctioned.

  3. The battery voltage is too low. The battery is    Check the battery voltage with a tester. If the voltage is lower than 3.1 V DC,
                                                       replace the battery.
       exhausted.
  4. There is a problem with the encoder cable.        Check if the BAT wiring of the encoder cable has been disconnected or has
                                                       shorted.

  5. The servo amplifier has malfunctioned.            Replace the servo amplifier, then check the repeatability.

  6. The encoder has malfunctioned.                    Replace the servo motor, then check the repeatability.


  [AL. 092.2_Load-side encoder battery cable disconnection warning]
  Page 112 [AL. 092.1_Encoder battery cable disconnection warning]


  [AL. 092.3_Battery degradation]
  Cause                                                Check/action method                                                               Model
  1. The battery voltage is too low. The battery is    Check the battery voltage with a tester. If the voltage is lower than 3.0 V DC,   [G]
                                                       replace the battery.                                                              [B]
       exhausted.
                                                                                                                                         [A]
  2. The battery has malfunctioned.                    Replace the battery, then check the repeatability.


      1 SERVO AMPLIFIER TROUBLESHOOTING
112   1.3 Handling methods for alarms/warnings

---

## หน้า 115

[AL. 093_ABS data transfer warning]
• ABS data was not transferred.                                                                                                               1
[AL. 093.1_Magnetic pole detection incomplete warning at ABS data transfer request]
Cause                                           Check/action method                                                               Model
1. The Z-phase was not turned on at servo-on.   Check if the position within one-revolution is "0". If the position within one-   [A]
                                                revolution is "0" (with the Z-phase unpassed), turn on the Z-phase, then
                                                disable the magnetic pole detection. Perform homing again.

2. The magnetic pole detection was executed.    If the ABS data was transferred during a magnetic pole detection, disable the
                                                magnetic pole detection. Afterwards, cycle SON (Servo-on), then transfer the
                                                ABS data.


                                                                               1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                 1.3 Handling methods for alarms/warnings               113

---

## หน้า 116

[AL. 095_STO warning]
  • STO input signal turned off during servo motor stop.


  [AL. 095.1_STO1 off detection]
  Cause                                                    Check/action method                                                                Model
  1. STO1 was not input correctly.                         Refer to the wiring diagram and correct the wiring. When the STO function is       [G]
                                                           not used, install the short-circuit connector attached to the servo amplifier on   [B]
                                                           CN8.                                                                               [A]
                                                           Refer to "USING STO FUNCTION" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

  2. While detection by [AL. 063 STO timing error]         Turn on STO1 (disabled).
                                                           Review the settings of "STO timing error selection" with the following
           has been enabled, STO1 was turned off
                                                           parameters.
           (enabled) under the following speed             [G] [B]: [Pr. PF06.1 STO timing error selection]
           conditions.                                     [A]: [Pr. PF09.1 STO timing error selection]

      • Rotary servo motor speed: 50 r/min or lower
      • Linear servo motor speed: 50 mm/s or lower
      • Direct drive motor speed: 5 r/min or lower

  3. The servo amplifier has malfunctioned.                Replace the servo amplifier, then check the repeatability.

  4. STO is off (enabled) when a safety component          Take corrective actions according to the troubleshooting for the safety
                                                           component being used.
           such as the safety logic unit MR-J3-D05 is
           being used. The safety component has a
           problem.


  [AL. 095.2_STO2 off detection]
  Cause                                                    Check/action method                                                                Model
  1. STO2 was not input correctly.                         Refer to the wiring diagram and correct the wiring. When the STO function is       [G]
                                                           not used, install the short-circuit connector attached to the servo amplifier on   [B]
                                                           CN8.                                                                               [A]
                                                           Refer to "USING STO FUNCTION" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

  2. While detection by [AL. 063 STO timing error]         Turn on STO2 (disabled).
                                                           Review the settings of "STO timing error selection" with the following
           has been enabled, STO2 was turned off
                                                           parameters.
           (enabled) under the following speed             [G] [B]: [Pr. PF06.1 STO timing error selection]
           conditions.                                     [A]: [Pr. PF09.1 STO timing error selection]

      • Rotary servo motor speed: 50 r/min or lower
      • Linear servo motor speed: 50 mm/s or lower
      • Direct drive motor speed: 5 r/min or lower

  3. The servo amplifier has malfunctioned.                Replace the servo amplifier, then check the repeatability.


          1 SERVO AMPLIFIER TROUBLESHOOTING
114       1.3 Handling methods for alarms/warnings

---

## หน้า 117

[AL. 096_Home position setting warning]
• Homing failed.                                                                                                                             1
[AL. 096.1_In-position warning at homing]
Cause                                              Check/action method                                                           Model
1. During homing, INP (In-position) did not turn   Adjust gains so that the droop pulses are set within the In-position range.   [G]
                                                   Remove the cause of droop pulse occurrence, then perform homing.              [B]
     on within the specified time.
                                                                                                                                 [A]


[AL. 096.2_Command input warning at homing]
Cause                                              Check/action method                                                           Model
1. A command was input during homing.              Ensure that a command is not input during homing.                             [G]
                                                                                                                                 [B]
2. Creep speed is too high.                        Decelerate the creep speed, then perform homing.
                                                                                                                                 [A]


[AL. 096.3_Servo off warning at homing]
Cause                                              Check/action method                                                           Model
1. An attempt to execute homing was made           After servo-on, execute homing.                                               [A]

     during servo-off.


[AL. 096.4_Magnetic pole detection incomplete warning at homing]
Cause                                              Check/action method                                                           Model
1. Z-phase was not turned on after servo-on.       Rotate the direct drive motor to turn on the Z-phase, then perform homing.    [G]
                                                                                                                                 [A]


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.3 Handling methods for alarms/warnings            115

---

## หน้า 118

[AL. 098_Software position limit warning]
  • The software position limit set by servo parameters has been reached.


  [AL. 098.1_Forward rotation-side software stroke limit reached]
  Cause                                               Check/action method                                                             Model
  1. A software position limit has been reached.      Check the operation pattern.                                                    [G]

  2. A software position limit has been reached in    Operate the system in the range of the software position limit. Adjust the
                                                      parameters or objects related to the JOG operation mode as necessary.
       the JOG operation mode.
  3. The software position limit was set within the   Check if [Pr. PT15 Software position limit +] and [Pr. PT17 Software position
                                                      limit -] are set correctly.
       actual operation range.


  [AL. 098.2_Reverse rotation-side software stroke limit reached]
  Page 116 [AL. 098.1_Forward rotation-side software stroke limit reached]


       1 SERVO AMPLIFIER TROUBLESHOOTING
116    1.3 Handling methods for alarms/warnings

---

## หน้า 119

[AL. 099_Stroke limit warning]
• The stroke limit signal is off.                                                                                                               1
[AL. 099.1_Forward rotation stroke end off]
Cause                                                Check/action method                                                            Model
1. The forward rotation stroke limit switch is not   Check if the limit switch is connected correctly.                              [G]
                                                     The status of the input signal can be confirmed on the I/O monitor screen of   [A]
     connected to LSP.
                                                     MR Configurator2.

2. The forward rotation stroke end was exceeded      Check the operation pattern.

     during driving.
3. The limit switch has malfunctioned. The           Check if the limit switch is functioning correctly or if the sensor has been
                                                     adjusted correctly.
     sensor has not been adjusted correctly.


[AL. 099.2_Reverse rotation stroke end off]
Cause                                                Check/action method                                                            Model
1. The reverse rotation stroke limit switch is not   Check if the limit switch is connected correctly.                              [G]
                                                     The status of the input signal can be confirmed on the I/O monitor screen of   [A]
     connected to LSN.
                                                     MR Configurator2.

2. The reverse rotation stroke end was exceeded      Check the operation pattern.

     during driving.
3. The limit switch has malfunctioned. The           Check if the limit switch is functioning correctly or if the sensor has been
                                                     adjusted correctly.
     sensor has not been adjusted correctly.


[AL. 099.4_Upper stroke limit off]
Cause                                                Check/action method                                                            Model
1. The upper stroke limit switch is not connected    Check if the limit switch is connected correctly.                              [G]
                                                     The status of the input signal can be confirmed on the I/O monitor screen of
     to FLS of the controller.
                                                     MR Configurator2.

2. The upper stroke limit was exceeded during        Check the operation pattern.

     driving.
3. The limit switch has malfunctioned. The           Check if the limit switch is functioning correctly or if the sensor has been
                                                     adjusted correctly.
     sensor has not been adjusted correctly.


[AL. 099.5_Lower stroke limit off]
Cause                                                Check/action method                                                            Model
1. The lower stroke limit switch is not connected    Check if the limit switch is connected correctly.                              [G]
                                                     The status of the input signal can be confirmed on the I/O monitor screen of
     to RLS of the controller.
                                                     MR Configurator2.

2. The lower stroke limit was exceeded during        Check the operation pattern.

     driving.
3. The limit switch has malfunctioned. The           Check if the limit switch is functioning correctly or if the sensor has been
                                                     adjusted correctly.
     sensor has not been adjusted correctly.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings            117

---

## หน้า 120

[AL. 099.6_Forced stop deceleration based on forward rotation stroke end]
  Page 117 [AL. 099.1_Forward rotation stroke end off]


  [AL. 099.7_Forced stop deceleration based on reverse rotation stroke end]
  Page 117 [AL. 099.2_Reverse rotation stroke end off]


  [AL. 099.8_Upper stroke limit off 2]
  Page 117 [AL. 099.4_Upper stroke limit off]


  [AL. 099.9_Lower stroke limit off 2]
  Page 117 [AL. 099.5_Lower stroke limit off]


      1 SERVO AMPLIFIER TROUBLESHOOTING
118   1.3 Handling methods for alarms/warnings

---

## หน้า 121

[AL. 09B_Excessive error warning]
• Droop pulses exceeded the warning occurrence level.                                                                                                 1
[AL. 09B.1_Excessive droop pulse 1 warning]
Cause                                                  Check/action method                                                                Model
1. The servo motor power cable was                     Repair or replace the servo motor power cable.                                     [G]
                                                                                                                                          [B]
     disconnected.
                                                                                                                                          [A]
2. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                       Refer to "Example power circuit connections" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)

3. The connection of the encoder cable is              Check if the encoder cable is connected correctly.

     incorrect.
4. The torque limit has been enabled.                  If the torque has been limited, increase the torque limit value.

5. A moving part collided against the machine.         Review the operation pattern to avoid collision.

6. The torque is insufficient.                         Check the peak load ratio. If the torque is saturated, reduce the load or review
                                                       the operation pattern. Alternatively, replace the servo motor with a larger-
                                                       capacity servo motor.

7. The power supply voltage has dropped.               If the bus voltage is too low, review the power supply voltage and power supply
                                                       capacity.

8. Acceleration/deceleration time constant is          Set a longer acceleration/deceleration time constant, then check the
                                                       repeatability.
     insufficient.
9. The position control gain is too small.             Increase the value of [Pr. PB08 Position control gain].

10. The servo motor shaft was rotated by an            Measure the actual position under the servo-lock status.
                                                       When an external force rotates the servo motor or moves the linear servo
     external force or the moving part of the linear
                                                       motor, review the machine.
     servo motor was moved by an external force.
11. The encoder or linear encoder has                  Replace the servo motor or linear encoder.

     malfunctioned.


[AL. 09B.3_Excessive droop pulse 2 warning]
Page 119 [AL. 09B.1_Excessive droop pulse 1 warning]


[AL. 09B.4_Excessive error warning during 0 torque limit]
Cause                                                  Check/action method                                                                Model
1. The torque limit value is 0.                        Do not input a command when the torque limit value is 0.                           [G]
                                                                                                                                          [B]
                                                                                                                                          [A]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings                119

---

## หน้า 122

[AL. 09C_Converter warning]
  • A warning occurred in the converter unit during servo-on.


  [AL. 09C.1_Converter unit warning]
  Cause                                                 Check/action method                                                      Model
  1. A warning occurred in the converter unit during    Check the warning of the converter unit, and take corrective action in   [G]
                                                        accordance with "CONVERTER UNIT TROUBLESHOOTING" in the following
       servo-on.
                                                        manual.
                                                        MR-CV Power Regeneration Converter Unit User's Manual


      1 SERVO AMPLIFIER TROUBLESHOOTING
120   1.3 Handling methods for alarms/warnings

---

## หน้า 123

[AL. 09E_Network warning]
• An error exists in the network data reception.                                                                                                   1
• An error exists in the network settings.


[AL. 09E.2_Communication cycle setting warning]
Cause                                                   Check/action method                                                            Model
1. The communication cycle was set to 31.25 μs.         For a 1-axis servo amplifier, set [Pr. PA01.7 High speed mode] to "1".         [G]
                                                        For a multi-axis servo amplifier, set the communication cycle to 62.5 µs or
                                                        longer.

2. An unsupported communication cycle was set. Review the settings on the master side.
3. The communication cycle was set to 250 μs or Change the communication cycle to 500 μs or more, or change the
                                                        communication speed of the controller and the servo amplifier to 1 Gbps.
     less while the communication speed was set
     to 100 Mbps for CC-Link IE TSN.
4. The communication cycle for CC-Link IE TSN           For CC-Link IE TSN Class A, set the communication cycle to a value between
                                                        500 μs and 500 ms inclusive.
     Class A has been set to a lower value than
     500 μs or a higher value than 500 ms.


[AL. 09E.3_Number of cyclic points warning]
Cause                                                   Check/action method                                                            Model
1. A value larger than the maximum size was set         Change the communication cycle, or review the mapping.                         [G]
                                                        For the maximum number of cyclic points, refer to "Communication
     to the cyclic points number.
                                                        specifications" in the User's Manual (Communication Function).


[AL. 09E.4_Parameter file warning]
Cause                                                   Check/action method                                                            Model
1. There is an error on the parameter file of the       Replace the parameter automatic setting file.                                  [G]

     parameter automatic setting.
2. The processing of the automatic parameter            Page 104 [AL. 086.1_Network communication error 1]

     setting was interrupted.


[AL. 09E.5_Cyclic communication setting warning]
Cause                                                   Check/action method                                                            Model
1. An unsupported communication cycle was set. Review the settings on the master side.                                                 [G]


[AL. 09E.6_IP address setting warning]
Cause                                                   Check/action method                                                            Model
1. Duplication of an IP address has been                To ensure that there is no duplication of IP addresses, review [Pr. NPA01 IP   [G]
                                                        address setting], [Pr. NPA02 IP address], and the rotary switch setting.
     detected.


[AL. 09E.7_Parameter unreflected warning]
Cause                                                   Check/action method                                                            Model
1. Parameter automatic setting was performed            Cycle the power.                                                               [G]

     for the parameters that require power cycling.


[AL. 09E.8_Master station error detection warning]
Cause                                                   Check/action method                                                            Model
1. An error was detected on the master side.            Check the status on the master side.                                           [G]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings             121

---

## หน้า 124

[AL. 09E.9_Control mode setting warning]
  Cause                                               Check/action method                                                               Model
  1. An unsupported control mode was selected.        Check the synchronous/asynchronous mode and the control mode.                     [G]
                                                      Refer to "Availability of synchronous mode in control mode" in the User's
                                                      Manual (Communication Function).

  2. A function of an unsupported control mode        When the cyclic synchronous pressure mode is used, set [Pr. PW12.2
                                                      Forward/reverse-side stop function] to "1" or "2", and disable the reverse-side
      was selected.
                                                      stop function.


  [AL. 09E.A_Communication cycle setting warning]
  Cause                                               Check/action method                                                               Model
  1. Servo parameter settings primarily for the       Check the servo parameters and change the communication cycle to one that         [G]
                                                      is compatible with the set control mode and functions.
      control mode and functions that are not
                                                      For the function restrictions of the network communication cycle, refer to
      supported by the network communication          "Restrictions on the MR-J5_-_G_" in the User's Manual (Introduction).
      cycle currently in use have been selected.
  2. The servo amplifier is set to use a              Set [Pr. PA01.7 High speed mode] to "0" to use a network communication
                                                      cycle of 1.5 ms, 2.5 ms, 3 ms, 3.5 ms, 4.5 ms, 5 ms, 5.5 ms, 6 ms, 6.5 ms, 7
      communication cycle of 31.25 μs when the
                                                      ms, or 7.5 ms.
      network communication cycle is 1.5 ms, 2.5
      ms, 3 ms, 3.5 ms, 4.5 ms, 5 ms, 5.5 ms, 6 ms,
      6.5 ms, 7 ms, or 7.5 ms.
  3. Values of the servo parameters for               Set the servo parameters for manufacturer setting to the initial values.

      manufacturer setting have been changed.


  [AL. 09E.B_PDO setting warning]
  Cause                                               Check/action method                                                               Model
  1. The PDO setting for FSoE communication is        Review the PDO setting for FSoE communication.                                    [G]

      incorrect.


      1 SERVO AMPLIFIER TROUBLESHOOTING
122   1.3 Handling methods for alarms/warnings

---

## หน้า 125

[AL. 09F_Battery warning]
• The battery voltage for the absolute position detection system has decreased.                                                                     1
[AL. 09F.1_Low battery]
Cause                                                Check/action method                                                                Model
1. The battery is not connected to CN4.              Check if the battery is connected correctly.                                       [G]
                                                                                                                                        [B]
2. The battery voltage is too low. The battery is    Check the voltage of the battery with a tester, and if the voltage is lower than
                                                                                                                                        [A]
                                                     4.9 V DC, replace the battery.
     exhausted.
3. There is a problem with the encoder cable.        Check if the BAT wiring of the encoder cable has been disconnected or has
                                                     shorted.

4. The servo amplifier has malfunctioned.            Replace the servo amplifier, then check the repeatability.

5. The encoder has malfunctioned.                    Replace the servo motor, then check the repeatability.


[AL. 09F.2_Battery degradation warning]
Cause                                                Check/action method                                                                Model
1. The absolute position storage unit is not         Check if the absolute position storage unit is connected correctly.                [G]
                                                                                                                                        [B]
     connected.
                                                                                                                                        [A]
2. The battery voltage is too low. The battery is    Replace the battery.

     exhausted.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                123

---

## หน้า 126

[AL. 0E0_Excessive regeneration warning]
  • [AL. 030.1 Regenerative heat error] may occur.


  [AL. 0E0.1_Excessive regeneration warning]
  Cause                                              Check/action method                            Model
  1. The regenerative load ratio exceeded 85 %.      Page 63 [AL. 030.1_Regenerative heat error]   [G]
                                                                                                    [B]
                                                                                                    [A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
124   1.3 Handling methods for alarms/warnings

---

## หน้า 127

[AL. 0E1_Overload warning 1]
• [AL. 050 Overload 1] or [AL. 051 Overload 2] may occur.                                                                          1
[AL. 0E1.1_Thermal overload warning 1 during operation]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 82 [AL. 050.1_Thermal overload error 1 during operation]     [G]
                                                                                                                       [B]
     level of [AL. 050.1 Thermal overload error 1
                                                                                                                       [A]
     during operation].


[AL. 0E1.2_Thermal overload warning 2 during operation]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 82 [AL. 050.2_Thermal overload error 2 during operation]     [G]
                                                                                                                       [B]
     level of [AL. 050.2 Thermal overload error 2
                                                                                                                       [A]
     during operation].


[AL. 0E1.3_Thermal overload warning 3 during operation]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 84 [AL. 051.1_Thermal overload error 3 during operation]     [G]
                                                                                                                       [B]
     level of [AL. 051.1 Thermal overload error 3
                                                                                                                       [A]
     during operation].


[AL. 0E1.4_Thermal overload warning 4 during operation]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 82 [AL. 050.3_Thermal overload error 4 during operation]     [G]
                                                                                                                       [B]
     level of [AL. 050.3 Thermal overload error 4
                                                                                                                       [A]
     during operation].


[AL. 0E1.5_Thermal overload warning 1 during a stop]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 83 [AL. 050.4_Thermal overload error 1 during a stop]        [G]
                                                                                                                       [B]
     level of [AL. 050.4 Thermal overload error 1
                                                                                                                       [A]
     during a stop].


[AL. 0E1.6_Thermal overload warning 2 during a stop]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 83 [AL. 050.5_Thermal overload error 2 during a stop]        [G]
                                                                                                                       [B]
     level of [AL. 050.5 Thermal overload error 2
                                                                                                                       [A]
     during a stop].


[AL. 0E1.7_Thermal overload warning 3 during a stop]
Cause                                               Check/action method                                                Model
1. The load was over 85 % of the alarm trigger      Page 84 [AL. 051.2_Thermal overload error 3 during a stop]        [G]
                                                                                                                       [B]
     level of [AL. 051.2 Thermal overload error 3
                                                                                                                       [A]
     during a stop].


                                                                               1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                 1.3 Handling methods for alarms/warnings    125

---

## หน้า 128

[AL. 0E1.8_Thermal overload warning 4 during a stop]
  Cause                                              Check/action method                                           Model
  1. The load was over 85 % of the alarm trigger     Page 83 [AL. 050.6_Thermal overload error 4 during a stop]   [G]
                                                                                                                   [B]
      level of [AL. 050.6 Thermal overload error 4
                                                                                                                   [A]
      during a stop].


      1 SERVO AMPLIFIER TROUBLESHOOTING
126   1.3 Handling methods for alarms/warnings

---

## หน้า 129

[AL. 0E2_Servo motor overheat warning]
• [AL. 046.2 Servo motor overheat] may occur.                                                                                    1
[AL. 0E2.1_Servo motor temperature warning]
Cause                                              Check/action method                                               Model
1. The temperature of the servo motor reached      Page 79 [AL. 046.2_Servo motor temperature error 2]              [G]
                                                                                                                     [B]
     85 % of the occurrence level of [AL. 046.2
                                                                                                                     [A]
     Servo motor overheat].


[AL. 0E2.2_Servo motor temperature warning 2]
Cause                                              Check/action method                                               Model
1. The temperature inside of the servo motor has   Page 79 [AL. 046.1_Servo motor temperature error 1]              [G]
                                                                                                                     [B]
     reached a warning level.
                                                                                                                     [A]


                                                                             1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                               1.3 Handling methods for alarms/warnings    127

---

## หน้า 130

[AL. 0E3_Absolute position counter warning]
  • The multi-revolution counter of the absolute position encoder exceeded the maximum range.
  • There is an error in the absolute position encoder pulses.


  [AL. 0E3.1_Multi-revolution counter travel distance exceeded warning]
  Cause                                                 Check/action method                                                         Model
  1. In the absolute position system, the travel        Review the operation range.                                                 [G]
                                                        After the power is cycled, perform homing again.                            [A]
       distance from the home position became
       32768 rev or more.
  2. When an absolute position detection system is      Set [Pr. PC29.5] to "0" (disabled).                                         [G]

       configured in the cyclic synchronous mode
       with a Motion module manufactured by
       Mitsubishi Electric, [Pr. PC29.5 [AL. 0E3
       Absolute position counter warning] selection]
       is not set to "0" (disabled).


  [AL. 0E3.2_Absolute position counter warning]
  Cause                                                 Check/action method                                                         Model
  1. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement   [G]
                                                        appropriate countermeasures for the cause.                                  [B]
       environment.
                                                        If there is noise, take countermeasures to reduce the noise.                [A]
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)
                                                        After the power is cycled, perform homing again.

  2. The encoder has malfunctioned.                     Replace the servo motor.


  [AL. 0E3.5_Encoder absolute position counter warning]
  Page 128 [AL. 0E3.2_Absolute position counter warning]


  [AL. 0E3.6_Scale measurement encoder absolute position counter warning]
  Cause                                                 Check/action method                                                         Model
  1. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement   [G]
                                                        appropriate countermeasures for the cause.                                  [B]
       environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)

  2. The encoder has malfunctioned.                     Replace the servo motor or the encoder.


      1 SERVO AMPLIFIER TROUBLESHOOTING
128   1.3 Handling methods for alarms/warnings

---

## หน้า 131

[AL. 0E4_Parameter warning]
• A parameter value outside of the setting range was attempted to be written.                                                          1
[AL. 0E4.1_Parameter setting range error warning]
Cause                                                Check/action method                                                   Model
1. A parameter was set outside of the setting        Set the value within the setting range.                               [B]

     range with the controller.


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings    129

---

## หน้า 132

[AL. 0E5_ABS time-out warning]
  • When transferring the absolute position data, it took more than 5 s for the programmable controllers to respond.
  • During absolute position erased data transfer, ABSM (ABS transfer mode) turned off.
  • SON (Servo-on), RES (Reset), EM2 (Forced stop 2), or EM1 (Forced stop 1) turned off during absolute position erased
      data transfer.


  [AL. 0E5.1_Time-out during ABS data transfer]
  Cause                                                 Check/action method                                                   Model
  1. The wiring of input/output signals is incorrect.   Check for disconnection or loose connection in the I/O signal wire.   [A]

  2. The sequence program is incorrect.                 Modify the sequence program.


  [AL. 0E5.2_ABSM off during ABS data transfer]
  Page 130 [AL. 0E5.1_Time-out during ABS data transfer]


  [AL. 0E5.3_SON off during ABS data transfer]
  Page 130 [AL. 0E5.1_Time-out during ABS data transfer]


         1 SERVO AMPLIFIER TROUBLESHOOTING
130      1.3 Handling methods for alarms/warnings

---

## หน้า 133

[AL. 0E6_Servo forced stop warning]
• EM2 (Forced stop 2) or EM1 (Forced stop 1) was turned off.                                                                           1
[AL. 0E6.1_Forced stop warning]
Cause                                               Check/action method                                                    Model
1. EM2/EM1 was turned off.                          After ensuring safety, turn EM2/EM1 on.                                [G]
                                                                                                                           [B]
2. An external 24 V DC power supply has not         Input the external 24 V DC power supply.
                                                                                                                           [A]
     been input.
3. The servo amplifier has malfunctioned.           Replace the servo amplifier.


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings    131

---

## หน้า 134

[AL. 0E7_Controller forced stop warning]
  • The emergency stop of the controller became enabled.


  [AL. 0E7.1_Controller forced stop input warning]
  Cause                                              Check/action method                                                       Model
  1. The emergency stop signal of the controller     Ensure safety, then cancel the emergency stop signal of the controller.   [B]

       was input.


      1 SERVO AMPLIFIER TROUBLESHOOTING
132   1.3 Handling methods for alarms/warnings

---

## หน้า 135

[AL. 0E8_Decreased cooling fan speed warning]
• The cooling fan speed decreased to a warning level or lower.                                                                                         1
[AL. 0E8.1_Decreased cooling fan speed]
Cause                                                Check/action method                                                                   Model
1. A foreign object was caught in the cooling fan.   Remove the foreign object.                                                            [G]
                                                                                                                                           [B]
2. The cooling fan has reached the end of its        Check the total of the power-on time of the servo amplifier. If the service life of
                                                                                                                                           [A]
                                                     the cooling fan is exceeded, replace the servo amplifier or the fan unit.
     service life.


[AL. 0E8.2_Cooling fan stop]
Page 133 [AL. 0E8.1_Decreased cooling fan speed]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings                   133

---

## หน้า 136

[AL. 0E9_Main circuit off warning]
  • The servo-on command was input with the main circuit power supply off.
  • The bus voltage dropped when the servo motor was rotating at 50 r/min or lower.


  [AL. 0E9.1_Servo-on signal on during main circuit off]
  Cause                                                 Check/action method                                                                 Model
  1. The bus voltage is less than the specified         Review the wiring. Check the power supply capacity.                                 [G]
                                                                                                                                            [B]
       value.
                                                                                                                                            [A]
  200 V class: 215 V DC
  400 V class: 430 V DC

  2. The servo-on command was input with the            Turn on the main circuit power.

       main circuit power supply off.
  3. The wiring between P3 and P4 is                    Wire between P3 and P4.

       disconnected. This does not apply to multi-
       axis servo amplifiers.
  4. The main circuit power supply wiring is            Wire the main circuit power supply.

       disconnected.
  5. The fuse was disconnected.                         Check the charge light after a certain period of time.

  6. The power supply capacity is insufficient.         Check if the specified power supply capacity is satisfied.

  7. Main circuit capacitor has deteriorated.           After checking the operation time and ambient temperature, replace the servo
                                                        amplifier if the main circuit capacitor has reached the end of its service life.
                                                        Refer to "Parts with a service life" in the User's Manual (Introduction).

  8. The servo amplifier has malfunctioned.             Replace the servo amplifier.

  9. For the MR-J5D_, the servo-on command was          Turn on the power supply of the converter unit.                                     [G]

       input with the power supply off.
  10. For the MR-J5D_, the wiring of the main circuit   Check the wiring of the main circuit power supply of the converter unit. Refer to
                                                        "Example power circuit connections" in the following manual.
       power supply of the converter unit is
                                                        MR-J5D User's Manual (Hardware)
       disconnected.
  11. For the MR-J5D_, the magnetic contactor           Check the magnetic contactor control connector of the converter unit. Refer to
                                                        "Magnetic contactor control connector (CN23)" in the following manual.
       control connector of the converter unit is
                                                        MR-CV Power Regeneration Converter Unit User's Manual
       disconnected.
  12. For the MR-J5D_, the bus bar that connects        Check if the bus bar has been installed correctly. Refer to "How to use the bus
                                                        bar" in the following manual.
       the converter unit and the MR-J5D_ is
                                                        MR-J5D User's Manual (Hardware)
       disconnected.
  13. The converter unit has malfunctioned.             Replace the converter unit, then check the repeatability. If the error does not
                                                        repeat, replace the converter unit.


  [AL. 0E9.2_Bus voltage drop during low speed operation]
  Cause                                                 Check/action method                                                                 Model
  1. The bus voltage dropped under the specified        Review the power supply capacity. Increase the acceleration time constant.          [G]
                                                                                                                                            [B]
       value when the servo motor was rotating at 50
                                                                                                                                            [A]
       r/min or lower.
  200 V class: 200 V DC
  400 V class: 380 V DC


  [AL. 0E9.3_Ready-on signal on during main circuit off]
  Page 134 [AL. 0E9.1_Servo-on signal on during main circuit off]


       1 SERVO AMPLIFIER TROUBLESHOOTING
134    1.3 Handling methods for alarms/warnings

---

## หน้า 137

[AL. 0E9.4_Converter unit forced stop]
Cause                                              Check/action method                                                     Model       1
1. Forced stop of the converter unit became        Cancel forced stop of the converter unit.                               [G]

    enabled during input of the servo-on command
    from the controller.
2. The protection coordination cable is not        Connect the protection coordination cable correctly.
                                                   Refer to "Example power circuit connections" in the following manual.
    connected correctly.
                                                   MR-J5D User's Manual (Hardware)


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.3 Handling methods for alarms/warnings      135

---

## หน้า 138

[AL. 0EA_ABS servo-on warning]
  • The servo amplifier did not become servo-on status within 1 s after ABSM (ABS transfer mode) was turned on.


  [AL. 0EA.1_ABS servo-on warning]
  Cause                                                 Check/action method                                                        Model
  1. The wiring of input/output signals is incorrect.   Check for disconnection or loose connection in the I/O signal wire.        [A]

  2. The sequence program is incorrect.                 Modify the sequence program so that servo-on is enabled within 1 s after
                                                        ABSM (ABS transfer mode) is turned on.


      1 SERVO AMPLIFIER TROUBLESHOOTING
136   1.3 Handling methods for alarms/warnings

---

## หน้า 139

[AL. 0EB_The other axis error warning]
• An alarm, which stops all axes, such as [AL. 024 Main circuit error] or [AL. 032 Overcurrent] occurred on a different axis.             1
• [Pr. PF02.0 Target alarm selection of the other axis error warning] is set to "1" (All alarms).


[AL. 0EB.1_The other axis error warning]
Cause                                                   Check/action method                                                   Model
1. [AL. 024 Main circuit error] occurred on a           Eliminate the cause of [AL. 024] on the axis.                         [G]
                                                                                                                              [B]
     different axis.
2. [AL. 032 Overcurrent] occurred on a different        Eliminate the cause of [AL. 032] on the axis.

     axis.
3. [Pr. PF02.0 Target alarm selection of the other      Remove the cause of the alarm on a different axis.

     axis error warning] is set to "1" (All alarms).


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings    137

---

## หน้า 140

[AL. 0EC_Overload warning 2]
  • Operation was repeated with a high load ratio while the servo motor shaft was not rotating.


  [AL. 0EC.1_Overload warning 2]
  Cause                                                 Check/action method                                                              Model
  1. The load is excessive or the capacity is           Reduce the load or replace the servo motor with a larger-capacity servo motor.   [G]
                                                                                                                                         [B]
       insufficient.
                                                                                                                                         [A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
138   1.3 Handling methods for alarms/warnings

---

## หน้า 141

[AL. 0ED_Output watt excess warning]
• The output wattage (speed × torque) of the servo motor exceeded the rated output, and that status continued steadily.                      1
[AL. 0ED.1_Output watt excess warning]
Cause                                                Check/action method                                                         Model
1. The output wattage of the servo motor (speed      Reduce the servo motor speed, reduce the load, or replace the servo motor   [G]
                                                     with a larger-capacity servo motor.                                         [B]
     × torque or thrust) steadily exceeds 120 % of
                                                                                                                                 [A]
     the rated output (continuous thrust).


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.3 Handling methods for alarms/warnings            139

---

## หน้า 142

[AL. 0EF_Reverse-side stop warning]
  • The set reverse-side position was exceeded in the pressure control mode.


  [AL. 0EF.1_Reverse-side stop warning]
  Cause                                               Check/action method                                                                Model
  1. The setting of [Pr. PW12.2 Forward/reverse-      Check if the setting value of [Pr. PW12.2 Forward/reverse-side stop function] is   [G]
                                                      "1".                                                                               [B]
       side stop function] is incorrect.


      1 SERVO AMPLIFIER TROUBLESHOOTING
140   1.3 Handling methods for alarms/warnings

---

## หน้า 143

[AL. 0F0_Tough drive warning]
• The tough drive function was activated.                                                                                                     1
[AL. 0F0.1_Instantaneous power failure tough drive warning]
Cause                                                Check/action method                                                          Model
1. The voltage of the control circuit power supply   Page 32 [AL. 010.1_Voltage drop in the control circuit power]               [G]
                                                                                                                                  [B]
     has dropped.
                                                                                                                                  [A]


[AL. 0F0.3_Vibration tough drive warning]
Cause                                                Check/action method                                                          Model
1. The setting value of the machine resonance        Set the machine resonance suppression filter. Check the machine status for   [G]
                                                     loose screws and other problems.                                             [B]
     suppression filter was changed due to a
                                                                                                                                  [A]
     machine resonance.


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings            141

---

## หน้า 144

[AL. 0F2_Drive recorder warning]
  • Writing/reading/clearing of the drive recorder data failed.


  [AL. 0F2.1_Drive recorder warning 1]
  Cause                                                   Check/action method                                                               Model
  1. There is an error in the drive recorder data.        Check if clearing the alarm history of the drive recorder with MR Configurator2   [G]
                                                          disables the warning.                                                             [B]

  2. There is a memory error.                             Page 150 [AL. 119.1_Memory error 4-1]
                                                                                                                                            [A]
                                                          Page 150 [AL. 119.7_Memory free space error 4-1]
                                                          Page 151 [AL. 119.8_Memory free space error 4-2]

  3. The Flash-ROM has malfunctioned.                     Replace the servo amplifier.


  [AL. 0F2.2_Drive recorder warning 2]
  Page 142 [AL. 0F2.1_Drive recorder warning 1]


  [AL. 0F2.3_Drive recorder warning 3]
  Page 142 [AL. 0F2.1_Drive recorder warning 1]


  [AL. 0F2.4_Drive recorder warning 4]
  Page 142 [AL. 0F2.1_Drive recorder warning 1]


  [AL. 0F2.5_Drive recorder warning 5]
  Page 142 [AL. 0F2.1_Drive recorder warning 1]


  [AL. 0F2.6_Drive recorder warning 6]
  Page 142 [AL. 0F2.1_Drive recorder warning 1]


      1 SERVO AMPLIFIER TROUBLESHOOTING
142   1.3 Handling methods for alarms/warnings

---

## หน้า 145

[AL. 0F3_Oscillation detection warning]
• The oscillation of the servo motor was detected.                                                      1
[AL. 0F3.1_Oscillation detection warning]
Page 87 [AL. 054.1_Oscillation detection error]


                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                       1.3 Handling methods for alarms/warnings   143

---

## หน้า 146

[AL. 0F4_Positioning warning]
  • The target position or the acceleration/deceleration time constant was set outside of the setting range.


  [AL. 0F4.4_Target position setting range error warning]
  Cause                                                  Check/action method                                                                   Model
  1. The target position was set outside of the          Set the target position correctly, then cancel the warning (turn on C_ORST).          [G]

       setting range.


  [AL. 0F4.6_Acceleration time constant setting range error warning]
  Cause                                                  Check/action method                                                                   Model
  1. The acceleration time constant was set              Set [Pr. PT49 Speed acceleration time constant] correctly, then cancel the            [G]
                                                         warning by turning on C_ORST (Operation alarm reset).
       outside of the setting range.


  [AL. 0F4.7_Deceleration time constant setting range error warning]
  Cause                                                  Check/action method                                                                   Model
  1. The deceleration time constant was set              Set [Pr. PT50 Speed deceleration time constant] correctly, then cancel the            [G]
                                                         warning by turning on C_ORST (Operation alarm reset).
       outside of the setting range.


  [AL. 0F4.8_Control command input error warning]
  Cause                                                  Check/action method                                                                   Model
  1. The relative position command was input while       If Controlword bit 6 is on while [Pr. PT01.2 Unit for position data] is set to "2",   [G]
                                                         turn off Controlword bit 6, then cancel the warning (turn on C_ORST).
       the unit was set to "degree".


  [AL. 0F4.A_Fully closed loop control - Switching warning]
  Cause                                                  Check/action method                                                                   Model
  1. Switching between the semi closed loop              Stop the operation in the homing mode (hm) or profile position mode (pp).             [G]
                                                         Cancel the warning by turning on C_ORST.
       control and fully closed loop control was
       executed during the homing mode (hm) or
       profile position mode (pp).


      1 SERVO AMPLIFIER TROUBLESHOOTING
144   1.3 Handling methods for alarms/warnings

---

## หน้า 147

[AL. 0F7_Machine diagnosis warning]
• The equipment on which the servo motor is installed may have malfunctioned.                                                                             1
[AL. 0F7.1_Vibration failure prediction warning]
Cause                                                  Check/action method                                                                    Model
1. Due to degradation of components in the             When the increase in the vibration level during motor operation is less than 5         [G]
                                                       % of the rated torque from the initial operation, set a larger value for vibration     [B]
     equipment, the vibration at servo motor driving
                                                       failure prediction threshold multiplication, then restart the equipment.               [A]
     became larger.                                    [G] [B]: [Pr. PF40.1 Vibration failure prediction - Threshold multiplication]
                                                       [A]: [Pr. PF52.1 Vibration failure prediction - Threshold multiplication]
                                                       When the increase in the vibration level during motor operation is equal to or
                                                       more than 5 % of the rated torque from the initial operation, perform an
                                                       inspection and maintenance of the equipment as necessary.

2. The servo system is unstable and oscillating.       Check if the gain has been changed after the vibration failure prediction
                                                       function is activated. Adjust the servo gain with the auto tuning. Set the
                                                       machine resonance suppression filter.


[AL. 0F7.2_Friction failure prediction warning]
Cause                                                  Check/action method                                                                    Model
1. Due to degradation of components in the             If the friction torques are the same at the initial operation and at the rated         [G]
                                                       speed, set a larger value for vibration failure prediction threshold multiplication,   [B]
     equipment, the friction of the equipment
                                                       then restart the equipment.                                                            [A]
     changed.                                          [G] [B]: [Pr. PF40.0 Friction failure prediction - Threshold multiplication]
                                                       [A]: [Pr. PF52.0 Friction failure prediction - Threshold multiplication]
                                                       If the friction torque at the rated speed changed from the initial operation,
                                                       perform an inspection and maintenance of the equipment as necessary.

2. As the surrounding environment changed, the         If the operating environment, such as the ambient temperature, was changed
                                                       from the initial operation, reset the threshold, then re-create the threshold.
     friction of the equipment was also changed.


[AL. 0F7.3_Failure prediction warning based on servo motor total travel distance]
Cause                                                  Check/action method                                                                    Model
1. The servo motor total travel distance has           Check if the threshold has been set correctly.                                         [G]
                                                       If the threshold value is incorrect, set each servo parameter so that the setting      [B]
     exceeded the threshold.
                                                       value of the servo motor total travel distance will be an approximation of the         [A]
                                                       rated life, then restart the device.
                                                       [G] [B]: [Pr. PF41 Failure prediction - Servo motor total travel distance]
                                                       [A]: [Pr. PF53 Failure prediction - Servo motor total travel distance]
                                                       If the threshold setting is correct, perform an inspection and maintenance of
                                                       the equipment.
                                                       Refer to "Total travel distance failure prediction function" in the following
                                                       manual.
                                                       MR-J5 User's Manual (Function)


[AL. 0F7.4_Gear failure prediction warning]
Cause                                                  Check/action method                                                                    Model
1. Gear abrasion made the backlash larger.             Compare the backlash estimation value with the backlash presented by the               [G]
                                                       gear manufacturer. If the backlash estimation value is larger than the backlash        [B]
                                                       presented by the gear manufacturer, perform an inspection and maintenance              [A]
                                                       of the equipment.

2. The value for the backlash estimation was set       Set [Pr. PF66.0-3 Gear for backlash estimation - Numerator] and [Pr. PF66.4-7
                                                       Gear for backlash estimation - Denominator] to the same value as the gear
     incorrectly.
                                                       ratio of the gear connected to the servo motor.
                                                       Check that [Pr. PF67 Backlash nominal value] is equivalent to the value shown
                                                       by the manufacturer of the gears connected to the servo motor.
                                                       When setting "0" for [Pr. PF66.0-3] or [Pr. PF66.4-7], set [Pr. PF67] by
                                                       converting the value into the rotation angle on the servo motor side.
                                                       When setting other than "0" for [Pr. PF66.0-3] and [Pr. PF66.4-7], set [Pr.
                                                       PF67] by converting the value into the rotational load on the load side.
                                                       Set [Pr. PF68 Backlash threshold multiplication] to a value more than two
                                                       times larger.


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings                   145

---

## หน้า 148

[AL. 0F7.5_Static friction failure prediction warning]
  Cause                                              Check/action method                                                                    Model
  1. As the surrounding environment changed, the     If the operating environment was changed from the initial operation, reset the         [G]
                                                     threshold, then re-create a threshold. If the operating environment is                 [B]
      friction of the equipment was also changed.
                                                     unchanged, refer to 2 and examine the equipment.                                       [A]

  2. Changes in the equipment configuration          If the equipment configuration is changed, reset the threshold, then create a
                                                     threshold again. If the equipment configuration is unchanged, refer to 3 and
      changed the friction of the equipment.
                                                     examine the equipment.

  3. Due to degradation of components in the         Check if the static friction has been changed from the initial operation. If the
                                                     static friction has not been changed, set a larger value for static friction failure
      equipment, the friction of the equipment
                                                     prediction threshold multiplication, then restart the equipment.
      changed.                                       [G] [B]: [Pr. PF40.4 Static friction failure prediction - Threshold multiplication]
                                                     [A]: [Pr. PF52.4 Static friction failure prediction - Threshold multiplication]
                                                     If the static friction has been changed, perform an inspection and maintenance
                                                     of the equipment as necessary.


  [AL. 0F7.6_Belt failure prediction warning]
  Cause                                              Check/action method                                                                    Model
  1. Belt extension made the belt tension smaller.   If the value of the belt tension estimation is too small, perform an inspection        [G]
                                                     and maintenance of the equipment.                                                      [B]

  2. The setting of the belt tension threshold is    Set the belt tension threshold to [Pr. PF76 Belt tension irregular threshold] with
                                                                                                                                            [A]
                                                     taking the initial belt stretch into account.
      incorrect.


      1 SERVO AMPLIFIER TROUBLESHOOTING
146   1.3 Handling methods for alarms/warnings

---

## หน้า 149

[AL. 0FE_Two-digit warning No. display warning]
• A three-digit warning is occurring.                                                                                                        1
[AL. 0FE.1_Two-digit warning No. display warning for AL. 100 to AL. 1FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 100s ([AL. 1_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.2_Two-digit warning No. display warning for AL. 200 to AL. 2FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 200s ([AL. 2_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.3_Two-digit warning No. display warning for AL. 300 to AL. 3FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 300s ([AL. 3_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.4_Two-digit warning No. display warning for AL. 400 to AL. 4FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 400s ([AL. 4_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.5_Two-digit warning No. display warning for AL. 500 to AL. 5FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 500s ([AL. 5_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.6_Two-digit warning No. display warning for AL. 600 to AL. 6FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 600s ([AL. 6_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.7_Two-digit warning No. display warning for AL. 700 to AL. 7FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 700s ([AL. 7_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


[AL. 0FE.8_Two-digit warning No. display warning for AL. 800 to AL. 8FF]
Cause                                            Check/action method                                                             Model
1. A warning with warning No. in 800s ([AL. 8_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                 the servo amplifier display, or MR Configurator2, and take corrective action.
     _]) is occurring.


                                                                              1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                1.3 Handling methods for alarms/warnings               147

---

## หน้า 150

[AL. 0FE.9_Two-digit warning No. display warning for AL. 900 to AL. 9FF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in 900s ([AL. 9_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


  [AL. 0FE.A_Two-digit warning No. display warning for AL. A00 to AL. AFF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in A00s ([AL. A_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


  [AL. 0FE.B_Two-digit warning No. display warning for AL. B00 to AL. BFF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in B00s ([AL. B_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


  [AL. 0FE.C_Two-digit warning No. display warning for AL. C00 to AL. CFF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in C00s ([AL. C_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


  [AL. 0FE.D_Two-digit warning No. display warning for AL. D00 to AL. DFF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in D00s ([AL. D_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


  [AL. 0FE.E_Two-digit warning No. display warning for AL. E00 to AL. EFF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in E00s ([AL. E_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


  [AL. 0FE.F_Two-digit warning No. display warning for AL. F00 to AL. FFF]
  Cause                                            Check/action method                                                             Model
  1. A warning with warning No. in F00s ([AL. F_   Check the warning number using an object that can read three-digit numbers,     [G]
                                                   the servo amplifier display, or MR Configurator2, and take corrective action.
      _]) is occurring.


      1 SERVO AMPLIFIER TROUBLESHOOTING
148   1.3 Handling methods for alarms/warnings

---

## หน้า 151

[AL. 118_Encoder diagnosis]
• The servo amplifier is in the test operation mode.                                                                                              1
[AL. 118.1_Encoder communication circuit diagnosis in progress]
Cause                                                  Check/action method                                                            Model
1. The servo amplifier is in the encoder               Cancel the encoder communication circuit diagnosis mode.                       [G]
                                                       Refer to "Encoder communication diagnosis function" in the following manual.   [B]
     communication circuit diagnosis mode.
                                                       MR-J5 User's Manual (Function)                                                [A]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings              149

---

## หน้า 152

[AL. 119_Memory error 4]
  • There is a memory error.


  [AL. 119.1_Memory error 4-1]
  Cause                                             Check/action method                                                                     Model
  1. There is a problem with the surrounding        Check the power supply for noise. If there is noise, take countermeasures to            [G]
                                                    reduce the noise.                                                                       [B]
       environment.
                                                    Check if the connector has shorted.                                                     [A]
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)

  2. An internal part of the servo amplifier has    Replace the servo amplifier.

       malfunctioned.


  [AL. 119.2_Memory error 4-2]
  Page 150 [AL. 119.1_Memory error 4-1]


  [AL. 119.3_Memory error 4-3]
  Cause                                            Check/action method                                                                    Model
  1. The firmware has been updated.                Update it to the latest firmware version, then check the repeatability. If the         [G]
                                                   failure continues, the servo amplifier may have malfunctioned. Replace the
                                                   servo amplifier.

  2. Take actions in accordance with the items shown below.                                                                               [G]
                                                                                                                                          [B]
  Page 150 [AL. 119.1_Memory error 4-1]
                                                                                                                                          [A]


  [AL. 119.4_Memory error 4-4]
  Page 150 [AL. 119.1_Memory error 4-1]


  [AL. 119.5_Memory error 4-5]
  Cause                                            Check/action method                                                                Model
  1. The firmware has been updated.                Cycle the power, then check the repeatability. If the failure continues, the       [G]
                                                   servo amplifier may have malfunctioned. Replace the servo amplifier.               [A]

  2. Take actions in accordance with the items shown below.                                                                           [G]
                                                                                                                                      [B]
  Page 150 [AL. 119.1_Memory error 4-1]
                                                                                                                                      [A]


  [AL. 119.6_Memory error 4-6]
  Page 150 [AL. 119.1_Memory error 4-1]


  [AL. 119.7_Memory free space error 4-1]
  Cause                                             Check/action method                                                                     Model
  1. The free memory space is insufficient.         Delete unnecessary files to free up the memory.                                         [G]
                                                    If no files can be deleted, make a backup of necessary data such as                     [B]
                                                    parameters, then initialize the servo amplifier and check the repeatability. If the     [A]
                                                    failure continues, replace the servo amplifier.
                                                    Refer to "Servo amplifier setting initialization" or "Drive unit setting
                                                    initialization" in the User's Manual (Introduction).


      1 SERVO AMPLIFIER TROUBLESHOOTING
150   1.3 Handling methods for alarms/warnings

---

## หน้า 153

[AL. 119.8_Memory free space error 4-2]
Cause                                        Check/action method                                                             Model       1
1. Too many files are saved in the memory.   Delete files to reduce the number of files.                                     [G]
                                             If deleting files does not solve the problem, make a backup of necessary data   [B]
                                             such as parameters, then initialize the servo amplifier and check the           [A]
                                             repeatability. If the failure continues, replace the servo amplifier.
                                             Refer to "Servo amplifier setting initialization" or "Drive unit setting
                                             initialization" in the User's Manual (Introduction).


                                                                          1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                            1.3 Handling methods for alarms/warnings               151

---

## หน้า 154

[AL. 11A_Servo motor constant error]
  • The servo motor constant file is damaged.


  [AL. 11A.1_Servo motor constant file error]
  Cause                                                 Check/action method                                                              Model
  1. Writing of the servo motor constant file failed.   There is a possibility that the servo motor constant file is damaged primarily   [G]
                                                        due to noise entering the file while the file was written.                       [B]
                                                        After writing the servo motor constant again, cycle the power.                   [A]
                                                        For details of actions to be taken, contact your local sales office.

  2. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
       environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)

  3. The Flash-ROM has malfunctioned.                   Replace the servo amplifier.


  [AL. 11A.2_Servo motor constant file extension error]
  Cause                                                 Check/action method                                                              Model
  1. A file with an extension other than ".mmd2"        Delete the written file, then write another file with the extension ".mmd2".     [G]
                                                        For details of actions to be taken, contact your local sales office.             [B]
       was written as the servo motor constant file.
                                                                                                                                         [A]
  2. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
       environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


  [AL. 11A.3_Servo motor constant file amount error]
  Cause                                                 Check/action method                                                              Model
  1. Two or more servo motor constant files were        Delete the written files, then write only one servo motor constant file.         [G]
                                                        For details of actions to be taken, contact your local sales office.             [B]
       written in the servo motor constant folder.
                                                                                                                                         [A]
  2. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
       environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)

  3. The Flash-ROM has malfunctioned.                   Replace the servo amplifier.


      1 SERVO AMPLIFIER TROUBLESHOOTING
152   1.3 Handling methods for alarms/warnings

---

## หน้า 155

[AL. 11B_Protection coordination connection error]
• There is a problem with the protection coordination cable connection and setting.                                                                1
• The protection coordination cable was disconnected.


[AL. 11B.1_Protection coordination end terminal setting error]
Cause                                                 Check/action method                                                              Model
1. The setting of the protection coordination end     Check the system configuration and the setting value of [Pr. PC46.3 Protection   [G]
                                                      coordination end terminal setting].
     terminal is incorrect.
2. The protection coordination cable is not           Connect the protection coordination cable correctly.
                                                      Refer to "Example power circuit connections" in the following manual.
     connected correctly.
                                                      MR-J5D User's Manual (Hardware)

3. The protection coordination cable was              Replace the protection coordination cable, then check the repeatability.

     disconnected.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings               153

---

## หน้า 156

[AL. 130_Regenerative error 2]
  • The regenerative power exceeds the permissible regenerative power of the built-in regenerative resistor or regenerative
      option.
  • The regenerative transistor in the servo amplifier has malfunctioned.


  [AL. 130.1_Regenerative heat error]
  Cause                                                 Check/action method                                                              Model
  1. The settings of the regenerative resistor          Refer to "Regenerative option" in the following manual.                          [G]
                                                        MR-J5 User's Manual (Hardware)                                                  [B]
         (regenerative option) are incorrect.
                                                                                                                                         [A]
  2. The regenerative resistor (regenerative option)    Refer to "Regenerative option" in the following manual.
                                                        MR-J5 User's Manual (Hardware)
         is not connected.
  3. The regenerative resistor (regenerative option)    Check the combination of the regenerative resistor (regenerative option) and
                                                        the servo amplifier.
         and the servo amplifier are connected in a
                                                        Refer to "Regenerative option" in the following manual.
         wrong combination.                             MR-J5 User's Manual (Hardware)

  4. The power supply voltage is too high.              Check if the voltage of the input power supply exceeds the upper limit of the
                                                        permissible voltage. If it exceeds the limit, lower the power supply voltage.
                                                        200 V class: 264 V AC
                                                        400 V class: 528 V AC

  5. The regenerative power is too large.               Check whether the regenerative load ratio exceeds the upper limit value when
                                                        the alarm occurs.
                                                        Take the corrective actions as follows.
                                                         • Reduce the frequency of positioning.
                                                         • Set a longer deceleration time constant.
                                                         • Reduce the load.
                                                         • Use a regenerative option if it is not being used.
                                                         • For a multi-axis servo amplifier, ensure that each axis does not decelerate
                                                           simultaneously.


        1 SERVO AMPLIFIER TROUBLESHOOTING
154     1.3 Handling methods for alarms/warnings

---

## หน้า 157

[AL. 139_Open-phase error]
• An open phase occurred in the main circuit power supply of the servo amplifier.                                                                        1
• An open phase occurred in the servo motor power line.


[AL. 139.1_Input open-phase error]
Cause                                                 Check/action method                                                                  Model
1. An open phase occurred in the main circuit         Check that the main circuit power line is connected with the servo amplifier.        [G]
                                                      Make sure that 1-phase AC power supply is not input to the servo amplifier           [B]
     power line of the servo amplifier.
                                                      that cannot use 1-phase AC power supply.                                             [A]
                                                      Check if the main circuit power line of the servo amplifier is closed. If the main
                                                      circuit power line of the servo amplifier is open, replace the main circuit power
                                                      line.

2. The main circuit power supply is distorted.        Review the power-supply environment of the main circuit.

3. For the MR-J5D_, input open-phase detection        Set [Pr. PC20.4 Input open-phase detection selection] to "0" and cycle the           [G]
                                                      power.
     is enabled.


[AL. 139.2_Output open-phase error]
Cause                                                 Check/action method                                                                  Model
1. An open phase occurred in the servo motor          Check that the servo motor power line is connected with the servo amplifier.         [G]
                                                      Check that the servo motor power supply is connected with the servo amplifier.       [B]
     power line.
                                                      Check if the servo motor power line is closed. If the servo motor power line is      [A]
                                                      open, replace the servo motor power line.

2. The winding inside the servo motor is              Replace the servo motor, then check the repeatability.

     disconnected.


[AL. 139.3_Servo motor wiring error]
Cause                                                 Check/action method                                                                  Model
1. The servo motor that has been connected with       Check the servo motor to which the servo motor power line and encoder cable          [G]
                                                      are connected.                                                                       [B]
     the servo motor power line is not the servo
                                                      Check if the servo motor power line is closed. If the servo motor power line is
     motor to be connected. The servo motor that      open, replace the servo motor power line.
     has been connected with the encoder cable is
     not the servo motor to be connected.
2. The winding inside the servo motor is              Replace the servo motor, then check the repeatability.

     disconnected.


[AL. 139.4_Limit detection error at servo motor incorrect wiring detection]
Cause                                                Check/action method                                                                   Model
1. The limit switches are turned off when the        Check the limit switches and remove the cause.                                        [G]

     motor incorrect wiring is detected.


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings                    155

---

## หน้า 158

[AL. 13D_Driver communication network setting error]
  • There is a problem with the network settings of driver communication.


  [AL. 13D.1_Driver communication - Cyclic transmission setting unset error]
  Cause                                                Check/action method                                                              Model
  1. The connected controller does not support         Connect a controller that supports driver communication.                         [G]

       driver communication.
  2. The network settings of driver communication      Set [Pr. PD22 Driver communication setting - Slave - Master axis 1 - Station
                                                       No. setting] and [Pr. PD23.1 Driver communication setting - Slave - Master
       have not been configured correctly.
                                                       axis 1 - Control slave axis No. setting] of the slave axis correctly.
                                                       Refer to "Network settings" in the User's Manual (Communication Function).

  3. The parameter automatic setting has been          Enable the parameter automatic setting on the controller side.

       disabled.


  [AL. 13D.2_Driver communication - Cyclic transmission setting error]
  Cause                                                Check/action method                                                              Model
  1. The network settings of driver communication      Set [Pr. PD22 Driver communication setting - Slave - Master axis 1 - Station     [G]
                                                       No. setting] and [Pr. PD23.1 Driver communication setting - Slave - Master
       have not been configured correctly.
                                                       axis 1 - Control slave axis No. setting] of the slave axis correctly.
                                                       Refer to "Network settings" in the User's Manual (Communication Function).


  [AL. 13D.3_Driver communication - Control slave axis setting unset error]
  Cause                                                Check/action method                                                              Model
  1. The servo amplifier has not been set as a         Set [Pr. PD23.1 Driver communication setting - Slave - Master axis 1 - Control   [G]
                                                       slave axis No. setting] of the slave axis correctly.
       control slave axis.


      1 SERVO AMPLIFIER TROUBLESHOOTING
156   1.3 Handling methods for alarms/warnings

---

## หน้า 159

[AL. 168_STO function error]
• There is a problem with the STO function.                                                                                                         1
[AL. 168.1_STO function error]
Cause                                                 Check/action method                                                               Model
1. A servo amplifier that is not compatible with      Install the short-circuit connector attached to the servo amplifier in the CN8.   [G]
                                                                                                                                        [A]
     the STO function does not have a short-circuit
     connector connected to its CN8 connector.


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings               157

---

## หน้า 160

[AL. 16A_Master-slave operation simultaneous stop error]
  • An error in the master-slave operation simultaneous stop function was detected.


  [AL. 16A.1_Master-slave operation simultaneous stop error 1]
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 16A.2_Master-slave operation simultaneous stop error 2]
  Page 104 [AL. 086.1_Network communication error 1]


      1 SERVO AMPLIFIER TROUBLESHOOTING
158   1.3 Handling methods for alarms/warnings

---

## หน้า 161

[AL. 17A_Load-side linear encoder error 1]
• A problem with the linear encoder was detected in the fully closed loop control mode. The content of the errors varies                      1
  depending on each encoder manufacturer.
• A problem with the linear encoder (scale measurement encoder) was detected in the scale measurement mode. The
  content of the errors varies depending on each encoder manufacturer.


[AL. 17A.1_Load-side linear encoder error 1-1]
Cause                                                 Check/action method                                                         Model
1. The linear encoder and the head have been          Adjust the positions of the linear encoder and the head.                    [G]
                                                                                                                                  [B]
     incorrectly mounted.
                                                                                                                                  [A]
2. The external conductor of the encoder cable is     Refer to "Shield procedure of CN2, CN2A, CN2B, and CN2C side connectors"
                                                      in the following manual.
     not connected to the ground plate of the
                                                      MR-J5 Partner's Encoder User's Manual
     connector.
3. There is a problem with the surrounding            Check the noise, ambient temperature, and other conditions, and implement
                                                      appropriate countermeasures for the cause.
     environment.
                                                      If there is noise, take countermeasures to reduce the noise.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)

4. A linear encoder alarm was detected.               Refer to "DETAILED EXPLANATION OF [AL. 02A LINEAR ENCODER
                                                      ERROR 1]" in the following manual.
                                                      MR-J5 Partner's Encoder User's Manual


[AL. 17A.2_Load-side linear encoder error 1-2]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


[AL. 17A.3_Load-side linear encoder error 1-3]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


[AL. 17A.4_Load-side linear encoder error 1-4]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


[AL. 17A.5_Load-side linear encoder error 1-5]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


[AL. 17A.6_Load-side linear encoder error 1-6]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


[AL. 17A.7_Load-side linear encoder error 1-7]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


[AL. 17A.8_Load-side linear encoder error 1-8]
Page 159 [AL. 17A.1_Load-side linear encoder error 1-1]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings          159

---

## หน้า 162

[AL. 182_Driver communication error]
  • A driver communication error was detected.


  [AL. 182.1_Driver communication error 1]
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 182.2_Driver communication error 2]
  Page 104 [AL. 086.1_Network communication error 1]


      1 SERVO AMPLIFIER TROUBLESHOOTING
160   1.3 Handling methods for alarms/warnings

---

## หน้า 163

[AL. 188_Watchdog 2]
• The CPU or other component parts have malfunctioned.                                                                               1
[AL. 188.1_Watchdog 2-1]
Cause                                             Check/action method                                                    Model
1. An internal part of the servo amplifier has    Replace the servo amplifier.                                           [G]
                                                                                                                         [B]
    malfunctioned.
                                                                                                                         [A]


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.3 Handling methods for alarms/warnings    161

---

## หน้า 164

[AL. 19D_IP address setting change warning]
  • The IP address setting with engineering software was incorrect.


  [AL. 19D.1_IP address change unreflected warning]
  Cause                                                  Check/action method                                                                  Model
  1. The IP address setting with engineering             Cycle the power of the servo amplifier or reset the software to apply changes        [G]
                                                         to the settings.
       software was configured after the
                                                         For the IP address setting with engineering software, refer to IP address
       communication with the master station was         setting function via the master station in the following manual.
       established.                                      MR-J5-G/MR-J5W-G User's Manual (Communication Function)


  [AL. 19D.2_IP address change failed warning 1]
  Cause                                                  Check/action method                                                                  Model
  1. When [Pr. NPA01 IP address setting] is set to       Set [Pr. NPA01 IP address setting] to "1" (the network parameter is used.).          [G]
                                                         Alternatively, configure the IP address setting after setting the rotary switch to
       "0" (the rotary switch is used.) and the rotary
                                                         "0".
       switch is set to a value other than "0", the IP   For the IP address setting with engineering software, refer to IP address
       address setting with engineering software was     setting function via the master station in the following manual.
                                                         MR-J5-G/MR-J5W-G User's Manual (Communication Function)
       configured.


      1 SERVO AMPLIFIER TROUBLESHOOTING
162   1.3 Handling methods for alarms/warnings

---

## หน้า 165

[AL. 19E_Network warning 2]
• An error exists in the network settings.                                                                                                         1
[AL. 19E.1_Parameter automatic backup setting warning]
Cause                                                 Check/action method                                                              Model
1. An error was detected in the parameter             Check if the master station supports power interruption protection.              [G]
                                                      If power interruption protection is not supported, set [Pr. PN20 Parameter
     automatic backup setting.
                                                      automatic backup update interval] to "0" to disable the automatic backup
                                                      function.


[AL. 19E.2_Control mode setting warning 2]
Cause                                                 Check/action method                                                              Model
1. An unsupported control mode was used.              Check if the control mode corresponds to the communication cycle.                [G]
                                                      For the correspondence between communication cycles and control modes,
                                                      refer to "Restrictions on the MR-J5_-_G_" in the User's Manual (Introduction).

2. A control mode that does not support CC-Link       Check if the control mode supports CC-Link IE TSN Class A.
                                                      For the correspondence between CC-Link IE TSN Class A and control modes,
     IE TSN Class A was used.
                                                      refer to "Restrictions on CC-Link IE TSN Class A" in the User's Manual
                                                      (Introduction).


[AL. 19E.3_Safety communication setting warning]
Cause                                                 Check/action method                                                              Model
1. The safety communication setting of the            If not using the safety communication, disable the safety communication          [G]
                                                      setting of the controller.
     controller has been enabled for a servo
                                                      If using the safety communication, enable the safety communication setting of
     amplifier on which the safety communication      the servo amplifier.
     has been disabled.


[AL. 19E.4_SSCNET communication error warning]
Cause                                                 Check/action method                                                              Model
1. The connected controller is not compatible         Check if the controller is compatible with the MR-J5_-_B_.                       [B]

     with the MR-J5_-_B_.


[AL. 19E.5_Control mode transition warning]
Cause                                                 Check/action method                                                              Model
1. When an attempt to switch the control mode         Check if both the control modes before and after the change are switchable       [G]
                                                      ones.
     was made, the control mode transitioned to an
                                                      For switchable control modes, refer to "Drive profile" in the User's Manual
     unsupported one.                                 (Communication Function).


[AL. 19E.6_Control mode switching waiting warning]
Cause                                                 Check/action method                                                              Model
1. The setting of [Pr. PW13.4 Control switching       Review the setting value of [Pr. PW13.4 Control switching method setting].       [G]

     method setting] is incorrect.
2. When an attempt to switch the control mode         Refer to the manual for the controller being used to check if the command
                                                      value for switching the control mode is correct.
     was made, the control mode did not transition.
                                                      When changing the timeout time for switching the control mode in the
                                                      controller, set [Pr. PW38 Control mode switching waiting time] to twice the
                                                      timeout time in the controller.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings               163

---

## หน้า 166

[AL. 1BD_Driver communication warning]
  • There is a problem with the settings of driver communication.


  [AL. 1BD.1_Driver communication cycle setting warning]
  Cause                                                 Check/action method                                                            Model
  1. An unsupported driver communication cycle          Review the settings on the controller side.                                    [G]
                                                        Refer to "Driver communication specifications" in the User's Manual
       was set.
                                                        (Communication function).


  [AL. 1BD.2_Driver communication - Number of cyclic points warning]
  Cause                                                 Check/action method                                                            Model
  1. A value larger than the maximum size was set       Cycle the power of the servo amplifier whose driver communication setting is   [G]
                                                        enabled, then set the objects of PDO Mapping Objects to the initial values.
       to the cyclic points number.


  [AL. 1BD.3_Driver communication - Command data setting warning]
  Cause                                                 Check/action method                                                            Model
  1. Command data transmission has been                 Page 164 [AL. 1BD.2_Driver communication - Number of cyclic points            [G]
                                                        warning]
       disabled.


  [AL. 1BD.4_Driver communication - Master-slave operation simultaneous stop setting
  warning]
  Cause                                                 Check/action method                                                            Model
  1. The master-slave operation simultaneous stop       Page 164 [AL. 1BD.2_Driver communication - Number of cyclic points            [G]
                                                        warning]
       function has been disabled.


      1 SERVO AMPLIFIER TROUBLESHOOTING
164   1.3 Handling methods for alarms/warnings

---

## หน้า 167

[AL. 1E9_Open-phase warning]
• An open phase occurred in the main circuit power supply of the servo amplifier.                                                              1
[AL. 1E9.1_Input open-phase warning]
Cause                                                 Check/action method                                                          Model
1. An open phase occurred in the main circuit         Page 155 [AL. 139.1_Input open-phase error]                                 [G]
                                                                                                                                   [B]
     power line of the servo amplifier.
                                                                                                                                   [A]

2. For the MR-J5D_, input open-phase detection        Set [Pr. PC20.4 Input open-phase detection selection] to "0" and cycle the   [G]
                                                      power.
     is enabled.


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings            165

---

## หน้า 168

[AL. 1EA_Master-slave operation simultaneous stop warning]
  • When the master-slave operation simultaneous stop function was enabled, the servo motor of the master or slave axis
      stopped.


  [AL. 1EA.1_Master-slave operation stop command detection warning]
  Cause                                               Check/action method                                          Model
  1. The servo motor of the master axis stopped.      Remove the cause of the stop.                                [G]


  [AL. 1EA.2_Master-slave operation stop request detection warning]
  Cause                                               Check/action method                                          Model
  1. The servo motor of a slave axis stopped.         Remove the cause of the stop.                                [G]


        1 SERVO AMPLIFIER TROUBLESHOOTING
166     1.3 Handling methods for alarms/warnings

---

## หน้า 169

[AL. 1F6_Manufacturer setting error]
• A value of the servo parameters for manufacturer setting has been set incorrectly.                                                         1
[AL. 1F6.1_Manufacturer setting error]
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [B]
     manufacturer setting have been changed.
                                                                                                                                 [A]


[AL. 1F6.2_Manufacturer setting error]
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [B]
     manufacturer setting have been changed.
                                                                                                                                 [A]


[AL. 1F6.3_Manufacturer setting error]
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [B]
     manufacturer setting have been changed.
                                                                                                                                 [A]


[AL. 1F6.4_Manufacturer setting error]
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [B]
     manufacturer setting have been changed.
                                                                                                                                 [A]


[AL. 1F6.5_Manufacturer setting error]
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [B]
     manufacturer setting have been changed.
                                                                                                                                 [A]


[AL. 1F6.6_Manufacturer setting error]
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [B]
     manufacturer setting have been changed.
                                                                                                                                 [A]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings         167

---

## หน้า 170

[AL. 1F8_Memory warning 1]
  • There is a memory error.


  [AL. 1F8.1_Memory writing frequency warning]
  Cause                                          Check/action method                                                            Model
  1. The frequency of writing to the memory      Prepare for replacing the servo amplifier by making a backup of necessary      [G]
                                                 data or by other means.                                                        [B]
       exceeded the guaranteed number.
                                                 This warning can be disabled by [Pr. PF02.4 Memory writing frequency           [A]
                                                 warning enable/disable selection]. The memory may be broken if the memory
                                                 is used continuously while [Pr. PF02.4] is disabled.


  [AL. 1F8.2_Memory free space warning]
  Cause                                          Check/action method                                                            Model
  1. The available free space in the memory is   Delete unnecessary files to free up the memory.                                [G]
                                                 If no files can be deleted, make a backup of necessary data such as            [B]
       insufficient.
                                                 parameters, then initialize the servo amplifier.                               [A]
                                                 Refer to "Servo amplifier setting initialization" or "Drive unit setting
                                                 initialization" in the User's Manual (Introduction).
                                                 This warning can be disabled by [Pr. PF02.5 Memory free space warning
                                                 enable/disable selection]. [AL. 119.7 Memory free space error 4-1] may occur
                                                 if the memory is used continuously while [Pr. PF02.5] is disabled.


      1 SERVO AMPLIFIER TROUBLESHOOTING
168   1.3 Handling methods for alarms/warnings

---

## หน้า 171

[AL. 201 - 28F_Manufacturer setting error]
• A value of the servo parameters for manufacturer setting has been set incorrectly.                                                         1
Cause                                                 Check/action method                                                        Model
1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                 [A]
     manufacturer setting have been changed.


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings         169

---

## หน้า 172

[AL. 290 - 2FF_Manufacturer setting warning]
  • A value of the servo parameters for manufacturer setting has been set incorrectly.
  Cause                                                 Check/action method                                                        Model
  1. Values of the servo parameters for                 Set the servo parameters for manufacturer setting to the initial values.   [G]
                                                                                                                                   [A]
       manufacturer setting have been changed.


      1 SERVO AMPLIFIER TROUBLESHOOTING
170   1.3 Handling methods for alarms/warnings

---

## หน้า 173

[AL. 510_Voltage diagnosis error (safety sub-function)]
• There is a problem with the control circuit power supply voltage.                                                                               1
[AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]
Cause                                                  Check/action method                                                            Model
1. The power supply connection is incorrect.           Check the wiring.                                                              [G]
                                                       Refer to "SINGNALS AND WIRING" and "Example power circuit connections"
                                                       in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)

2. The servo amplifier has malfunctioned.              Replace the servo amplifier.

3. There is a problem with the surrounding             Check the power supply for noise. If there is noise, take countermeasures to
                                                       reduce the noise.
     environment.
                                                       Refer to "Noise reduction techniques" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)


[AL. 510.2_Power supply voltage diagnosis error A2 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.7_Power supply voltage diagnosis error A at startup (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.9_Power supply voltage diagnosis error B1 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.A_Power supply voltage diagnosis error B2 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.B_Power supply voltage diagnosis error B3 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.C_Power supply voltage diagnosis error B4 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.D_Power supply voltage diagnosis error B5 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.E_Power supply voltage diagnosis error B6 (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


[AL. 510.F_Power supply voltage diagnosis error B at startup (safety sub-function)]
Page 171 [AL. 510.1_Power supply voltage diagnosis error A1 (safety sub-function)]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings            171

---

## หน้า 174

[AL. 512_Memory error 1 (RAM) (safety sub-function)]
  • The internal part of the servo amplifier (RAM) has malfunctioned.


  [AL. 512.2_RAM diagnosis error A2 (safety sub-function)]
  Cause                                                 Check/action method                                                            Model
  1. An internal part of the servo amplifier has        Noise from the power supply may have caused the failure. Disconnect all        [G]
                                                        cables except for those for the control circuit power supply, then check the
       malfunctioned.
                                                        repeatability. If the failure continues, the servo amplifier may have
                                                        malfunctioned. Replace the servo amplifier.

  2. There is a problem with the surrounding            Check the power supply for noise. If there is noise, take countermeasures to
                                                        reduce the noise.
       environment.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


  [AL. 512.3_RAM diagnosis error A3 (safety sub-function)]
  Page 172 [AL. 512.2_RAM diagnosis error A2 (safety sub-function)]


  [AL. 512.A_RAM diagnosis error B2 (safety sub-function)]
  Page 172 [AL. 512.2_RAM diagnosis error A2 (safety sub-function)]


  [AL. 512.B_RAM diagnosis error B3 (safety sub-function)]
  Page 172 [AL. 512.2_RAM diagnosis error A2 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
172   1.3 Handling methods for alarms/warnings

---

## หน้า 175

[AL. 514_Control process error (safety sub-function)]
• The process did not complete within the specified time.                                                                                        1
[AL. 514.9_Control process error B (safety sub-function)]
Cause                                                 Check/action method                                                            Model
1. The servo parameter settings are incorrect.        Return the servo parameter to the value it had before the alarm occurrence,    [G]
                                                      then check if the problem occurs again.

2. An internal part of the servo amplifier has        Replace the servo amplifier.

     malfunctioned.
3. There is a problem with the surrounding            Check the power supply for noise. If there is noise, take countermeasures to
                                                      reduce the noise.
     environment.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)


[AL. 514.A_Control process error B2 (safety sub-function)]
Page 173 [AL. 514.9_Control process error B (safety sub-function)]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings            173

---

## หน้า 176

[AL. 515_Memory error 2 (ROM) (safety sub-function)]
  • The internal part of the servo amplifier (ROM) has malfunctioned.


  [AL. 515.9_ROM error B at power-on (safety sub-function)]
  Cause                                                         Check/action method                                                            Model
  1. There is a problem with operation of ROM at                Noise from the power supply may have caused the failure. Disconnect all        [G]
                                                                cables except for those for the control circuit power supply, then check the
       power-on.
                                                                repeatability. If the failure continues, the servo amplifier may have
                                                                malfunctioned. Replace the servo amplifier.

  2. There is a problem with the surrounding                    Check the power supply for noise. If there is noise, take countermeasures to
                                                                reduce the noise.
       environment.
                                                                Refer to "Noise reduction techniques" in the following manuals.
                                                                MR-J5 User's Manual (Hardware)
                                                                MR-J5D User's Manual (Hardware)

  3. The frequency of writing exceeded 100,000.                 Check if excessively frequent changes have been made to parameters, then
                                                                replace the servo amplifier. After replacing the servo amplifier, adjust the
                                                                processing so as to reduce the number of times changes are made to
                                                                parameters.


  [AL. 515.A_ROM error B during operation (safety sub-function)]
  Cause                                                         Check/action method                                                            Model
  1. There is a problem with operation of ROM in                Check if this alarm occurs when changing a parameter during normal             [G]
                                                                operation. If the alarm occurs, replace the controller.
       normal operation.
  2. Take actions according to the instructions of 2. to 3. in the following item.
  Page 174 [AL. 515.9_ROM error B at power-on (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
174    1.3 Handling methods for alarms/warnings

---

## หน้า 177

[AL. 516_Encoder initial communication error 1 (safety sub-
function)]                                                                                                                                       1
• There is a communication error between the encoder and servo amplifier.


[AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]
Cause                                               Check/action method                                                              Model
1. There is a problem with the encoder cable.       Check if the encoder cable has been disconnected or has shorted. If there is a   [G]
                                                    problem with the cable, repair or replace the cable.

2. The encoder has malfunctioned.                   Replace the servo motor.

3. The servo amplifier has malfunctioned.           Replace the servo amplifier.

4. There is a problem with the surrounding          Check the power supply for noise. If there is noise, take countermeasures to
                                                    reduce the noise.
     environment.
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)


[AL. 516.2_Encoder initial communication - Receive data error A2 (safety sub-function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.3_Encoder initial communication - Receive data error A3 (safety sub-function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.4_Encoder initial communication - Receive data error A4 (safety sub-function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.5_Encoder initial communication - Receive data error A5 (safety sub-function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.9_Encoder initial communication - Receive data error B1 (safety sub-function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.A_Encoder initial communication - Receive data error B2 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.B_Encoder initial communication - Receive data error B3 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.C_Encoder initial communication - Receive data error B4 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 516.D_Encoder initial communication - Receive data error B5 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


                                                                                   1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                     1.3 Handling methods for alarms/warnings              175

---

## หน้า 178

[AL. 517_Board error (safety sub-function)]
  • There is a problem with an internal part of the servo amplifier.


  [AL. 517.2_Board error A2 (safety sub-function)]
  Cause                                                   Check/action method                                                         Model
  1. An internal part of the servo amplifier has          Replace the servo amplifier.                                                [G]

       malfunctioned.
  2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                          appropriate countermeasures for the cause.
       environment.
                                                          If there is noise, take countermeasures to reduce the noise.
                                                          Refer to "Noise reduction techniques" in the following manuals.
                                                          MR-J5 User's Manual (Hardware)
                                                          MR-J5D User's Manual (Hardware)


  [AL. 517.9_Board error B1 (safety sub-function)]
  Page 176 [AL. 517.2_Board error A2 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
176   1.3 Handling methods for alarms/warnings

---

## หน้า 179

[AL. 518_Synchronous control error (safety sub-function)]
• There is a problem with an internal part of the servo amplifier.                                                                                 1
[AL. 518.2_Synchronous control error A2 (safety sub-function)]
Cause                                                   Check/action method                                                            Model
1. An internal part of the servo amplifier has          Replace the servo amplifier.                                                   [G]

     malfunctioned.
2. There is a problem with the surrounding              Check the power supply for noise. If there is noise, take countermeasures to
                                                        reduce the noise.
     environment.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 518.A_Synchronous control error B2 (safety sub-function)]
Page 177 [AL. 518.2_Synchronous control error A2 (safety sub-function)]


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings            177

---

## หน้า 180

[AL. 519_Memory error 3 (Flash-ROM) (safety sub-function)]
  • There is a problem with an internal part of the servo amplifier.


  [AL. 519.2_Flash-ROM error A2 (safety sub-function)]
  Cause                                                   Check/action method                                                            Model
  1. The Flash-ROM has malfunctioned.                     Noise from the power supply may have caused the failure. Disconnect all        [G]
                                                          cables except for those for the control circuit power supply, then check the
                                                          repeatability. If the failure continues, the servo amplifier may have
                                                          malfunctioned. Replace the servo amplifier.

  2. There is a problem with the surrounding              Check the power supply for noise. If there is noise, take countermeasures to
                                                          reduce the noise.
       environment.
                                                          Refer to "Noise reduction techniques" in the following manuals.
                                                          MR-J5 User's Manual (Hardware)
                                                          MR-J5D User's Manual (Hardware)


  [AL. 519.A_Flash-ROM error B2 (safety sub-function)]
  Page 178 [AL. 519.2_Flash-ROM error A2 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
178   1.3 Handling methods for alarms/warnings

---

## หน้า 181

[AL. 520_Encoder normal communication diagnosis error 1
(safety sub-function)]                                                                                                         1
• There is a communication error between the encoder and servo amplifier.


[AL. 520.1_Encoder normal communication 1 - Receive data error A1 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.2_Encoder normal communication 1 - Receive data error A2 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.3_Encoder normal communication 1 - Receive data error A3 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.4_Encoder normal communication 1 - Receive data error A4 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.9_Encoder normal communication 1 - Receive data error B1 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.A_Encoder normal communication 1 - Receive data error B2 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.B_Encoder normal communication 1 - Receive data error B3 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 520.C_Encoder normal communication 1 - Receive data error B4 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


                                                                            1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                              1.3 Handling methods for alarms/warnings   179

---

## หน้า 182

[AL. 521_Encoder normal communication diagnosis error 2
  (safety sub-function)]
  • The encoder detected an error signal.


  [AL. 521.1_Encoder normal communication 2 - Diagnosis error A1 (safety sub-
  function)]
  Cause                                                            Check/action method                                                                Model
  1. The voltage of the control circuit power supply               Check the voltage of the control circuit power supply. If an instantaneous         [G]
                                                                   power failure is occurring in the control circuit power supply, review the power
        has become unstable.
                                                                   supply environment.

  2. Take actions in accordance with the items shown below.
  Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


  [AL. 521.2_Encoder normal communication 2 - Diagnosis error A2 (safety sub-
  function)]
  Page 180 [AL. 521.1_Encoder normal communication 2 - Diagnosis error A1 (safety sub-function)]


  [AL. 521.3_Encoder normal communication 2 - Diagnosis error A3 (safety sub-
  function)]
  Page 180 [AL. 521.1_Encoder normal communication 2 - Diagnosis error A1 (safety sub-function)]


  [AL. 521.9_Encoder normal communication 2 - Diagnosis error B1 (safety sub-
  function)]
  Page 180 [AL. 521.1_Encoder normal communication 2 - Diagnosis error A1 (safety sub-function)]


  [AL. 521.A_Encoder normal communication 2 - Diagnosis error B2 (safety sub-
  function)]
  Page 180 [AL. 521.1_Encoder normal communication 2 - Diagnosis error A1 (safety sub-function)]


  [AL. 521.B_Encoder normal communication 2 - Diagnosis error B3 (safety sub-
  function)]
  Page 180 [AL. 521.1_Encoder normal communication 2 - Diagnosis error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
180    1.3 Handling methods for alarms/warnings

---

## หน้า 183

[AL. 522_Encoder normal communication diagnosis error 3
(safety sub-function)]                                                                                                      1
• The encoder detected an error signal.


[AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.2_Encoder normal communication 3 - Diagnosis error A2 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.3_Encoder normal communication 3 - Diagnosis error A3 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.4_Encoder normal communication 3 - Diagnosis error A4 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.9_Encoder normal communication 3 - Diagnosis error B1 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.A_Encoder normal communication 3 - Diagnosis error B2 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.B_Encoder normal communication 3 - Diagnosis error B3 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


[AL. 522.C_Encoder normal communication 3 - Diagnosis error B4 (safety sub-
function)]
Page 175 [AL. 516.1_Encoder initial communication - Receive data error A1 (safety sub-function)]


                                                                         1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                           1.3 Handling methods for alarms/warnings   181

---

## หน้า 184

[AL. 523_Encoder normal communication diagnosis error 4
  (safety sub-function)]
  • The encoder detected an error signal.


  [AL. 523.1_Encoder normal communication 4 - Diagnosis error A1 (safety sub-
  function)]
  Cause                                             Check/action method                             Model
  1. The encoder has malfunctioned.                 Replace the servo motor.                        [G]


  [AL. 523.2_Encoder normal communication 4 - Diagnosis error A2 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 523.3_Encoder normal communication 4 - Diagnosis error A3 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 523.4_Encoder normal communication 4 - Diagnosis error A4 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 523.9_Encoder normal communication 4 - Diagnosis error B1 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 523.A_Encoder normal communication 4 - Diagnosis error B2 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 523.B_Encoder normal communication 4 - Diagnosis error B3 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 523.C_Encoder normal communication 4 - Diagnosis error B4 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
182   1.3 Handling methods for alarms/warnings

---

## หน้า 185

[AL. 524_Encoder normal communication diagnosis error 5
(safety sub-function)]                                                                                                     1
• The encoder detected an error signal.


[AL. 524.1_Encoder normal communication 5 - Diagnosis error A1 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.2_Encoder normal communication 5 - Diagnosis error A2 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.3_Encoder normal communication 5 - Diagnosis error A3 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.4_Encoder normal communication 5 - Diagnosis error A4 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.9_Encoder normal communication 5 - Diagnosis error B1 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.A_Encoder normal communication 5 - Diagnosis error B2 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.B_Encoder normal communication 5 - Diagnosis error B3 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 524.C_Encoder normal communication 5 - Diagnosis error B4 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                          1.3 Handling methods for alarms/warnings   183

---

## หน้า 186

[AL. 525_Encoder normal communication diagnosis error 6
  (safety sub-function)]
  • The encoder detected an error signal.


  [AL. 525.1_Encoder normal communication 6 - Diagnosis error A1 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.2_Encoder normal communication 6 - Diagnosis error A2 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.3_Encoder normal communication 6 - Diagnosis error A3 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.4_Encoder normal communication 6 - Diagnosis error A4 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.9_Encoder normal communication 6 - Diagnosis error B1 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.A_Encoder normal communication 6 - Diagnosis error B2 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.B_Encoder normal communication 6 - Diagnosis error B3 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 525.C_Encoder normal communication 6 - Diagnosis error B4 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
184   1.3 Handling methods for alarms/warnings

---

## หน้า 187

[AL. 526_Encoder normal communication diagnosis error 7
(safety sub-function)]                                                                                                     1
• The encoder detected an error signal.


[AL. 526.1_Encoder normal communication 7 - Diagnosis error A1 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.2_Encoder normal communication 7 - Diagnosis error A2 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.3_Encoder normal communication 7 - Diagnosis error A3 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.4_Encoder normal communication 7 - Diagnosis error A4 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.9_Encoder normal communication 7 - Diagnosis error B1 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.A_Encoder normal communication 7 - Diagnosis error B2 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.B_Encoder normal communication 7 - Diagnosis error B3 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 526.C_Encoder normal communication 7 - Diagnosis error B4 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                          1.3 Handling methods for alarms/warnings   185

---

## หน้า 188

[AL. 527_Encoder normal communication diagnosis error 8
  (safety sub-function)]
  • The encoder detected an error signal.


  [AL. 527.1_Encoder normal communication 8 - Diagnosis error A1 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.2_Encoder normal communication 8 - Diagnosis error A2 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.3_Encoder normal communication 8 - Diagnosis error A3 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.4_Encoder normal communication 8 - Diagnosis error A4 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.9_Encoder normal communication 8 - Diagnosis error B1 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.A_Encoder normal communication 8 - Diagnosis error B2 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.B_Encoder normal communication 8 - Diagnosis error B3 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 527.C_Encoder normal communication 8 - Diagnosis error B4 (safety sub-
  function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
186   1.3 Handling methods for alarms/warnings

---

## หน้า 189

[AL. 528_Encoder normal communication diagnosis error 9
(safety sub-function)]                                                                                                     1
• The encoder detected an error signal.


[AL. 528.1_Encoder normal communication 9 - Diagnosis error A1 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.2_Encoder normal communication 9 - Diagnosis error A2 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.3_Encoder normal communication 9 - Diagnosis error A3 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.4_Encoder normal communication 9 - Diagnosis error A4 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.9_Encoder normal communication 9 - Diagnosis error B1 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.A_Encoder normal communication 9 - Diagnosis error B2 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.B_Encoder normal communication 9 - Diagnosis error B3 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


[AL. 528.C_Encoder normal communication 9 - Diagnosis error B4 (safety sub-
function)]
Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                          1.3 Handling methods for alarms/warnings   187

---

## หน้า 190

[AL. 529_Encoder data error (safety sub-function)]
  • There is an error in the data of the encoder.


  [AL. 529.1_Encoder position data error A (safety sub-function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


  [AL. 529.9_Encoder position data error B (safety sub-function)]
  Page 181 [AL. 522.1_Encoder normal communication 3 - Diagnosis error A1 (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
188   1.3 Handling methods for alarms/warnings

---

## หน้า 191

[AL. 52A_Position feedback error (safety sub-function)]
• There is an error in the data of the encoder.                                                                                                  1
[AL. 52A.1_Position feedback diagnosis error A (safety sub-function)]
Cause                                              Check/action method                                                               Model
1. The position feedback data does not change      Review the setting of [Pr. PSA22]. Alternatively, operate the system within the   [G]
                                                   time set in [Pr. PSA22].
     within the time set in [Pr. PSA22 Position
     feedback error detection time].
2. The servo motor has malfunctioned.              If the position feedback does not change even when the servo motor is driven,
                                                   replace the servo motor.

3. The servo amplifier has malfunctioned.          Replace the servo amplifier.


[AL. 52A.9_Position feedback diagnosis error B (safety sub-function)]
Page 189 [AL. 52A.1_Position feedback diagnosis error A (safety sub-function)]


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings               189

---

## หน้า 192

[AL. 52B_Encoder thermal error (safety sub-function)]
  • There is a problem with the internal temperature of the encoder.


  [AL. 52B.1_Encoder thermal error A (safety sub-function)]
  Cause                                                 Check/action method                                                           Model
  1. The ambient temperature of the servo motor         Check the ambient temperature, and if the temperature exceeds the specified   [G]
                                                        value, lower the ambient temperature.
       has exceeded the specified value.
  2. The ambient temperature of the servo motor         Check the ambient temperature, and if the temperature has fallen below the
                                                        specified value, raise the ambient temperature.
       has fallen below the specified value.
  3. The servo motor is overloaded.                     Reduce the load or review the operation pattern.

  4. The thermal sensor in the encoder has              Replace the servo motor.

       malfunctioned.
  5. The servo amplifier has malfunctioned.             Replace the servo amplifier.


  [AL. 52B.9_Encoder thermal error B (safety sub-function)]
  Page 190 [AL. 52B.1_Encoder thermal error A (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
190   1.3 Handling methods for alarms/warnings

---

## หน้า 193

[AL. 537_Parameter setting range error (safety sub-function)]
• There is an error in a functional safety parameter.                                                                                            1
[AL. 537.1_Parameter setting range error A (safety sub-function)]
Cause                                                   Check/action method                                                          Model
1. A functional safety parameter was set outside        Check the parameter error No. on the alarm display screen of MR              [G]
                                                        Configurator2 or with another method, then review the setting value of the
     of the setting range.
                                                        functional safety parameter.


[AL. 537.2_Parameter combination error A (safety sub-function)]
Cause                                                   Check/action method                                                          Model
1. A servo parameter or a functional safety             Check the parameter error No. on the alarm display screen of MR              [G]
                                                        Configurator2 or with another method, then review the setting value of the
     parameter has been set incorrectly.
                                                        servo parameter or the functional safety parameter.
                                                        Refer to "Parameter combinations that trigger [AL. 537.2 Parameter
                                                        combination error A (safety sub-function)]" in the following manual.
                                                        MR-J5 User's Manual (Function)


[AL. 537.3_Parameter setting error A (safety sub-function)]
Cause                                                   Check/action method                                                          Model
1. A functional safety parameter failed to be set       Check the parameter error No. on the alarm display screen of MR              [G]
                                                        Configurator2 or with another method, then review the setting value of the
     properly.
                                                        functional safety parameter.


[AL. 537.9_Parameter setting range error B (safety sub-function)]
Page 191 [AL. 537.1_Parameter setting range error A (safety sub-function)]


[AL. 537.A_Parameter combination error B (safety sub-function)]
Page 191 [AL. 537.2_Parameter combination error A (safety sub-function)]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings            191

---

## หน้า 194

[AL. 53A_Parameter verification error (safety sub-function)]
  • An error occurred in the functional safety parameter.


  [AL. 53A.2_Parameter verification error A2 (safety sub-function)]
  Cause                                                 Check/action method                                                            Model
  1. There is a problem with the functional safety      Confirm which parameter has an error by using MR Configurator2, then set the   [G]
                                                        parameter correctly.
       parameter settings.
  2. The servo amplifier has malfunctioned.             Replace the servo amplifier.


  [AL. 53A.A_Parameter verification error B2 (safety sub-function)]
  Page 192 [AL. 53A.2_Parameter verification error A2 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
192    1.3 Handling methods for alarms/warnings

---

## หน้า 195

[AL. 540_Internal diagnosis error 1 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                                            1
[AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]
Cause                                                   Check/action method                                                            Model
1. The servo amplifier has malfunctioned.               Replace the servo amplifier.                                                   [G]

2. There is a problem with the surrounding              Check the power supply for noise. If there is noise, take countermeasures to
                                                        reduce the noise.
     environment.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 540.2_Internal diagnosis error 1 - Data error A2 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 540.3_Internal diagnosis error 1 - Data error A3 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 540.4_Internal diagnosis error 1 - Data error A4 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 540.9_Internal diagnosis error 1 - Data error B1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 540.A_Internal diagnosis error 1 - Data error B2 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings            193

---

## หน้า 196

[AL. 541_Internal diagnosis error 2 (safety sub-function)]
  • There is an error in the result from the functional safety diagnosis.


  [AL. 541.1_Internal diagnosis error 2 - Data error A1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.2_Internal diagnosis error 2 - Data error A2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.3_Internal diagnosis error 2 - Data error A3 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.4_Internal diagnosis error 2 - Data error A4 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.5_Internal diagnosis error 2 - Data error A5 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.9_Internal diagnosis error 2 - Data error B1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.A_Internal diagnosis error 2 - Data error B2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.B_Internal diagnosis error 2 - Data error B3 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.C_Internal diagnosis error 2 - Data error B4 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 541.D_Internal diagnosis error 2 - Data error B5 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
194    1.3 Handling methods for alarms/warnings

---

## หน้า 197

[AL. 542_Internal diagnosis error 3 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                       1
[AL. 542.1_Internal diagnosis error 3 - Data error A1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 542.9_Internal diagnosis error 3 - Data error B1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                             1.3 Handling methods for alarms/warnings   195

---

## หน้า 198

[AL. 543_Internal diagnosis error 4 (safety sub-function)]
  • There is an error in the result from the functional safety diagnosis.


  [AL. 543.1_Internal diagnosis error 4 - Data error A1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.2_Internal diagnosis error 4 - Data error A2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.3_Internal diagnosis error 4 - Data error A3 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.9_Internal diagnosis error 4 - Data error B1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.A_Internal diagnosis error 4 - Data error B2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.B_Internal diagnosis error 4 - Data error B3 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.C_Internal diagnosis error 4 - Data error B4 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.D_Internal diagnosis error 4 - Data error B5 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 543.E_Internal diagnosis error 4 - Data error B6 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
196    1.3 Handling methods for alarms/warnings

---

## หน้า 199

[AL. 544_Temperature diagnosis error (safety sub-function)]
• An error occurred in a temperature diagnosis.                                                                                                      1
[AL. 544.1_Temperature diagnosis error A1 (safety sub-function)]
Cause                                                      Check/action method                                                           Model
1. The ambient temperature exceeded the                    Check the ambient temperature, and if the temperature exceeds the specified   [G]
                                                           value, lower the ambient temperature.
     specified value (60 °C).
2. The ambient temperature is 0 °C or lower.               Check the ambient temperature, and if the temperature is lower than 0 °C,
                                                           raise the ambient temperature.

3. The servo amplifier does not meet the                   Check the specifications of close mounting.
                                                           Refer to "Mounting direction and clearances" in the following manual.
     specifications of close mounting.
                                                           MR-J5 User's Manual (Hardware)

4. A cooling fan, heat sink, or opening is clogged. Clean the cooling fan, heat sink, or openings.
5. The servo amplifier has malfunctioned.           Replace the servo amplifier.


[AL. 544.2_Temperature diagnosis error A2 (safety sub-function)]
Page 197 [AL. 544.1_Temperature diagnosis error A1 (safety sub-function)]


[AL. 544.9_Temperature diagnosis error B1 (safety sub-function)]
Page 197 [AL. 544.1_Temperature diagnosis error A1 (safety sub-function)]


[AL. 544.A_Temperature diagnosis error B2 (safety sub-function)]
Page 197 [AL. 544.1_Temperature diagnosis error A1 (safety sub-function)]


                                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                          1.3 Handling methods for alarms/warnings             197

---

## หน้า 200

[AL. 545_Internal diagnosis error 5 (safety sub-function)]
  • There is an error in the result from the functional safety diagnosis.


  [AL. 545.2_Internal diagnosis error 5 - Data error A2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
198    1.3 Handling methods for alarms/warnings

---

## หน้า 201

[AL. 546_Internal diagnosis error 6 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                       1
[AL. 546.1_Internal diagnosis error 6 - Data error A1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 546.2_Internal diagnosis error 6 - Data error A2 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 546.9_Internal diagnosis error 6 - Data error B1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 546.A_Internal diagnosis error 6 - Data error B2 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                             1.3 Handling methods for alarms/warnings   199

---

## หน้า 202

[AL. 547_Internal diagnosis error 7 (safety sub-function)]
  • There is an error in the result from the functional safety diagnosis.


  [AL. 547.1_Internal diagnosis error 7 - Data error A1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 547.2_Internal diagnosis error 7 - Data error A2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 547.9_Internal diagnosis error 7 - Data error B1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 547.A_Internal diagnosis error 7 - Data error B2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
200    1.3 Handling methods for alarms/warnings

---

## หน้า 203

[AL. 549_Internal diagnosis error 8 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                       1
[AL. 549.1_Internal diagnosis error 8 - Data error A1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 549.9_Internal diagnosis error 8 - Data error B1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                             1.3 Handling methods for alarms/warnings   201

---

## หน้า 204

[AL. 54A_Internal diagnosis error 9 (safety sub-function)]
  • There is an error in the result from the functional safety diagnosis.


  [AL. 54A.1_Internal diagnosis error 9 - Data error A1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 54A.2_Internal diagnosis error 9 - Data error A2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 54A.3_Internal diagnosis error 9 - Data error A3 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 54A.9_Internal diagnosis error 9 - Data error B1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 54A.A_Internal diagnosis error 9 - Data error B2 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


  [AL. 54A.B_Internal diagnosis error 9 - Data error B3 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
202    1.3 Handling methods for alarms/warnings

---

## หน้า 205

[AL. 54D_Internal diagnosis error 10 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                       1
[AL. 54D.1_Internal diagnosis error 10 - Data error A1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 54D.2_Internal diagnosis error 10 - Data error A2 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 54D.3_Internal diagnosis error 10 - Data error A3 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 54D.4_Internal diagnosis error 10 - Data error A4 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 54D.9_Internal diagnosis error 10 - Data error B1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                             1.3 Handling methods for alarms/warnings   203

---

## หน้า 206

[AL. 54F_Safety software error (safety sub-function)]
  • An error occurred in the safety software.


  [AL. 54F.1_Register setting error A1 (safety sub-function)]
  Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
204    1.3 Handling methods for alarms/warnings

---

## หน้า 207

[AL. 550_Internal diagnosis error 11 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                       1
[AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]
Page 193 [AL. 540.1_Internal diagnosis error 1 - Data error A1 (safety sub-function)]


[AL. 550.2_Internal diagnosis error 11 - Internal signal error A2 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 550.3_Internal diagnosis error 11 - Internal signal error A3 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 550.4_Internal diagnosis error 11 - Internal signal error A4 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 550.9_Internal diagnosis error 11 - Internal signal error B1 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 550.A_Internal diagnosis error 11 - Internal signal error B2 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 550.B_Internal diagnosis error 11 - Internal signal error B3 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 550.C_Internal diagnosis error 11 - Internal signal error B4 (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                             1.3 Handling methods for alarms/warnings   205

---

## หน้า 208

[AL. 551_Internal diagnosis error 12 (safety sub-function)]
  • There is an error in the result from the functional safety diagnosis.


  [AL. 551.1_Internal diagnosis error 12 - Internal signal error A1 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.2_Internal diagnosis error 12 - Internal signal error A2 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.3_Internal diagnosis error 12 - Internal signal error A3 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.4_Internal diagnosis error 12 - Internal signal error A4 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.9_Internal diagnosis error 12 - Internal signal error B1 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.A_Internal diagnosis error 12 - Internal signal error B2 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.B_Internal diagnosis error 12 - Internal signal error B3 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


  [AL. 551.C_Internal diagnosis error 12 - Internal signal error B4 (safety sub-function)]
  Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
206    1.3 Handling methods for alarms/warnings

---

## หน้า 209

[AL. 552_Internal diagnosis error 13 (safety sub-function)]
• There is an error in the result from the functional safety diagnosis.                                                        1
[AL. 552.1_Internal diagnosis error 13 - Internal signal error A1 (safety sub-function)]
Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


[AL. 552.9_Internal diagnosis error 13 - Internal signal error B1 (safety sub-function)]
Page 205 [AL. 550.1_Internal diagnosis error 11 - Internal signal error A1 (safety sub-function)]


                                                                            1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                              1.3 Handling methods for alarms/warnings   207

---

## หน้า 210

[AL. 553_Input device diagnosis error (safety sub-function)]
  • There is a problem with the input device.


  [AL. 553.1_SDI1A test pulse diagnosis error (safety sub-function)]
  Cause                                               Check/action method                                                           Model
  1. A signal of an input device has not been input   Check if the input device cable is wired correctly.                           [G]

       correctly.
  2. The functional safety parameter in the input     Check if the functional safety parameter has been set correctly.

       device setting has been set incorrectly.
  3. The test pulse time has been set incorrectly.    Review the setting value of [Pr. PSD26 Input device - Test pulse off time].

  4. The servo amplifier has malfunctioned.           Replace the servo amplifier.

  5. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                      appropriate countermeasures for the cause.
       environment.
                                                      If there is noise, take countermeasures to reduce the noise.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)


  [AL. 553.2_SDI2A test pulse diagnosis error (safety sub-function)]
  Page 208 [AL. 553.1_SDI1A test pulse diagnosis error (safety sub-function)]


  [AL. 553.3_SDI3A test pulse diagnosis error (safety sub-function)]
  Page 208 [AL. 553.1_SDI1A test pulse diagnosis error (safety sub-function)]


  [AL. 553.9_SDI1B test pulse diagnosis error (safety sub-function)]
  Page 208 [AL. 553.1_SDI1A test pulse diagnosis error (safety sub-function)]


  [AL. 553.A_SDI2B test pulse diagnosis error (safety sub-function)]
  Page 208 [AL. 553.1_SDI1A test pulse diagnosis error (safety sub-function)]


  [AL. 553.B_SDI3B test pulse diagnosis error (safety sub-function)]
  Page 208 [AL. 553.1_SDI1A test pulse diagnosis error (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
208    1.3 Handling methods for alarms/warnings

---

## หน้า 211

[AL. 554_Input device internal diagnosis error (safety sub-
function)]                                                                                                                                 1
• There is an error in the input device.


[AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]
Cause                                              Check/action method                                                         Model
1. The servo amplifier has malfunctioned.          Replace the servo amplifier.                                                [G]

2. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                   appropriate countermeasures for the cause.
     environment.
                                                   If there is noise, take countermeasures to reduce the noise.
                                                   Refer to "Noise reduction techniques" in the following manuals.
                                                   MR-J5 User's Manual (Hardware)
                                                   MR-J5D User's Manual (Hardware)


[AL. 554.2_SDI2A internal diagnosis error (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 554.3_SDI3A internal diagnosis error (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 554.9_SDI1B internal diagnosis error (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 554.A_SDI2B internal diagnosis error (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


[AL. 554.B_SDI3B internal diagnosis error (safety sub-function)]
Page 209 [AL. 554.1_SDI1A internal diagnosis error (safety sub-function)]


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings         209

---

## หน้า 212

[AL. 555_Output device diagnosis error 1 (safety sub-function)]
  • There is an error in the output device.


  [AL. 555.1_SDO1A output mismatch error (safety sub-function)]
  Cause                                                    Check/action method                                                                Model
  1. A signal of an output device has been output          Check if the output device cable is wired correctly, or check if the load of the   [G]
                                                           output device is within specifications.
       incorrectly, or the load of the output device has
       exceeded the specified range.
  2. The output device current is too large.               Check if the current value is within the specified value. Lower the output
                                                           current if the specified value is exceeded.

  3. The servo amplifier has malfunctioned.                Replace the servo amplifier.

  4. There is a problem with the surrounding               Check the noise, ambient temperature, and other conditions, and implement
                                                           appropriate countermeasures for the cause.
       environment.
                                                           If there is noise, take countermeasures to reduce the noise.
                                                           Refer to "Noise reduction techniques" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)


  [AL. 555.2_SDO2A output mismatch error (safety sub-function)]
  Page 210 [AL. 555.1_SDO1A output mismatch error (safety sub-function)]


  [AL. 555.3_SDO3A output mismatch error (safety sub-function)]
  Page 210 [AL. 555.1_SDO1A output mismatch error (safety sub-function)]


  [AL. 555.9_SDO1B output mismatch error (safety sub-function)]
  Page 210 [AL. 555.1_SDO1A output mismatch error (safety sub-function)]


  [AL. 555.A_SDO2B output mismatch error (safety sub-function)]
  Page 210 [AL. 555.1_SDO1A output mismatch error (safety sub-function)]


  [AL. 555.B_SDO3B output mismatch error (safety sub-function)]
  Page 210 [AL. 555.1_SDO1A output mismatch error (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
210   1.3 Handling methods for alarms/warnings

---

## หน้า 213

[AL. 556_Output device diagnosis error 2 (safety sub-function)]
• There is an error in the output device.                                                                                                      1
[AL. 556.1_SDO1A test pulse diagnosis error (safety sub-function)]
Cause                                                         Check/action method                                                  Model
1. [Pr. PSD30 Output device - Test pulse off time]            Review the setting value of [Pr. PSD30].                             [G]

     is set incorrectly.
2. Take actions in accordance with the items shown below.
Page 210 [AL. 555.1_SDO1A output mismatch error (safety sub-function)]


[AL. 556.2_SDO2A test pulse diagnosis error (safety sub-function)]
Page 211 [AL. 556.1_SDO1A test pulse diagnosis error (safety sub-function)]


[AL. 556.3_SDO3A test pulse diagnosis error (safety sub-function)]
Page 211 [AL. 556.1_SDO1A test pulse diagnosis error (safety sub-function)]


[AL. 556.9_SDO1B test pulse diagnosis error (safety sub-function)]
Page 211 [AL. 556.1_SDO1A test pulse diagnosis error (safety sub-function)]


[AL. 556.A_SDO2B test pulse diagnosis error (safety sub-function)]
Page 211 [AL. 556.1_SDO1A test pulse diagnosis error (safety sub-function)]


[AL. 556.B_SDO3B test pulse diagnosis error (safety sub-function)]
Page 211 [AL. 556.1_SDO1A test pulse diagnosis error (safety sub-function)]


                                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                             1.3 Handling methods for alarms/warnings    211

---

## หน้า 214

[AL. 557_Input device mismatch detection (safety sub-function)]
  • An input device mismatch was detected.


  [AL. 557.1_SDI1 input mismatch error A (safety sub-function)]
  Cause                                              Check/action method                                                         Model
  1. The input signals of the SDI1A and SDI1B        Review the wiring of SDI1A and SDI1B.                                       [G]
                                                     For the wiring, refer to "USING STO FUNCTION" and "USING FUNCTIONAL
       remained mismatched for longer than the
                                                     SAFETY" in the following manuals.
       specified time ([Pr. PSD18 Permissible time   MR-J5 User's Manual (Hardware)
       for mismatches SDI1]).                        MR-J5D User's Manual (Hardware)
                                                     Set [Pr. PSD18] to a value longer than the mismatched time of SDI1.

  2. The servo amplifier has malfunctioned.          Replace the servo amplifier.

  3. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
       environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)


  [AL. 557.2_SDI2 input mismatch error A (safety sub-function)]
  Cause                                              Check/action method                                                         Model
  1. The input signals of SDI2A and SDI2B            Review the wiring of SDI2A and SDI2B.                                       [G]
                                                     For the wiring, refer to "USING STO FUNCTION" and "USING FUNCTIONAL
       remained mismatched for longer than the
                                                     SAFETY" in the following manuals.
       specified time ([Pr. PSD19 Permissible time   MR-J5 User's Manual (Hardware)
       for mismatches SDI2]).                        MR-J5D User's Manual (Hardware)
                                                     Set [Pr. PSD19] to a value longer than the mismatched time of SDI2.

  2. The servo amplifier has malfunctioned.          Replace the servo amplifier.

  3. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
       environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)


  [AL. 557.3_SDI3 input mismatch error A (safety sub-function)]
  Cause                                              Check/action method                                                         Model
  1. The input signals of SDI3A and SDI3B            Review the wiring of SDI3A and SDI3B.                                       [G]
                                                     For the wiring, refer to "USING STO FUNCTION" and "USING FUNCTIONAL
       remained mismatched for longer than the
                                                     SAFETY" in the following manuals.
       specified time ([Pr. PSD20 Permissible time   MR-J5 User's Manual (Hardware)
       for mismatches SDI3]).                        MR-J5D User's Manual (Hardware)
                                                     Set [Pr. PSD20] to a value longer than the mismatched time of SDI3.

  2. The servo amplifier has malfunctioned.          Replace the servo amplifier.

  3. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
       environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)


      1 SERVO AMPLIFIER TROUBLESHOOTING
212   1.3 Handling methods for alarms/warnings

---

## หน้า 215

[AL. 557.9_SDI1 input mismatch error B (safety sub-function)]
Page 212 [AL. 557.1_SDI1 input mismatch error A (safety sub-function)]
                                                                                                                             1
[AL. 557.A_SDI2 input mismatch error B (safety sub-function)]
Page 212 [AL. 557.2_SDI2 input mismatch error A (safety sub-function)]


[AL. 557.B_SDI3 input mismatch error B (safety sub-function)]
Page 212 [AL. 557.3_SDI3 input mismatch error A (safety sub-function)]


                                                                          1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                            1.3 Handling methods for alarms/warnings   213

---

## หน้า 216

[AL. 560_Stop error (safety sub-function)]
  • The safety sub-function detected an error of the stop position.


  [AL. 560.1_SOS feedback speed exceeded A]
  Cause                                                   Check/action method                                                             Model
  1. The state where the absolute value of the            Review the parameter or the operation pattern.                                  [G]
                                                          If the servo motor overshoots as it stops, take actions such as adjusting the
       servo motor speed exceeds the setting value
                                                          gains or setting a larger value in [Pr. PSA15].
       of [Pr. PSA04 Safety sub-function - Stop           Refer to "SS2/SOS function" in the following manual.
       speed] continued for the time set in [Pr. PSA15    MR-J5 User's Manual (Function)

       Safety sub-function - Speed detection delay
       time] or longer during operation of the SOS
       function.
  2. The encoder has malfunctioned.                       Replace the servo motor.

  3. The servo amplifier has malfunctioned.               Replace the servo amplifier.

  4. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                          appropriate countermeasures for the cause.
       environment.
                                                          If there is noise, take countermeasures to reduce the noise.
                                                          Refer to "Noise reduction techniques" in the following manuals.
                                                          MR-J5 User's Manual (Hardware)
                                                          MR-J5D User's Manual (Hardware)


  [AL. 560.2_SOS command speed exceeded A]
  Cause                                                   Check/action method                                                             Model
  1. The state where the absolute value of the            Review the parameter or the operation pattern.                                  [G]
                                                          Set [Pr. PSA03 SS1/SS2 deceleration monitor time] to a longer time than the
       speed command exceeds the setting value of
                                                          deceleration time.
       [Pr. PSA04 Safety sub-function - Stop speed]       Check if the speed command has been input after SOS was activated.
       continued for the time set in [Pr. PSA15 Safety    Refer to "SS2/SOS function" in the following manual.
                                                          MR-J5 User's Manual (Function)
       sub-function - Speed detection delay time] or
       longer during operation of the SOS function.
  2. Take actions according to the instructions of 2. to 4. in the following item.
  Page 214 [AL. 560.1_SOS feedback speed exceeded A]


  [AL. 560.3_SOS feedback position exceeded A]
  Cause                                                   Check/action method                                                             Model
  1. The feedback position changed by the value           Review the parameter or the operation pattern.                                  [G]
                                                          If the servo motor overshoots as it stops, take actions such as adjusting the
       equal to or more than the setting value of [Pr.
                                                          gains or setting a larger value in [Pr. PSA17].
       PSA05 SOS permissible travel distance], and        Refer to "SS2/SOS function" in the following manual.
       the position remained out of the permissible       MR-J5 User's Manual (Function)

       range for the time set in [Pr. PSA17 Safety
       sub-function - Position detection delay time] or
       longer during operation of the SOS function.
  2. Take actions according to the instructions of 2. to 4. in the following item.
  Page 214 [AL. 560.1_SOS feedback speed exceeded A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
214   1.3 Handling methods for alarms/warnings

---

## หน้า 217

[AL. 560.9_SOS feedback speed exceeded B]
Page 214 [AL. 560.1_SOS feedback speed exceeded A]
                                                                                                            1
[AL. 560.A_SOS command speed exceeded B]
Page 214 [AL. 560.2_SOS command speed exceeded A]


[AL. 560.B_SOS feedback position exceeded B]
Page 214 [AL. 560.3_SOS feedback position exceeded A]


                                                         1 SERVO AMPLIFIER TROUBLESHOOTING
                                                           1.3 Handling methods for alarms/warnings   215

---

## หน้า 218

[AL. 561_Safety speed monitor error 1 (safety sub-function)]
  • The safety sub-function detected an error of the servo motor speed.


  [AL. 561.1_SLS1 feedback speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       servo motor speed exceeds the setting value
                                                         than the value of [Pr. PSA11] or setting the time required for deceleration in
       of [Pr. PSA11 SLS speed 1] continued for the      [Pr. PSA07 SLS deceleration monitor time 1].
       time set in [Pr. PSA15 Safety sub-function -      Refer to "SLS function" in the following manual.
                                                         MR-J5 User's Manual (Function)
       Speed detection delay time] or longer during
       operation of the SLS function.
  2. The settings of the electronic gear are             Check the setting value of the electronic gear.
                                                         Refer to "Electronic gear function" in the following manual.
       incorrect.
                                                         MR-J5 User's Manual (Function)

  3. The servo system is unstable and oscillating.       Adjust the servo gain or reduce the load.

  4. The velocity waveform overshot.                     Increase the acceleration/deceleration time constants.

  5. The connection destination of the encoder           Check the connection destination of the encoder.

       cable is incorrect.
  6. The encoder has malfunctioned.                      Replace the servo motor.


  [AL. 561.2_SLS1 command speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       speed command exceeds the setting value of
                                                         than the value of [Pr. PSA11] or setting [Pr. PSA15] to a longer value.
       [Pr. PSA11 SLS speed 1] continued for the         If in torque control, set the speed limit to a value equal to or lower than the
       time set in [Pr. PSA15 Safety sub-function -      value of [Pr. PSA11].
                                                         Refer to "SLS function" in the following manual.
       Speed detection delay time] or longer during      MR-J5 User's Manual (Function)
       operation of the SLS function.
  2. Take actions according to the instructions of 5. to 6. in the following item.
  Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


  [AL. 561.3_SLS2 feedback speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       servo motor speed exceeds the setting value
                                                         than the value of [Pr. PSA12] or setting the time required for deceleration in
       of [Pr. PSA12 SLS speed 2] continued for the      [Pr. PSA07 SLS deceleration monitor time 1].
       time set in [Pr. PSA15 Safety sub-function -      Refer to "SLS function" in the following manual.
                                                         MR-J5 User's Manual (Function)
       Speed detection delay time] or longer during
       operation of the SLS function.
  2. Take actions according to the instructions of 2. to 6. in the following item.
  Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
216   1.3 Handling methods for alarms/warnings

---

## หน้า 219

[AL. 561.4_SLS2 command speed exceeded A]
Cause                                                  Check/action method                                                               Model       1
1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                       Take actions such as setting the speed command to a value equal to or lower
     speed command exceeds the setting value of
                                                       than the value of [Pr. PSA12] or setting [Pr. PSA15] to a longer value.
     [Pr. PSA12 SLS speed 2] continued for the         If in torque control, set the speed limit to a value equal to or lower than the
     time set in [Pr. PSA15 Safety sub-function -      value of [Pr. PSA12].
                                                       Refer to "SLS function" in the following manual.
     Speed detection delay time] or longer during      MR-J5 User's Manual (Function)
     operation of the SLS function.
2. Take actions according to the instructions of 5. to 6. in the following item.
Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


[AL. 561.9_SLS1 feedback speed exceeded B]
Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


[AL. 561.A_SLS1 command speed exceeded B]
Page 216 [AL. 561.2_SLS1 command speed exceeded A]


[AL. 561.B_SLS2 feedback speed exceeded B]
Page 216 [AL. 561.3_SLS2 feedback speed exceeded A]


[AL. 561.C_SLS2 command speed exceeded B]
Page 217 [AL. 561.4_SLS2 command speed exceeded A]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings                217

---

## หน้า 220

[AL. 562_Safety speed monitor error 2 (safety sub-function)]
  • The safety sub-function detected an error of the servo motor speed.


  [AL. 562.1_SLS3 feedback speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       servo motor speed exceeds the setting value
                                                         than the value of [Pr. PSA13] or setting the time required for deceleration in
       of [Pr. PSA13 SLS speed 3] continued for the      [Pr. PSA07 SLS deceleration monitor time 1].
       time set in [Pr. PSA15 Safety sub-function -      Refer to "SLS function" in the following manual.
                                                         MR-J5 User's Manual (Function)
       Speed detection delay time] or longer during
       operation of the SLS function.
  2. Take actions according to the instructions of 2. to 6. in the following item.
  Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


  [AL. 562.2_SLS3 command speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       speed command exceeds the setting value of
                                                         than the value of [Pr. PSA13] or setting [Pr. PSA15] to a longer value.
       [Pr. PSA13 SLS speed 3] continued for the         If in torque control, set the speed limit to a value equal to or lower than the
       time set in [Pr. PSA15 Safety sub-function -      value of [Pr. PSA13].
                                                         Refer to "SLS function" in the following manual.
       Speed detection delay time] or longer during      MR-J5 User's Manual (Function)
       operation of the SLS function.
  2. Take actions according to the instructions of 5. to 6. in the following item.
  Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


  [AL. 562.3_SLS4 feedback speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       servo motor speed exceeds the setting value
                                                         than the value of [Pr. PSA14] or setting the time required for deceleration in
       of [Pr. PSA14 SLS speed 4] continued for the      [Pr. PSA07 SLS deceleration monitor time 1].
       time set in [Pr. PSA15 Safety sub-function -      Refer to "SLS function" in the following manual.
                                                         MR-J5 User's Manual (Function)
       Speed detection delay time] or longer during
       operation of the SLS function.
  2. Take actions according to the instructions of 2. to 6. in the following item.
  Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


  [AL. 562.4_SLS4 command speed exceeded A]
  Cause                                                  Check/action method                                                               Model
  1. The state where the absolute value of the           Review the parameter or the operation pattern.                                    [G]
                                                         Take actions such as setting the speed command to a value equal to or lower
       speed command exceeds the setting value of
                                                         than the value of [Pr. PSA14] or setting [Pr. PSA15] to a longer value.
       [Pr. PSA14 SLS speed 4] continued for the         If in torque control, set the speed limit to a value equal to or lower than the
       time set in [Pr. PSA15 Safety sub-function -      value of [Pr. PSA14].
                                                         Refer to "SLS function" in the following manual.
       Speed detection delay time] or longer during      MR-J5 User's Manual (Function)
       operation of the SLS function.
  2. Take actions according to the instructions of 5. to 6. in the following item.
  Page 216 [AL. 561.1_SLS1 feedback speed exceeded A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
218   1.3 Handling methods for alarms/warnings

---

## หน้า 221

[AL. 562.9_SLS3 feedback speed exceeded B]
Page 218 [AL. 562.1_SLS3 feedback speed exceeded A]
                                                                                                          1
[AL. 562.A_SLS3 command speed exceeded B]
Page 218 [AL. 562.2_SLS3 command speed exceeded A]


[AL. 562.B_SLS4 feedback speed exceeded B]
Page 218 [AL. 562.3_SLS4 feedback speed exceeded A]


[AL. 562.C_SLS4 command speed exceeded B]
Page 218 [AL. 562.4_SLS4 command speed exceeded A]


                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                         1.3 Handling methods for alarms/warnings   219

---

## หน้า 222

[AL. 563_Deceleration monitor error (safety sub-function)]
  • There is a problem with deceleration operation in the safety sub-function.


  [AL. 563.1_SS1 feedback speed exceeded A]
  Cause                                                  Check/action method                                                              Model
  1. The servo motor exceeded the observation            Review the parameter or the operation pattern.                                   [G]
                                                         Take actions such as setting a larger value in [Pr. PSA26 SS1/SS2
       speed specified by [Pr. PSA24 SS1/SS2
                                                         deceleration monitor delay time] or adjusting the servo gains.
       deceleration monitor time constant] from the      Refer to "SS1 function" in the following manual.
       observation speed when the SS1 command            MR-J5 User's Manual (Function)

       was turned off during operation of the SS1
       function.
  2. The connection destination of the encoder           Check the connection destination of the encoder.

       cable is incorrect.
  3. There is a problem with the servo motor or the      Replace the servo motor or the servo motor power cable.

       servo motor power cable.
  4. The encoder has malfunctioned.                      Replace the servo motor.

  5. The servo amplifier has malfunctioned.              Replace the servo amplifier.

  6. There is a problem with the surrounding             Check the noise, ambient temperature, and other conditions, and implement
                                                         appropriate countermeasures for the cause.
       environment.
                                                         If there is noise, take countermeasures to reduce the noise.
                                                         Refer to "Noise reduction techniques" in the following manuals.
                                                         MR-J5 User's Manual (Hardware)
                                                         MR-J5D User's Manual (Hardware)


  [AL. 563.2_SS1 command speed exceeded A]
  Cause                                                  Check/action method                                                              Model
  1. A speed command was input exceeding the             Review the parameter or the operation pattern.                                   [G]
                                                         Take actions such as performing settings so that the time set in [Pr. PC24
       observation speed specified by [Pr. PSA24
                                                         Deceleration time constant at forced stop] becomes shorter than in [Pr.
       SS1/SS2 deceleration monitor time constant]       PSA24].
       from the observation speed when the SS1           Refer to "SS1 function" in the following manual.
                                                         MR-J5 User's Manual (Function)
       command was turned off during operation of
       the SS1 function.
  2. Take actions according to the instructions of 2. to 6. in the following item.
  Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


  [AL. 563.3_SS2 feedback speed exceeded A]
  Cause                                                  Check/action method                                                              Model
  1. The servo motor exceeded the observation            Review the parameter or the operation pattern.                                   [G]
                                                         Take actions such as performing settings so that the deceleration command
       speed specified by [Pr. PSA24 SS1/SS2
                                                         from the controller does not exceed the deceleration monitor time constant,
       deceleration monitor time constant] from the      setting a larger value in [Pr. PSA26 SS1/SS2 deceleration monitor delay time],
       observation speed when the SS2 command            or adjusting the servo gains.
                                                         Refer to "SS2/SOS function" in the following manual.
       was turned off during operation of the SS2        MR-J5 User's Manual (Function)
       function.
  2. Take actions according to the instructions of 2. to 6. in the following item.
  Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
220   1.3 Handling methods for alarms/warnings

---

## หน้า 223

[AL. 563.4_SS2 command speed exceeded A]
Cause                                                  Check/action method                                                           Model       1
1. A speed command was input exceeding the             Review the parameter or the operation pattern.                                [G]
                                                       Take actions such as performing settings so that the deceleration command
     observation speed specified by [Pr. PSA24
                                                       from the controller does not exceed the deceleration monitor time constant.
     SS1/SS2 deceleration monitor time constant]       Refer to "SS2/SOS function" in the following manual.
     from the observation speed when the SS2           MR-J5 User's Manual (Function)

     command was turned off during operation of
     the SS2 function.
2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 563.9_SS1 feedback speed exceeded B]
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 563.A_SS1 command speed exceeded B]
Page 220 [AL. 563.2_SS1 command speed exceeded A]


[AL. 563.B_SS2 feedback speed exceeded B]
Page 220 [AL. 563.3_SS2 feedback speed exceeded A]


[AL. 563.C_SS2 command speed exceeded B]
Page 221 [AL. 563.4_SS2 command speed exceeded A]


                                                                                    1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                      1.3 Handling methods for alarms/warnings             221

---

## หน้า 224

[AL. 564_Increment monitor error (safety sub-function)]
  • There is a problem with the travel distance in the safety sub-function.


  [AL. 564.1_SLI feedback position exceeded A]
  Cause                                                   Check/action method                                            Model
  1. The feedback position moved by a distance            Review the parameter or the operation pattern.                 [G]
                                                          Check if the SLI command was input before the motor stopped.
       exceeding the permissible travel distance set
                                                          Refer to "SLI function" in the following manual.
       in [Pr. PSB02 SLI permissible travel distance -    MR-J5 User's Manual (Function)
       Positive direction 1] or [Pr. PSB06 SLI
       permissible travel distance - Negative direction
       1] after operation of the SLI function.
  2. Take actions according to the instructions of 2. to 6. in the following item.
  Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


  [AL. 564.9_SLI feedback position exceeded B]
  Page 222 [AL. 564.1_SLI feedback position exceeded A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
222   1.3 Handling methods for alarms/warnings

---

## หน้า 225

[AL. 565_Direction monitor error (safety sub-function)]
• There is a problem with the servo motor travel distance direction in the safety sub-function.                                                     1
[AL. 565.1_SDIP feedback speed exceeded A]
Cause                                                  Check/action method                                                              Model
1. The servo motor moved in the address                Review the parameter or the operation pattern.                                   [G]
                                                       Check if a command in the address increasing direction was input.
     increasing direction while the SDI function was
                                                       Refer to "SLI function" in the following manual.
     operating.                                        MR-J5 User's Manual (Function)

2. The velocity waveform overshot.                     Check if the velocity waveform has overshot because of the short acceleration/
                                                       deceleration time constant.
                                                       If the velocity waveform has overshot, increase the acceleration/deceleration
                                                       time constant.

3. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                       Refer to "Example power circuit connections" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)
                                                       Refer to "Turning on servo amplifier for the first time" in the User's Manual
                                                       (Introduction).

4. Take actions in accordance with the items shown below.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 565.2_SDIP command speed exceeded A]
Cause                                                  Check/action method                                                              Model
1. A speed command was input in the address            Review the parameter or the operation pattern.                                   [G]
                                                       Check if a command in the address increasing direction was input.
     increasing direction while the SDI function was
                                                       Refer to "SLI function" in the following manual.
     operating.                                        MR-J5 User's Manual (Function)

2. Take actions in accordance with the items shown below.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 565.3_SDIN feedback speed exceeded A]
Cause                                                  Check/action method                                                              Model
1. The servo motor moved in the address                Review the parameter or the operation pattern.                                   [G]
                                                       Check if a command in the address increasing direction was input.
     decreasing direction while the SDI function
                                                       Refer to "SLI function" in the following manual.
     was operating.                                    MR-J5 User's Manual (Function)

2. The velocity waveform overshot.                     Check if the velocity waveform has overshot because of the short acceleration/
                                                       deceleration time constant.
                                                       If the velocity waveform has overshot, increase the acceleration/deceleration
                                                       time constant.

3. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                       Refer to "Example power circuit connections" in the following manuals.
                                                       MR-J5 User's Manual (Hardware)
                                                       MR-J5D User's Manual (Hardware)
                                                       Refer to "Turning on servo amplifier for the first time" in the User's Manual
                                                       (Introduction).

4. Take actions in accordance with the items shown below.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings              223

---

## หน้า 226

[AL. 565.4_SDIN command speed exceeded A]
  Cause                                                 Check/action method                                                 Model
  1. A speed command was input in the address           Review the parameter or the operation pattern.                      [G]
                                                        Check if a command in the address increasing direction was input.
       decreasing direction while the SDI function
                                                        Refer to "SLI function" in the following manual.
       was operating.                                   MR-J5 User's Manual (Function)

  2. Take actions in accordance with the items shown below.
  Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


  [AL. 565.9_SDIP feedback speed exceeded B]
  Page 223 [AL. 565.1_SDIP feedback speed exceeded A]


  [AL. 565.A_SDIP command speed exceeded B]
  Page 223 [AL. 565.2_SDIP command speed exceeded A]


  [AL. 565.B_SDIN feedback speed exceeded B]
  Page 223 [AL. 565.3_SDIN feedback speed exceeded A]


  [AL. 565.C_SDIN command speed exceeded B]
  Page 224 [AL. 565.4_SDIN command speed exceeded A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
224   1.3 Handling methods for alarms/warnings

---

## หน้า 227

[AL. 568_Torque monitor error 1 (safety sub-function)]
• There is a problem with the torque in the safety sub-function.                                                                                      1
[AL. 568.1_SLT1 feedback torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque feedback exceeded the torque set         Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the torque monitor is too small or if the servo motor
     in [Pr. PSB10 SLT torque upper limit value 1]
                                                       collides with the machine.
     and [Pr. PSB14 SLT torque lower limit value 1]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 568.2_SLT1 command torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque command exceeded the torque set          Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the SLT torque is too small or if the servo motor
     in [Pr. PSB10 SLT torque upper limit value 1]
                                                       collides with the machine.
     and [Pr. PSB14 SLT torque lower limit value 1]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 568.3_SLT2 feedback torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque feedback exceeded the torque set         Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the torque monitor is too small or if the servo motor
     in [Pr. PSB11 SLT torque upper limit value 2]
                                                       collides with the machine.
     and [Pr. PSB15 SLT torque lower limit value 2]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 568.4_SLT2 command torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque command exceeded the torque set          Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the SLT torque is too small or if the servo motor
     in [Pr. PSB11 SLT torque upper limit value 2]
                                                       collides with the machine.
     and [Pr. PSB15 SLT torque lower limit value 2]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings                225

---

## หน้า 228

[AL. 568.9_SLT1 feedback torque exceeded error B]
  Page 225 [AL. 568.1_SLT1 feedback torque exceeded error A]


  [AL. 568.A_SLT1 command torque exceeded error B]
  Page 225 [AL. 568.2_SLT1 command torque exceeded error A]


  [AL. 568.B_SLT2 feedback torque exceeded error B]
  Page 225 [AL. 568.3_SLT2 feedback torque exceeded error A]


  [AL. 568.C_SLT2 command torque exceeded error B]
  Page 225 [AL. 568.4_SLT2 command torque exceeded error A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
226   1.3 Handling methods for alarms/warnings

---

## หน้า 229

[AL. 569_Torque monitor error 2 (safety sub-function)]
• There is a problem with the torque in the safety sub-function.                                                                                      1
[AL. 569.1_SLT3 feedback torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque feedback exceeded the torque set         Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the torque monitor is too small or if the servo motor
     in [Pr. PSB12 SLT torque upper limit value 3]
                                                       collides with the machine.
     and [Pr. PSB16 SLT torque lower limit value 3]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 569.2_SLT3 command torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque command exceeded the torque set          Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the SLT torque is too small or if the servo motor
     in [Pr. PSB12 SLT torque upper limit value 3]
                                                       collides with the machine.
     and [Pr. PSB16 SLT torque lower limit value 3]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 569.3_SLT4 feedback torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque feedback exceeded the torque set         Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the torque monitor is too small or if the servo motor
     in [Pr. PSB13 SLT torque upper limit value 4]
                                                       collides with the machine.
     and [Pr. PSB17 SLT torque lower limit value 4]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


[AL. 569.4_SLT4 command torque exceeded error A]
Cause                                                  Check/action method                                                                Model
1. The torque command exceeded the torque set          Review the parameter or the operation pattern.                                     [G]
                                                       Check if the threshold for the SLT torque is too small or if the servo motor
     in [Pr. PSB13 SLT torque upper limit value 4]
                                                       collides with the machine.
     and [Pr. PSB17 SLT torque lower limit value 4]    Refer to "SLT function" in the following manual.
     after operation of the SLT function.              MR-J5 User's Manual (Function)

2. Take actions according to the instructions of 2. to 6. in the following item.
Page 220 [AL. 563.1_SS1 feedback speed exceeded A]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings                227

---

## หน้า 230

[AL. 569.9_SLT3 feedback torque exceeded error B]
  Page 227 [AL. 569.1_SLT3 feedback torque exceeded error A]


  [AL. 569.A_SLT3 command torque exceeded error B]
  Page 227 [AL. 569.2_SLT3 command torque exceeded error A]


  [AL. 569.B_SLT4 feedback torque exceeded error B]
  Page 227 [AL. 569.3_SLT4 feedback torque exceeded error A]


  [AL. 569.C_SLT4 command torque exceeded error B]
  Page 227 [AL. 569.4_SLT4 command torque exceeded error A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
228   1.3 Handling methods for alarms/warnings

---

## หน้า 231

[AL. 580_Safety communication setting error (safety sub-
function)]                                                                                                                                        1
• There is a problem with the safety communication settings.


[AL. 580.3_Safety verification code mismatch A]
Cause                                                Check/action method                                                              Model
1. The safety verification code of the controller    The controller may have communicated with an unintended servo amplifier.         [G]
                                                     Check if the IP address designated in the safety communication settings of the
     does not match the setting of [Pr. PSC06
                                                     master station matches the IP address setting of the servo amplifier being
     Safety verification code].                      used.
                                                     If the IP address is correct, the safety verification code may have been set
                                                     incorrectly.
                                                     Set the values used to identify each servo amplifier in [Pr. PSC06] avoiding
                                                     duplication between each piece of equipment, then set the same values in the
                                                     safety communication settings of the controller.


[AL. 580.B_Safety verification code mismatch B]
Page 229 [AL. 580.3_Safety verification code mismatch A]


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings                229

---

## หน้า 232

[AL. 581_Safety communication error 1 (safety sub-function)]
  • There is a problem with data reception in the safety communication.


  [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]
  Cause                                                 Check/action method                                                             Model
  1. The safety communication settings of the           Review the safety communication settings.                                       [G]
                                                        Refer to "Safety sub-function control by network" in the following manual.
       safety master station have been set
                                                        MR-J5 User's Manual (Function)
       incorrectly.
  2. There is a problem on the safety master            Check if an alarm has occurred on the safety master station.
                                                        If an alarm has occurred, take actions in accordance with the troubleshooting
       station side.
                                                        of the master station.

  3. Take actions in accordance with the items shown below.
  Page 104 [AL. 086.1_Network communication error 1]


  [AL. 581.2_Safety communication error 1 - Receive data error A2 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.3_Safety communication error 1 - Receive data error A3 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.4_Safety communication error 1 - Receive data error A4 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.5_Safety communication error 1 - Receive data error A5 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.6_Safety communication error 1 - Receive data error A6 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.7_Safety communication error 1 - Receive data error A7 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.9_Safety communication error 1 - Receive data error B1 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.A_Safety communication error 1 - Receive data error B2 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.B_Safety communication error 1 - Receive data error B3 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.C_Safety communication error 1 - Receive data error B4 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 581.D_Safety communication error 1 - Receive data error B5 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
230    1.3 Handling methods for alarms/warnings

---

## หน้า 233

[AL. 581.E_Safety communication error 1 - Receive data error B6 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]
                                                                                                                            1
[AL. 581.F_Safety communication error 1 - Receive data error B7 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


                                                                         1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                           1.3 Handling methods for alarms/warnings   231

---

## หน้า 234

[AL. 582_Safety communication error 2 (safety sub-function)]
  • There is a problem with data reception in the safety communication.


  [AL. 582.1_Safety communication error 2 - Receive data error A1 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.2_Safety communication error 2 - Receive data error A2 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.3_Safety communication error 2 - Receive data error A3 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.4_Safety communication error 2 - Receive data error A4 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.5_Safety communication error 2 - Receive data error A5 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.6_Safety communication error 2 - Receive data error A6 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.7_Safety communication error 2 - Receive data error A7 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.9_Safety communication error 2 - Receive data error B1 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.A_Safety communication error 2 - Receive data error B2 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.B_Safety communication error 2 - Receive data error B3 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.C_Safety communication error 2 - Receive data error B4 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.D_Safety communication error 2 - Receive data error B5 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.E_Safety communication error 2 - Receive data error B6 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


  [AL. 582.F_Safety communication error 2 - Receive data error B7 (safety sub-function)]
  Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
232    1.3 Handling methods for alarms/warnings

---

## หน้า 235

[AL. 583_Safety communication error 3 (safety sub-function)]
• There is a problem with data reception in the safety communication.                                                       1
[AL. 583.2_Safety communication error 3 - Receive data error A2 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.3_Safety communication error 3 - Receive data error A3 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.4_Safety communication error 3 - Receive data error A4 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.5_Safety communication error 3 - Receive data error A5 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.6_Safety communication error 3 - Receive data error A6 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.A_Safety communication error 3 - Receive data error B2 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.B_Safety communication error 3 - Receive data error B3 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.C_Safety communication error 3 - Receive data error B4 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.D_Safety communication error 3 - Receive data error B5 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


[AL. 583.E_Safety communication error 3 - Receive data error B6 (safety sub-function)]
Page 230 [AL. 581.1_Safety communication error 1 - Receive data error A1 (safety sub-function)]


                                                                         1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                           1.3 Handling methods for alarms/warnings   233

---

## หน้า 236

[AL. 584_FSoE communication setting error (safety sub-
  function)]
  • There is a problem with the safety communication settings.


  [AL. 584.1_FSoE Address mismatch error A (safety sub-function)]
  Cause                                                Check/action method                                                              Model
  1. FSoE Address set in FSoE Master does not          Review the FSoE Address setting in FSoE Master or the setting in [Pr. PSC07      [G]
                                                       FSoE Address setting].
       match the setting in [Pr. PSC07 FSoE Address
       setting].


  [AL. 584.2_FSoE communication parameter setting error A (safety sub-function)]
  Cause                                                Check/action method                                                              Model
  1. The setting value of FSoE Watchdog Timer          Review the setting value of FSoE Watchdog Timer set in FSoE Master.              [G]

       notified by FSoE Master is not supported.


  [AL. 584.3_FSoE communication parameter length error A (safety sub-function)]
  Cause                                                Check/action method                                                              Model
  1. The parameter length notified by FSoE Master      Review the project setting in FSoE Master.                                       [G]

       is incorrect.


  [AL. 584.4_FSoE SRA parameter setting error A (safety sub-function)]
  Cause                                                Check/action method                                                              Model
  1. The SRA parameter notified by FSoE Master         Review the project setting in FSoE Master. If the SRA parameter is set, do not   [G]
                                                       set it because it is not supported.
       is incorrect.


  [AL. 584.5_FSoE SRA parameter length error A (safety sub-function)]
  Cause                                                Check/action method                                                              Model
  1. The SRA parameter length notified by FSoE         Review the project setting in FSoE Master. If the SRA parameter is set, do not   [G]
                                                       set it because it is not supported.
       Master is incorrect.


  [AL. 584.9_FSoE Address mismatch error B (safety sub-function)]
  Page 234 [AL. 584.1_FSoE Address mismatch error A (safety sub-function)]


  [AL. 584.A_FSoE communication parameter setting error B (safety sub-function)]
  Page 234 [AL. 584.2_FSoE communication parameter setting error A (safety sub-function)]


  [AL. 584.B_FSoE communication parameter length error B (safety sub-function)]
  Page 234 [AL. 584.3_FSoE communication parameter length error A (safety sub-function)]


  [AL. 584.C_FSoE SRA parameter setting error B (safety sub-function)]
  Page 234 [AL. 584.4_FSoE SRA parameter setting error A (safety sub-function)]


  [AL. 584.D_FSoE SRA parameter length error B (safety sub-function)]
  Page 234 [AL. 584.5_FSoE SRA parameter length error A (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
234   1.3 Handling methods for alarms/warnings

---

## หน้า 237

[AL. 585_FSoE communication error 1 (safety sub-function)]
• There is a problem with data reception in the safety communication. (During initial communication)                                                  1
[AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A
(safety sub-function)]
Cause                                                Check/action method                                                                  Model
1. The safety communication settings of FSoE         Review the safety communication settings.                                            [G]
                                                     Refer to "Safety sub-function control by network" in the following manual.
     Master are incorrect.
                                                     MR-J5-G-N1/MR-J5W-G-N1 User's Manual (Communication Function)

2. There is a problem with FSoE Master.              Check if an alarm has occurred in FSoE Master.
                                                     If an alarm has occurred, take actions in accordance with the troubleshooting
                                                     of FSoE Master.

3. A network cable is disconnected.                  Check if the network cable is connected correctly.
                                                     Turn off the control circuit power supply of the servo amplifier, then connect the
                                                     network cable correctly.

4. The wiring of the network cable was incorrect.    Check if the connection of the network cable is correct.

5. A network cable has been disconnected.            Check for disconnection in the network cable.

6. Devices on the network (including repeaters       Check that the devices on the network are turned on.

     such as hubs) are turned off.
7. The network was disconnected by an incorrect      Check if the network was disconnected by a correct procedure for each type of
                                                     network.
     procedure.
                                                     Refer to "Disconnecting the communication" in the User's Manual
                                                     (Communication Function).

8. Data transmission from the controller was         Check if data transmission from the controller has not been interrupted. If the
                                                     data transmission has been interrupted, review the controller communication
     interrupted for a certain time.
                                                     setting.

9. The settings of the controller were incorrect.    Check the controller settings.

10. There is a problem with the surrounding          Check the noise, ambient temperature, and other conditions, and implement
                                                     appropriate countermeasures for the cause.
     environment.
                                                     If there is noise, take countermeasures to reduce the noise.
                                                     Refer to "Noise reduction techniques" in the following manuals.
                                                     MR-J5 User's Manual (Hardware)
                                                     MR-J5D User's Manual (Hardware)

11. The servo amplifier has malfunctioned.           Replace the servo amplifier.

12. The controller has malfunctioned.                Replace the controller.

13. Devices on the network (including repeaters      Replace the devices on the network.

     such as hubs) have malfunctioned.


[AL. 585.2_FSoE communication error 1 - Receive data error (Unknown command) A
(safety sub-function)]
Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


[AL. 585.3_FSoE communication error 1 - Receive data error (Invalid connection ID) A
(safety sub-function)]
Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


[AL. 585.4_FSoE communication error 1 - Receive data error (CRC error) A (safety sub-
function)]
Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


[AL. 585.9_FSoE communication error 1 - Receive data error (Unexpected command) B
(safety sub-function)]
Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


                                                                                      1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                        1.3 Handling methods for alarms/warnings                235

---

## หน้า 238

[AL. 585.A_FSoE communication error 1 - Receive data error (Unknown command) B
  (safety sub-function)]
  Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


  [AL. 585.B_FSoE communication error 1 - Receive data error (Invalid connection ID) B
  (safety sub-function)]
  Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


  [AL. 585.C_FSoE communication error 1 - Receive data error (CRC error) B (safety sub-
  function)]
  Page 235 [AL. 585.1_FSoE communication error 1 - Receive data error (Unexpected command) A (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
236   1.3 Handling methods for alarms/warnings

---

## หน้า 239

[AL. 586_FSoE communication error 2 (safety sub-function)]
• There is a problem with data reception in the safety communication. (During runtime communication)                                                 1
[AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A
(safety sub-function)]
Cause                                               Check/action method                                                                  Model
1. The safety communication settings of FSoE        Review the safety communication settings.                                            [G]
                                                    Refer to "Safety sub-function control by network" in the following manual.
     Master are incorrect.
                                                    MR-J5-G-N1/MR-J5W-G-N1 User's Manual (Communication Function)

2. There is a problem with FSoE Master.             Check if an alarm has occurred in FSoE Master.
                                                    If an alarm has occurred, take actions in accordance with the troubleshooting
                                                    of FSoE Master.

3. A network cable is disconnected.                 Check if the network cable is connected correctly.
                                                    Turn off the control circuit power supply of the servo amplifier, then connect the
                                                    network cable correctly.

4. The wiring of the network cable was incorrect.   Check if the connection of the network cable is correct.

5. A network cable has been disconnected.           Check for disconnection in the network cable.

6. Devices on the network (including repeaters      Check that the devices on the network are turned on.

     such as hubs) are turned off.
7. The network was disconnected by an incorrect     Check if the network was disconnected by a correct procedure for each type of
                                                    network.
     procedure.
                                                    Refer to "Disconnecting the communication" in the User's Manual
                                                    (Communication Function).

8. Data transmission from the controller was        Check if data transmission from the controller has not been interrupted. If the
                                                    data transmission has been interrupted, review the controller communication
     interrupted for a certain time.
                                                    setting.

9. The settings of the controller were incorrect.   Check the controller settings.

10. There is a problem with the surrounding         Check the noise, ambient temperature, and other conditions, and implement
                                                    appropriate countermeasures for the cause.
     environment.
                                                    If there is noise, take countermeasures to reduce the noise.
                                                    Refer to "Noise reduction techniques" in the following manuals.
                                                    MR-J5 User's Manual (Hardware)
                                                    MR-J5D User's Manual (Hardware)

11. The servo amplifier has malfunctioned.          Replace the servo amplifier.

12. The controller has malfunctioned.               Replace the controller.

13. Devices on the network (including repeaters     Replace the devices on the network.

     such as hubs) have malfunctioned.


[AL. 586.2_FSoE communication error 2 - Receive data error (Unknown command) A
(safety sub-function)]
Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


[AL. 586.3_FSoE communication error 2 - Receive data error (Invalid connection ID) A
(safety sub-function)]
Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


[AL. 586.4_FSoE communication error 2 - Receive data error (CRC error) A (safety sub-
function)]
Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                       1.3 Handling methods for alarms/warnings                237

---

## หน้า 240

[AL. 586.5_FSoE communication error 2 - Receive time-out error A (safety sub-
  function)]
  Cause                                              Check/action method                                                  Model
  1. The update time of the safety communication     Review the setting value of FSoE Watchdog Time set in FSoE Master.   [G]
                                                     Review the communication cycle setting.
       has exceeded the time set in FSoE Watchdog
       Time.


  [AL. 586.9_FSoE communication error 2 - Receive data error (Unexpected command) B
  (safety sub-function)]
  Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


  [AL. 586.A_FSoE communication error 2 - Receive data error (Unknown command) B
  (safety sub-function)]
  Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


  [AL. 586.B_FSoE communication error 2 - Receive data error (Invalid connection ID) B
  (safety sub-function)]
  Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


  [AL. 586.C_FSoE communication error 2 - Receive data error (CRC error) B (safety sub-
  function)]
  Page 237 [AL. 586.1_FSoE communication error 2 - Receive data error (Unexpected command) A (safety sub-function)]


  [AL. 586.D_FSoE communication error 2 - Receive time-out error B (safety sub-
  function)]
  Page 238 [AL. 586.5_FSoE communication error 2 - Receive time-out error A (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
238    1.3 Handling methods for alarms/warnings

---

## หน้า 241

[AL. 587_FSoE communication error 3 (safety sub-function)]
• There is a problem with the safety communication.                                                                                                    1
[AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-
function)]
Cause                                                 Check/action method                                                                  Model
1. The safety communication settings of FSoE          Review the safety communication settings.                                            [G]
                                                      Refer to "Safety sub-function control by network" in the following manual.
     Master are incorrect.
                                                      MR-J5-G-N1/MR-J5W-G-N1 User's Manual (Communication Function)

2. There is a problem with FSoE Master.               Check if an alarm has occurred in FSoE Master.
                                                      If an alarm has occurred, take actions in accordance with the troubleshooting
                                                      of FSoE Master.

3. A network cable is disconnected.                   Check if the network cable is connected correctly.
                                                      Turn off the control circuit power supply of the servo amplifier, then connect the
                                                      network cable correctly.

4. The wiring of the network cable was incorrect.     Check if the connection of the network cable is correct.

5. A network cable has been disconnected.             Check for disconnection in the network cable.

6. Devices on the network (including repeaters        Check that the devices on the network are turned on.

     such as hubs) are turned off.
7. The network was disconnected by an incorrect       Check if the network was disconnected by a correct procedure for each type of
                                                      network.
     procedure.
                                                      Refer to "Disconnecting the communication" in the User's Manual
                                                      (Communication Function).

8. Data transmission from the controller was          Check if data transmission from the controller has not been interrupted. If the
                                                      data transmission has been interrupted, review the controller communication
     interrupted for a certain time.
                                                      setting.

9. The settings of the controller were incorrect.     Check the controller settings.

10. There is a problem with the surrounding           Check the noise, ambient temperature, and other conditions, and implement
                                                      appropriate countermeasures for the cause.
     environment.
                                                      If there is noise, take countermeasures to reduce the noise.
                                                      Refer to "Noise reduction techniques" in the following manuals.
                                                      MR-J5 User's Manual (Hardware)
                                                      MR-J5D User's Manual (Hardware)

11. The servo amplifier has malfunctioned.            Replace the servo amplifier.

12. The controller has malfunctioned.                 Replace the controller.

13. Devices on the network (including repeaters       Replace the devices on the network.

     such as hubs) have malfunctioned.


[AL. 587.2_FSoE communication error 3 - Safety communication error 2A (safety sub-
function)]
Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


[AL. 587.3_FSoE communication error 3 - Safety communication error 3A (safety sub-
function)]
Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


[AL. 587.4_FSoE communication error 3 - Safety communication error 4A (safety sub-
function)]
Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


[AL. 587.5_FSoE communication error 3 - Safety communication error 5A (safety sub-
function)]
Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings                239

---

## หน้า 242

[AL. 587.6_FSoE communication error 3 - Safety communication error 6A (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.7_FSoE communication error 3 - Safety communication error 7A (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.9_FSoE communication error 3 - Safety communication error 1B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.A_FSoE communication error 3 - Safety communication error 2B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.B_FSoE communication error 3 - Safety communication error 3B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.C_FSoE communication error 3 - Safety communication error 4B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.D_FSoE communication error 3 - Safety communication error 5B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.E_FSoE communication error 3 - Safety communication error 6B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


  [AL. 587.F_FSoE communication error 3 - Safety communication error 7B (safety sub-
  function)]
  Page 239 [AL. 587.1_FSoE communication error 3 - Safety communication error 1A (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
240   1.3 Handling methods for alarms/warnings

---

## หน้า 243

[AL. 595_STO command off warning (safety sub-function)]
• The STO command has been turned off.                                                                                         1
[AL. 595.1_STO command off warning A]
Cause                                         Check/action method                                                  Model
1. The STO command of the functional safety   Turn on (disable) the STO command of the functional safety.          [G]

     has been turned off (enabled).


[AL. 595.9_STO command off warning B]
Page 241 [AL. 595.1_STO command off warning A]


                                                                           1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                             1.3 Handling methods for alarms/warnings    241

---

## หน้า 244

[AL. 596_SS1 time-out warning (safety sub-function)]
  • The deceleration monitor time has passed after the SS1 command was turned off.


  [AL. 596.1_SS1 time-out warning A]
  Cause                                                  Check/action method                  Model
  1. The time set in [Pr. PSA03 SS1/SS2                  Turn on (disable) the SS1 command.   [G]

       deceleration monitor time] has passed after
       the SS1 command was turned off (enabled).
  2. With [Pr. PSA02.2 Time/Deceleration monitor
       setting] being set to "1" (perform deceleration
       monitoring) and "off" (enabled) of the SS1
       command being detected, the time set in [Pr.
       PSA15 Safety sub-function - Speed detection
       delay time] has passed since the servo motor
       speed fell below the setting value of [Pr.
       PSA04 Safety sub-function - Stop speed].


  [AL. 596.9_SS1 time-out warning B]
  Page 242 [AL. 596.1_SS1 time-out warning A]


      1 SERVO AMPLIFIER TROUBLESHOOTING
242   1.3 Handling methods for alarms/warnings

---

## หน้า 245

[AL. 59D_Internal diagnosis error (safety sub-function)]
• There is an error with the result from functional safety diagnosis.                                                                           1
[AL. 59D.1_Internal diagnosis error A1 (safety sub-function)]
Cause                                                   Check/action method                                                         Model
1. The servo amplifier has malfunctioned.               Replace the servo amplifier.                                                [G]

2. There is a problem with the surrounding              Check the noise, ambient temperature, and other conditions, and implement
                                                        appropriate countermeasures for the cause.
     environment.
                                                        If there is noise, take countermeasures to reduce the noise.
                                                        Refer to "Noise reduction techniques" in the following manuals.
                                                        MR-J5 User's Manual (Hardware)
                                                        MR-J5D User's Manual (Hardware)


[AL. 59D.3_Internal diagnosis error A3 (safety sub-function)]
Page 243 [AL. 59D.1_Internal diagnosis error A1 (safety sub-function)]


[AL. 59D.6_Internal diagnosis error A6 (safety sub-function)]
Page 243 [AL. 59D.1_Internal diagnosis error A1 (safety sub-function)]


[AL. 59D.9_Internal diagnosis error B1 (safety sub-function)]
Page 243 [AL. 59D.1_Internal diagnosis error A1 (safety sub-function)]


[AL. 59D.B_Internal diagnosis error B3 (safety sub-function)]
Page 243 [AL. 59D.1_Internal diagnosis error A1 (safety sub-function)]


[AL. 59D.E_Internal diagnosis error B6 (safety sub-function)]
Page 243 [AL. 59D.1_Internal diagnosis error A1 (safety sub-function)]


                                                                                       1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                         1.3 Handling methods for alarms/warnings         243

---

## หน้า 246

[AL. 5E0_Safety input device fixing diagnosis incomplete
  warning]
  • The input device diagnosis has not been executed.


  [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]
  Cause                                                  Check/action method                                                         Model
  1. A fixing diagnosis at startup has not been          Check if a fixing diagnosis at startup has been executed.                   [G]

       executed.
  2. The fixing diagnosis at startup has been set        Check if [Pr. PSD27 Input device - Fixing diagnosis at startup execution
                                                         selection 1] has been set correctly.
       incorrectly in the functional safety parameter.
  3. The wiring is incorrect.                            Check if the wiring is correct.

  4. The servo amplifier has malfunctioned.              Replace the servo amplifier.

  5. There is a problem with the surrounding             Check the noise, ambient temperature, and other conditions, and implement
                                                         appropriate countermeasures for the cause.
       environment.
                                                         If there is noise, take countermeasures to reduce the noise.
                                                         Refer to "Noise reduction techniques" in the following manuals.
                                                         MR-J5 User's Manual (Hardware)
                                                         MR-J5D User's Manual (Hardware)


  [AL. 5E0.2_SDI2 fixing diagnosis at startup incomplete warning A (safety sub-function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


  [AL. 5E0.3_SDI3 fixing diagnosis at startup incomplete warning A (safety sub-function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


  [AL. 5E0.7_Fixing diagnosis - No detection of all input ON A (safety sub-function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


  [AL. 5E0.9_SDI1 fixing diagnosis at startup incomplete warning B (safety sub-function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


  [AL. 5E0.A_SDI2 fixing diagnosis at startup incomplete warning B (safety sub-
  function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


  [AL. 5E0.B_SDI3 fixing diagnosis at startup incomplete warning B (safety sub-
  function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


  [AL. 5E0.F_Fixing diagnosis - No detection of all input ON B (safety sub-function)]
  Page 244 [AL. 5E0.1_SDI1 fixing diagnosis at startup incomplete warning A (safety sub-function)]


       1 SERVO AMPLIFIER TROUBLESHOOTING
244    1.3 Handling methods for alarms/warnings

---

## หน้า 247

[AL. 5E1_Test mode setting mismatch warning (safety sub-
function)]                                                                                                                                      1
• The settings for the test mode are inconsistent.


[AL. 5E1.1_Test mode setting mismatch warning A (safety sub-function)]
Cause                                                Check/action method                                                            Model
1. The test operation mode has been set              Check if the servo amplifier and [Pr. PSA01.1 Input mode selection] are both   [G]
                                                     set for test mode. If they do not match, review the settings.
     incorrectly.


[AL. 5E1.9_Test mode setting mismatch warning B (safety sub-function)]
Page 245 [AL. 5E1.1_Test mode setting mismatch warning A (safety sub-function)]


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                    1.3 Handling methods for alarms/warnings              245

---

## หน้า 248

[AL. 5E2_Safety communication warning (safety sub-function)]
  • There is a problem with the safety communication.


  [AL. 5E2.1_Safety communication no connection warning A (safety sub-function)]
  Cause                                                 Check/action method                                                            Model
  1. Connection with the controller has not been        Page 248 The display shows "A" (unconnected to the controller)                [G]

       established.
  2. The safety communication settings are              Review the safety communication settings.
                                                        Refer to "Safety sub-function control by network" in the following manual.
       incorrect.
                                                        MR-J5 User's Manual (Function)

  3. The IP address was changed after connecting        If the IP address of the controller or the servo amplifier was changed after
                                                        connecting the controller, cycle the power.
       to the controller.


  [AL. 5E2.2_FSoE communication no connection warning A (safety sub-function)]
  Cause                                                 Check/action method                                                            Model
  1. Connection with the controller has not been        Page 248 The display shows "A" (unconnected to the controller)                [G]

       established.
  2. The safety communication settings are              Review the safety communication settings.
                                                        Refer to "Safety sub-function control by network" in the following manual.
       incorrect.
                                                        MR-J5-G-N1/MR-J5W-G-N1 User's Manual (Communication Function)


  [AL. 5E2.9_Safety communication no connection warning B (safety sub-function)]
  Page 246 [AL. 5E2.1_Safety communication no connection warning A (safety sub-function)]


  [AL. 5E2.A_FSoE communication no connection warning B (safety sub-function)]
  Page 246 [AL. 5E2.2_FSoE communication no connection warning A (safety sub-function)]


      1 SERVO AMPLIFIER TROUBLESHOOTING
246   1.3 Handling methods for alarms/warnings

---

## หน้า 249

[AL. 5E6_SS1 command off warning (safety sub-function)]
• The SS1 command was turned off.                                                                                                   1
[AL. 5E6.1_SS1 command off warning A (safety sub-function)]
Cause                                            Check/action method                                                    Model
1. The SS1 command has been turned off           Turn on (disable) the SS1 command.                                     [G]

     (enabled).
2. An external 24 V DC power supply has not      Input the 24 V DC power supply.

     been input to CN8.
3. The servo amplifier has malfunctioned.        Replace the servo amplifier.


[AL. 5E6.9_SS1 command off warning B (safety sub-function)]
Page 247 [AL. 5E6.1_SS1 command off warning A (safety sub-function)]


                                                                                1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                  1.3 Handling methods for alarms/warnings    247

---

## หน้า 250

1.4                 Trouble which does not trigger an alarm/warning
  This section shows examples of trouble which will not trigger an alarm or warning as well as the possible causes of such
  trouble. Refer to this section and remove each cause of trouble.

      Precautions
  • When the servo amplifier, servo motor, controller, or encoder malfunctions, the cases shown in this section may occur.
  • If the servo motor does not rotate, also check the "No Motor Rotation" area in MR Configurator2.

  The display shows "A" (unconnected to the controller)
  [G]: The status of each axis is indicated in each digit.
  1-axis servo amplifier: "A _ _"
  2-axis servo amplifier: "AA _"
  3-axis servo amplifier: "AAA"
  [B]: "AA _" or "Ab _" appears.
   Possible cause                                            Check/action method                                                               Model
   1. The power supply of the controller has been            Switch on the power of the controller.                                            [G]
                                                                                                                                               [B]
        turned off.
   2. The power supply of the device between the             Turn on the power of the device between the controller and servo amplifier.

        controller and servo amplifier has been turned
        off.
   3. The amplifier-less operation function of the           Cancel the amplifier-less operation function of the controller.

        controller is enabled.
   4. A network cable was disconnected.                      Replace the network cable.
                                                             [G]: Ethernet cable
                                                             [B]: SSCNET III cable
                                                             Check if the connector (CN1A/CN1B) is disconnected.

   5. An incompatible controller is connected. Or,           Connect with a compatible controller.                                             [G]
                                                             Check that the controller and servo amplifiers use the same network type.
        the network settings of the controller and the
                                                             Check if the version of the controller is compatible with the MR-J5_-_B_. Refer   [B]
        network settings of the servo amplifiers do not      to the controller manual for the confirmation method.
        match.                                               Check if the servo series settings of the controller are correct.

   6. The settings of the rotary switch are incorrect.       Check if there is another servo amplifier assigned to the same axis No.           [G]
                                                             Check if the settings of the controller and servo amplifiers are correct.         [B]

   7. The communication cycle does not match.                Refer to the controller instruction manual and check the communication cycle.
                                                             Check the communication error detection time of the servo amplifier.              [G]

   8. The communication speed (1 Gbps or 100                 Check that the communication speeds of the controller and servo amplifiers        [G]
                                                             are the same.
        Mbps) does not match between the controller
        and servo amplifiers.
   9. For a multi-axis servo amplifier, the axis has         Turn off the disabling control axis switch.                                       [G]
                                                                                                                                               [B]
        been disabled.


  The display shows "r##"
   Possible cause                                            Check/action method                                                               Model
   1. The system is in servo-off or ready-off state.         Turn on the servo-on for all the axes.                                            [G]

        (## in the display indicates network
        addresses.)


       1 SERVO AMPLIFIER TROUBLESHOOTING
248    1.4 Trouble which does not trigger an alarm/warning

---

## หน้า 251

The display shows "b##"
Possible cause                                       Check/action method                                                               Model       1
1. The test operation mode is enabled.               Turn off the test operation select switch (SW3-1).                                [B]
                                                     Refer to "Switch setting and display of the servo amplifier" in the User's
                                                     Manual (Introduction).

2. The system is in servo-off or ready-off state.    Turn on the servo-on for all the axes.


The display shows "TST"
Possible cause                                       Check/action method                                                               Model
1. The test operation mode is enabled.               Turn off the test operation select switch (SW3-1).                                [G]
                                                     Refer to "Switch setting and display of the servo amplifier" or "Switch setting
                                                     and display of the drive unit" in the User's Manual (Introduction).


The display shows "off"
Possible cause                                       Check/action method                                                               Model
1. The operation mode for manufacturer setting       Do not turn on all the DIP switches (SW3). Set SW3 correctly.                     [G]
                                                     Refer to "Switch setting and display of the servo amplifier" or "Switch setting   [B]
    is enabled.
                                                     and display of the drive unit" in the User's Manual (Introduction).
                                                     Cycle the power.                                                                  [A]


The display is off
Possible cause                                       Check/action method                                                               Model
1. The external I/O terminal has shorted.            If disconnecting the Ethernet cable connector, encoder connector, and I/O         [G]
                                                     signal connector solves the trouble, the cable wiring may have shorted.           [B]
                                                     Review the wiring.                                                                [A]

2. The power has not been supplied to the            Turn on the control circuit power supply.

    control circuit.
3. The voltage of the control circuit power supply   Increase the voltage of the control circuit power supply.

    has dropped.


                                                                                  1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                            1.4 Trouble which does not trigger an alarm/warning              249

---

## หน้า 252

The servo motor does not operate
  Possible cause                                                     Check/action method                                                              Model
  1. The connection of the servo motor is incorrect. Check the U/V/W wiring.                                                                          [G]
                                                                     Refer to "Example power circuit connections" in the following manuals.           [B]
                                                                     MR-J5 User's Manual (Hardware)                                                  [A]
                                                                     MR-J5D User's Manual (Hardware)

  2. A servo motor power cable or an encoder                         Check if the encoder cable and the servo motor power cable are connected to
                                                                     the same axis.
        cable is connected to an incorrect axis.
  3. An alarm or warning is occurring.                               Check the contents of the alarm or warning, and remove its cause.

  4. The system is in the test operation mode.                       Cancel the test operation mode.
  [G] [B]: Test operation select switch (SW3-1) has been turned on
  (up).
  [A]: The point in the lower right of the display is blinking.

  5. The motor-less operation has been enabled.                      Disable the motor-less operation.
                                                                     [G] [B]: [Pr. PC05.0 Motor-less operation selection]
                                                                     [A]: [Pr. PC60.0 Motor-less operation selection]

  6. The torque is insufficient for the large load.                  Check the instantaneous torque on the status display ([A]) or with MR
                                                                     Configurator2. If the torque reaches the maximum torque or the torque limit
                                                                     value, reduce the load or replace the servo motor with a larger-capacity servo
                                                                     motor.

  7. An unintended torque limit has been enabled.                    Cancel the torque limit.

  8. The setting value for the torque limit is                       Check if the torque limit value is "0".
                                                                     Refer to "Torque limit" in the following manual.
        incorrect.
                                                                     MR-J5 User's Manual (Function)

  9. The machine is interfering with the servo                       Remove the interference.

        motor.
  10. For a servo motor with an electromagnetic                      Turn on the electromagnetic brake power.

        brake, the brake has not been released.
  11. LSP (Forward rotation stroke end) and LSN                      Check if [AL. 099 Stroke limit warning] has occurred.                            [G]
                                                                     Turn on LSP and LSN.                                                             [A]
        (Reverse rotation stroke end) are not on.
  12. FLS (Upper stroke limit) and RLS (Lower                        Check if [AL. 099 Stroke limit warning] has occurred.                            [G]
                                                                     Turn on FLS and RLS.                                                             [B]
        stroke limit) are not turned on.
  13. A software position limit is reached.                          Check if [AL. 098 Software position limit warning] has occurred.                 [G]
                                                                     Place the moving part in the range of the software position limit.

  14. The servo-on has not been turned on.                           Turn on the servo-on.                                                            [G]
                                                                                                                                                      [B]
  15. The settings of the electronic gear are                        Set appropriate values for the electronic gear.
                                                                                                                                                      [A]
        incorrect.
  16. The setting value of the point table is incorrect. Review the setting value of the point table.                                                 [G]


       1 SERVO AMPLIFIER TROUBLESHOOTING
250    1.4 Trouble which does not trigger an alarm/warning

---

## หน้า 253

Possible cause                                          Check/action method                                                           Model
17. RES (Reset) has been switched on.                   Switch off RES.                                                               [A]

18. The setting of the control mode is incorrect.       Check the setting of [Pr. PA01.0 Control mode selection].                                 1
19. In the position control mode, the command           Check if the pulse train has been input from the controller.

     pulse has not been input.
20. In the position control mode, wiring of the         Review the wiring. Input 24 V DC to OPC when using the signal in the open-
                                                        collector type.
     command pulse train signal is incorrect.
21. In the position control mode, the settings of the   Check that the pulse train form output by the controller corresponds to the
                                                        setting of [Pr. PA13.0 Command input pulse train - Form selection].
     command pulse input form are incorrect.
22. Both ST1 (Forward rotation start) and ST2           Switch on either one of ST1 or ST2.

     (Reverse rotation start) are on, or both are off
     in the speed control mode or the positioning
     mode.
23. Both RS1 (Forward rotation selection) and           Switch on either one of RS1 or RS2.

     RS2 (Reverse rotation selection) are on, or
     both are off in the torque control mode.
24. The value selected in the speed control mode        Review the settings of the internal speed and the selections of SP1 (Speed
                                                        selection 1), SP2 (Speed selection 2), and SP3 (Speed selection 3).
     and the torque control mode is too low.
25. An analog signal has not been input correctly.      Check the values of the analog speed command and the analog torque
                                                        command on the status display or on MR Configurator2. Input the analog
                                                        signal correctly.

26. The ABS transfer mode has been selected in          Turn off ABSM.

     the absolute position detection system.
27. Power has not been supplied to OPC (Open            Connect between DICOM and OPC of the CN3 connector of the servo
                                                        amplifier.
     collector - Sync interface power supply input).
28. The setting/specification of the point table        Check the [Target point table (Obj. 2D60h)] setting.                          [G]

     number selection is incorrect.
29. Quick Stop has been activated.                      Cancel Quick Stop.

30. Halt has been activated.                            Cancel Halt.

31. An error is occurring on the controller side.       Remove the error of the controller.                                           [G]
                                                                                                                                      [B]
32. The parameter settings are incorrect on the         Review the parameter settings on the controller side.

     controller side.
33. The position command has not been input             Review the settings of the controller or the servo program.

     correctly.
34. For a multi-axis servo amplifier, the axis has      Check if the disabling control axis switch has not been turned on.

     been disabled.
35. PEN was not turned on while the input signal        Check if PEN (Command input permission signal) has been turned on.            [A]
                                                        Check if PENS (Command pulse train input permitted) has been turned on.
     was being set to PEN (Command input
     permission signal).


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                               1.4 Trouble which does not trigger an alarm/warning          251

---

## หน้า 254

The increase in the servo motor speed is insufficient or excessive
  Possible cause                                            Check/action method                                                                  Model
  1. The settings of the speed command, speed               Review the settings of the speed command, speed limit, and electronic gear.          [G]
                                                                                                                                                 [B]
       limit, or electronic gear are incorrect.
                                                                                                                                                 [A]
  2. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                            Refer to "Example power circuit connections" in the following manuals.
                                                            MR-J5 User's Manual (Hardware)
                                                            MR-J5D User's Manual (Hardware)

  3. The voltage of the main circuit power supply           Increase the voltage of the main circuit power supply.

       has dropped.
  4. For a servo motor with an electromagnetic              Turn on the electromagnetic brake power.

       brake, the brake has not been released.
  5. The selection of SP1 (Speed selection 1), SP2          Review the settings of SP1, SP2, SP3, and setting of the internal speed.             [A]

       (Speed selection 2), or SP3 (Speed selection
       3) is incorrect in the speed control mode and
       the torque control mode.
  6. The analog signal was incorrectly input in the         Check the values of the analog speed command and the analog torque
                                                            command on the status display or on MR Configurator2.
       speed control mode and the torque control
       mode.
  7. When the override function is enabled, the             Review the setting of [Speed override (Obj. 2DB0h)].                                 [G]

       override value is set incorrectly.

  Vibration of servo motor at low frequency
  Possible cause                                            Check/action method                                                                  Model
  1. The estimated value of the load to motor               Execute the auto tuning or one-touch tuning to set the load to motor inertia         [G]
                                                            ratio again. When setting manually, set the load to motor inertia ratio correctly.   [B]
       inertia ratio by auto tuning is incorrect. The
                                                            Refer to "ADJUSTMENT METHOD" in the following manual.                                [A]
       value of the load to motor inertia ratio which       MR-J5 User's Manual (Adjustment)
       was set manually is incorrect.
  2. The command from the controller is unstable.           Review the command from the controller.
                                                            Check if the Ethernet cable or SSCNET III cable is disconnected or has other
                                                            problems.

  3. When the servo motor stops, torque or thrust           If the torque at acceleration/deceleration reaches the maximum torque, reduce
                                                            the generated torque by increasing the acceleration/deceleration time,
       at acceleration/deceleration overshoots
                                                            reducing the load, or other measures.
       exceeding the limit of the servo motor.
  4. The servo gain is too low or the response of           Increase the servo gain or the value of [Pr. PA09 Auto tuning response].

       the auto tuning is too low.


      1 SERVO AMPLIFIER TROUBLESHOOTING
252   1.4 Trouble which does not trigger an alarm/warning

---

## หน้า 255

There is an unusual noise in the servo motor
Possible cause                                              Check/action method                                                               Model       1
1. The servo gain is too high or the response of            Increase the servo gain or the value of [Pr. PA09 Auto tuning response].          [G]
                                                                                                                                              [B]
     the auto tuning is too high.
                                                                                                                                              [A]
2. The bearing has reached the end of its service           If the servo motor can be operated safely, remove the load and check for the
                                                            noise in the servo motor itself.
     life.
                                                            If the servo motor is removable from the machine, remove the servo motor
                                                            power cable, then release the brake, and rotate the servo motor by an external
                                                            force to check for a noise. If a noise occurs, the bearing is at the end of its
                                                            service life. Replace the servo motor. If no noise occurs, perform maintenance
                                                            on the load side.

3. For a servo motor with an electromagnetic                Turn on the electromagnetic brake power.

     brake, the brake has not been released.
4. When a servo motor with an electromagnetic               Review the timing of the electromagnetic brake release.
                                                            Take into account that the electromagnetic brake has a release delay time.
     brake is used, the brake release timing is
     incorrect.

The servo motor vibrates
Possible cause                                              Check/action method                                                               Model
1. The servo gain is too high or the response of            Decrease the servo gain to check if the trouble is solved or decrease the value   [G]
                                                            of [Pr. PA09 Auto tuning response].                                               [B]
     the auto tuning is too high.
                                                                                                                                              [A]
2. The machine is vibrating (resonating).                   Perform one-touch tuning or adaptive tuning, or set the machine resonance
                                                            suppression filter.

3. The load side is vibrating.                              Perform vibration suppression control tuning or set the vibration suppression
                                                            control.

4. Noise entered the encoder cable, causing the             Check if numerical values of the cumulative feedback pulses are skipped on
                                                            the status display ([A]) or with MR Configurator2. Take countermeasures
     miscount of the feedback pulses.
                                                            against noise, such as laying the encoder cable apart from the power cables.

5. There is a backlash between the servo motor              If the coupling and the mechanical part are nearly broken, or there is a
                                                            backlash, perform an inspection and maintenance.
     and machine (such as a gear and coupling).
6. The rigidity of the servo motor mounting part is         Increase the rigidity of the mounting part by increasing the board thickness,
                                                            reinforcing the part with ribs, or other means.
     too low.
7. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                            Refer to "Example power circuit connections" in the following manuals.
                                                            MR-J5 User's Manual (Hardware)
                                                            MR-J5D User's Manual (Hardware)

8. An unbalanced torque of the machine is too               Check if the vibration also changes as the servo motor speed changes.
                                                            Adjust the balance of the machine.
     large.
9. The eccentricity due to a core gap is too large. Check the mounting accuracy of the servo motor and machine.
10. A load for the shaft of the servo motor is too Make the load for the shaft of the servo motor equal to or less than the
                                                            permissible load of the servo motor.
     large.
                                                            Refer to "Standard specifications list" in the following manual.
                                                            Rotary Servo Motor User's Manual (For MR-J5)

11. An external vibration propagated to the servo           Prevent the vibration from the external vibration source.

     motor.


                                                                                         1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                   1.4 Trouble which does not trigger an alarm/warning              253

---

## หน้า 256

Poor speed accuracy (Unstable speed of servo motor)
  Possible cause                                            Check/action method                                                               Model
  1. The servo gain is too low or the response of           Increase the servo gain or the value of [Pr. PA09 Auto tuning response].          [G]
                                                                                                                                              [B]
       auto tuning is too low.
                                                                                                                                              [A]
  2. The servo gain is too high or the response of          Decrease the servo gain to check if the trouble is solved. Alternatively,
                                                            decrease the value of [Pr. PA09].
       the auto tuning is too high.
  3. The torque is insufficient for the large load.         Check the instantaneous torque on the status display ([A]) or with MR
                                                            Configurator2. If the torque reaches the maximum torque or the torque limit
                                                            value, reduce the load or replace the servo motor with a larger-capacity servo
                                                            motor.

  4. An unintended torque limit has been enabled.           On the status display or MR Configurator2, check if TLC (Limiting torque) is
                                                            turned on. Cancel the torque limit.
                                                            Refer to "Torque limit" in the following manual.
                                                            MR-J5 User's Manual (Function)

  5. The setting value for the torque limit is              Increase the torque limit value.
                                                            Refer to "Torque limit" in the following manual.
       incorrect.
                                                            MR-J5 User's Manual (Function)

  6. For a servo motor with an electromagnetic              Turn on the electromagnetic brake power.

       brake, the brake has not been released.
  7. The command from the controller is unstable.           Review the command from the controller.
                                                            Alternatively, check if the Ethernet cable or SSCNET III cable is disconnected
                                                            or has other problems.

  8. The power supply voltage is lower than                 Adjust the power supply voltage within the range of specifications.

       specifications.

  The machine vibrates unsteadily when it stops
  Possible cause                                            Check/action method                                                               Model
  1. The servo gain is too low or the response of           Increase the servo gain or the value of [Pr. PA09 Auto tuning response].          [G]
                                                                                                                                              [B]
       auto tuning is too low.
                                                                                                                                              [A]


  Overshoot/undershoot occurs
  Possible cause                                            Check/action method                                                               Model
  1. The servo gain is too low or too high. The             Adjust the response of auto tuning and readjust the gain.                         [G]
                                                                                                                                              [B]
       response of auto tuning is too low or too high.
                                                                                                                                              [A]
  2. The setting of [Pr. PB06 Load to motor inertia         Check if the setting value of [Pr. PB06] matches the actual load moment of
                                                            inertia or load mass. If the value does not match, set the parameter correctly.
       ratio/load to motor mass ratio] is incorrect.
  3. The maximum torque is insufficient due to the          Check the instantaneous torque on the status display. Check if the torque
                                                            reaches the torque limit value. Keep the torque outside the torque limit value
       excessive load or the capacity of the servo
                                                            by increasing the acceleration/deceleration time or by reducing the load.
       motor is insufficient.                               Alternatively, use a servo motor with a larger capacity.

  4. The setting of the torque limit value is too           Check the instantaneous torque on the status display. Check if the torque
                                                            reaches the torque limit value.
       small.
                                                            Increase the torque limit value so that the torque does not reach the limit
                                                            value.

  5. The backlash of the machine part is too large.         Perform an inspection and maintenance of the coupling and the machine.


      1 SERVO AMPLIFIER TROUBLESHOOTING
254   1.4 Trouble which does not trigger an alarm/warning

---

## หน้า 257

The servo motor starts moving immediately after the power-on of
the servo amplifier or servo-on                                                                                                                            1
Possible cause                                             Check/action method                                                                 Model
1. The SON (Servo-on) had been already turned              Review the wiring or the sequence program.                                          [A]

     on at power-on.
2. ST1 (Forward rotation start) or ST2 (Reverse            Review the wiring or the sequence program.

     rotation start) had already been input at the
     start.
3. An analog signal had already been input at the          Review the timing of inputting analog signals.

     start.
4. The zero point of an analog signal has                  If the servo motor rotates with 0 V input for the analog signal, execute the VC
                                                           automatic offset, or adjust the offset of the analog signal with [Pr. PC37 Analog
     deviated.
                                                           command input 1 offset] or [Pr. PC38 Analog command input 2 offset].

5. A command pulse was input from the                      Review the controller programs.

     controller.
6. Wiring of a command pulse train is incorrect,           Check for any disconnected wiring of the command pulse train and any loose
                                                           connection with the terminal.
     causing command pulses to be miscounted.
                                                           If there is any problems, correct the wiring of the command pulse train.

7. When a servo motor with an electromagnetic              Review the timing of the electromagnetic brake release.                             [G]
                                                                                                                                               [B]
     brake is used, the brake release timing is
                                                                                                                                               [A]
     incorrect.
8. The connection of the servo motor is incorrect. Check the U/V/W wiring.
                                                           Refer to "Example power circuit connections" in the following manuals.
                                                           MR-J5 User's Manual (Hardware)
                                                           MR-J5D User's Manual (Hardware)

9. The control mode was switched without                   Perform position follow-up on the controller side before switching the control      [G]
                                                           mode.                                                                               [B]
     performing position follow-up on the controller
     side.

The home position deviates at the homing
Possible cause                                             Check/action method                                                                 Model
1. When performing the dog type homing, the                Check if a fixed amount (in one revolution) deviates. Adjust the position of the    [G]
                                                           proximity dog.                                                                      [B]
     point where the proximity dog turns off is close
                                                                                                                                               [A]
     to the point where a Z-phase pulse is detected
     (CR input position).
2. The in-position range is too large.                     Set the value in [Pr. PA10 In-position range] for a narrower range than the
                                                           current setting.

3. The proximity dog switch has malfunctioned or           Repair or replace the proximity dog switch. Adjust the mounting of the
                                                           proximity dog switch.
     the proximity dog switch is improperly
     mounted.
4. The program on the controller side is incorrect. Review the program on the controller side, such as home position address
                                                           settings and sequence programs.

5. An incorrect homing method has been                     Review the homing method selection.

     selected.


                                                                                        1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                                  1.4 Trouble which does not trigger an alarm/warning                255

---

## หน้า 258

The position deviates during operation after the homing
  Possible cause                                            Check/action method                                                               Model
  1. The electronic gear is incorrect.                      Review the settings of the electronic gear.                                       [G]
                                                            Refer to "Electronic gear function" in the following manual.                      [B]
                                                            MR-J5 User's Manual (Function)                                                   [A]

  2. The servo gain is too low or the response of           Check if the trouble is solved by increasing the value of [Pr. PA09 Auto tuning
                                                            response].
      auto tuning is too low.
                                                            Adjust the servo gain.

  3. The proportional control (PID control) is              Disable the proportional control (PID control).

      enabled.
  4. The in-position range is too large.                    Review the setting value of [Pr. PA10 In-position range].

  5. Mechanical slippage occurred or the backlash           Check for a slip or backlash in the mechanical part.

      of the mechanical part is too large.
  6. The command pulses were miscounted due to              If the command value of the controller does not match the number of               [A]
                                                            cumulative command pulses, perform the noise reduction techniques on the
      noise.
                                                            command cables, or review the shield procedure of the command cable.

  7. The command cable is loosely connected or              If the command value of the controller does not match the number of
                                                            cumulative command pulses, repair the command cable.
      disconnected.
  8. The pulse train command frequency exceeded             Use the pulse train command frequency within the range of specifications.
                                                            Open-collector type: 500 kpulses/s or less.
      the specification range.
                                                            Differential line driver type: 4 Mpulses/s or less.
                                                            Set [Pr. PA13.2 Command input pulse train filter selection] according to the
                                                            pulse train command frequency.

  9. The command cable is too long.                         Shorten the wiring length.
                                                            Differential line driver type: 10 m or less.
                                                            Open-collector type: 2 m or less.

  10. SON (Servo-on) turned off during operation.           Review the wiring or sequence program so that SON does not turn off during
                                                            operation.

  11. LSP (Forward rotation stroke end) or LSN              Review the operation range or the position of the stroke end.

      (Reverse rotation stroke end) turned off.
  12. CR (Clear) or RES (Reset) turned on during            Review the wiring or sequence so that CR or RES does not turn on during
                                                            operation.
      operation.


      1 SERVO AMPLIFIER TROUBLESHOOTING
256   1.4 Trouble which does not trigger an alarm/warning

---

## หน้า 259

A position mismatch occurs at power restoration in an absolute
position detection system                                                                                                                       1
Possible cause                                          Check/action method                                                         Model
1. While the servo amplifier was in power-off           Extend the acceleration time.                                               [G]
                                                        Keep the speed under the maximum permissible speed at power failure.        [B]
     status, an external force rotated the servo
                                                                                                                                    [A]
     motor at a speed exceeding the maximum
     permissible speed at power failure (8000 r/
     min). (The acceleration time was 0.2 s or less.)
2. When the servo motor was rotated at a speed          Check if the servo amplifier power was turned on when the servo motor was
                                                        rotated at a speed exceeding 3000 r/min by an external force.
     exceeding 3000 r/min by an external force, the
     servo amplifier power was turned on.
3. Transfer data to the controller is incorrect.        Check the ABS data with MR Configurator2.                                   [A]
                                                        Review the controller programs.


Communication with the servo amplifier fails using MR
Configurator2
• For details, refer to the "HELP" window in MR Configurator2.
Possible cause                                          Check/action method                                                         Model
1. The communication settings are incorrect.            Check the communication settings, such as the baud rate and ports.          [G]
                                                                                                                                    [B]
2. The model being connected differs from the           Check if the model selection has been set correctly.
                                                                                                                                    [A]
     model set in the model selection.
3. The driver has been set incorrectly.                 Refer to "PRECAUTIONS FOR COMMUNICATING WITH THE SERVO
                                                        AMPLIFIER" on the "HELP" window in MR Configurator2.

4. They are off-line.                                   Set them to on-line.

5. There is a problem with the communication            Replace the communication cable.

     cable.
6. The communication cable is not connected.            Connect the communication cable.

7. Power is not being supplied to the servo             Supply the power to the servo amplifier.

     amplifier.
8. The station number setting is incorrect.             Review the station number.                                                  [A]


                                                                                     1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                               1.4 Trouble which does not trigger an alarm/warning        257

---

## หน้า 260

Electromagnetic brake went out
  Possible cause                                            Check/action method                                                                  Model
  1. The electromagnetic brake has reached the              Remove the servo motor and all the wiring from the machine, and check if the         [G]
                                                            servo motor shaft is rotated by an external force. If the motor rotates, the brake   [B]
      end of its service life.
                                                            has a failure. Replace the servo motor.                                              [A]
                                                            Refer to "Characteristics of electromagnetic brake" in the following manual.
                                                            Rotary Servo Motor User's Manual (For MR-J5)


  Electromagnetic brake cannot be released
  Possible cause                                            Check/action method                                                                  Model
  1. The wiring is incorrect.                               Check the output signals.                                                            [G]
                                                                                                                                                 [B]
  2. A signal of an output device has not been              Check if the output device cable is wired correctly. Alternatively, check if the
                                                                                                                                                 [A]
                                                            load of the output device is within specifications.
      output correctly.

  The vertical axis falls when the SBC output is used
  Possible cause                                            Check/action method                                                                  Model
  1. The STO function is used during servo-on, and          For vertical axes, use the SS1 function, and establish the STO state.                [G]

      the STO state is established.
  2. A signal of an output device has not been              Check if the output device cable is wired correctly. Check if the load of the
                                                            output device is within specifications.
      output correctly.
  3. The waiting time for an electromagnetic brake          Review the settings of "electromagnetic brake sequence output" and "SS1/
                                                            SS2 deceleration monitor time" with the following parameters.
      sequence output has not been set correctly.
                                                            [G]: [Pr. PC02 Electromagnetic brake sequence output (MBR)] and [Pr. PSA03
                                                            SS1/SS2 deceleration monitor time (**SST)]


  Coasting distance of the servo motor became longer
  Possible cause                                            Check/action method                                                                  Model
  1. The load increased and exceeded the                    Reduce the load.                                                                     [G]
                                                                                                                                                 [B]
      permissible load to motor inertia.
                                                                                                                                                 [A]
  2. The electromagnetic brake has reached the              Remove the servo motor and all the wiring from the machine, and check if the
                                                            servo motor shaft can be rotated by the hands. If the motor rotates, the brake
      end of its service life.
                                                            has a failure. Replace the servo motor.
                                                            Refer to "Characteristics of electromagnetic brake" in the following manual.
                                                            Rotary Servo Motor User's Manual (For MR-J5)

  3. The electronic dynamic brake is disabled.              [G] [B]: Enable the electronic dynamic brake with [Pr. PF06.0 Electronic
                                                            dynamic brake selection].
                                                            [A]: Enable the electronic dynamic brake with [Pr. PF09.0 Electronic dynamic
                                                            brake selection].


      1 SERVO AMPLIFIER TROUBLESHOOTING
258   1.4 Trouble which does not trigger an alarm/warning

---

## หน้า 261

Executed point table does not work
Possible cause                                      Check/action method                                                                Model       1
1. Positioning to the same position are repeated.   Operation is repeatedly started by specifying the same point table number.         [G]
                                                    Review the specification of the point table number or the operating procedure.
                                                    Positioning to the same position address is repeated by selecting "8, 9, 10, 11"
                                                    (continuous operation) in the auxiliary function of the point table. Review the
                                                    setting value of the point table number or the operating procedure.

2. A point table number for which no value has      Set the correct value to the specified point table. Or, specify the point table
                                                    number for which a value has been set.
    been set is specified.

RS-422 communication (Mitsubishi Electric AC servo protocol)
cannot be used
Possible cause                                      Check/action method                                                                Model
1. The communication settings are incorrect.        Check that [Pr. PC20 Station No. setting] matches the station No. specified by     [A]
                                                    the controller being used.
                                                    Check that [Pr. PC21.1 RS-422 communication - Baud rate selection] matches
                                                    the communication baud rate settings of the controller being used.

2. There is a problem with the communication        Replace the communication cable.

    cable.
3. The wiring is incorrect.                         Review the wiring.


                                                                                 1 SERVO AMPLIFIER TROUBLESHOOTING
                                                                           1.4 Trouble which does not trigger an alarm/warning               259

---

## หน้า 262

1.5             Two-digit display of alarm/warning number
  For some objects, the alarm/warning number can only be read in two digits. For three-digit alarm/warning numbers, check the
  number using an object that can read three-digit numbers, the servo amplifier display, or MR Configurator2.


       1 SERVO AMPLIFIER TROUBLESHOOTING
260    1.5 Two-digit display of alarm/warning number

---

## หน้า 263

MEMO
                                                             1


       1 SERVO AMPLIFIER TROUBLESHOOTING
       1.5 Two-digit display of alarm/warning number   261

---

## หน้า 264

REVISIONS
  *The manual number is given on the bottom left of the back cover.
   Revision date             *Manual number                   Description
   June 2019                 SH(NA)-030312ENG-A               First edition
   January 2020              SH(NA)-030312ENG-B               ■Alarms and warnings related to the following functions are added:
                                                              Profile mode, communication function, fully closed loop system, scale measurement function, super
                                                              trace control, touch probe, functional safety
   July 2020                 SH(NA)-030312ENG-C               ■Alarms and warnings related to the following function are added:
                                                              Functional safety
   October 2020              SH(NA)-030312ENG-D               ■Alarms and warnings related to the following functions are added:
                                                              400 V class servo amplifier
                                                              Communication function (Mitsubishi Electric AC servo protocol)
                                                              Degree unit
   March 2021                SH(NA)-030312ENG-E               ■Alarms and warnings related to the following function are added:
                                                              Positioning mode (point table method)
   June 2021                 SH(NA)-030312ENG-F               ■Alarms and warnings related to the following functions are added:
                                                              CC-Link IE Field Network Basic, MR-J5D_ drive unit
   July 2022                 SH(NA)-030312ENG-G               ■The following model is added:
                                                              MR-J5_-_B_
                                                              ■Alarms and warnings related to the following functions are added/edited:
                                                              CC-Link IE TSN Class A, master-slave operation function
   January 2023              SH(NA)-030312ENG-H               ■Alarms and warnings related to the following function are added/edited:
                                                              Servo motor incorrect wiring detection function
   July 2023                 SH(NA)-030312ENG-J               ■The following manufacturer setting alarms/ manufacturer setting warnings are added:
                                                              [AL. 09E.B], [AL. 584], [AL. 585], [AL. 586], [AL. 587], [AL. 5E2.2], [AL. 5E2.A]
   January 2024              SH(NA)-030312ENG-K               ■Alarms and warnings related to the following functions are added:
                                                              Functional safety, IP address setting function via the master station
   July 2024                 SH(NA)-030312ENG-L               ■Alarms and warnings related to the following function are added/edited:
                                                              Pressure mode

   This manual confers no industrial property rights or any rights of any other kind, nor does it confer any patent licenses. Mitsubishi Electric Corporation cannot
   be held responsible for any problems involving industrial property rights which may occur as a result of using the contents noted in this manual.

   2019 MITSUBISHI ELECTRIC CORPORATION


262

---

## หน้า 265

WARRANTY
Warranty
1. Warranty period and coverage
  We will repair any failure or defect hereinafter referred to as "failure" in our FA equipment hereinafter referred to as the "Product" arisen
  during warranty period at no charge due to causes for which we are responsible through the distributor from which you purchased the
  Product or our service provider. However, we will charge the actual cost of dispatching our engineer for an on-site repair work on
  request by customer in Japan or overseas countries. We are not responsible for any on-site readjustment and/or trial run that may be
  required after a defective unit are repaired or replaced.
  [Term]
  For terms of warranty, please contact your original place of purchase.
  [Limitations]
   (1) You are requested to conduct an initial failure diagnosis by yourself, as a general rule.
        It can also be carried out by us or our service company upon your request and the actual cost will be charged. However, it will not
        be charged if we are responsible for the cause of the failure.
   (2) This limited warranty applies only when the condition, method, environment, etc. of use are in compliance with the terms and
        conditions and instructions that are set forth in the instruction manual and user manual for the Product and the caution label affixed
        to the Product.
   (3) Even during the term of warranty, the repair cost will be charged on you in the following cases;
       1. a failure caused by your improper storing or handling, carelessness or negligence, etc., and a failure caused by your hardware
            or software problem
       2. a failure caused by any alteration, etc. to the Product made on your side without our approval
       3. a failure which may be regarded as avoidable, if your equipment in which the Product is incorporated is equipped with a safety
            device required by applicable laws and has any function or structure considered to be indispensable according to a common
            sense in the industry
       4. a failure which may be regarded as avoidable if consumable parts designated in the instruction manual, etc. are duly maintained
            and replaced
       5. any replacement of consumable parts (battery, fan, smoothing capacitor, etc.)
       6. a failure caused by external factors such as inevitable accidents, including without limitation fire and abnormal fluctuation of
            voltage, and acts of God, including without limitation earthquake, lightning and natural disasters
       7. a failure generated by an unforeseeable cause with a scientific technology that was not available at the time of the shipment of
            the Product from our company
       8. any other failures which we are not responsible for or which you acknowledge we are not responsible for
2. Term of warranty after the stop of production
  (1) We may accept the repair at charge for another seven (7) years after the production of the product is discontinued. The
      announcement of the stop of production for each model can be seen in our Sales and Service, etc.
  (2) Please note that the Product (including its spare parts) cannot be ordered after its stop of production.
3. Service in overseas countries
  Our regional FA Center in overseas countries will accept the repair work of the Product. However, the terms and conditions of the repair
  work may differ depending on each FA Center. Please ask your local FA center for details.
4. Exclusion of loss in opportunity and secondary loss from warranty liability
  Regardless of the gratis warranty term, Mitsubishi shall not be liable for compensation to:
  (1) Damages caused by any cause found not to be the responsibility of Mitsubishi.
  (2) Loss in opportunity, lost profits incurred to the user by Failures of Mitsubishi products.
  (3) Special damages and secondary damages whether foreseeable or not, compensation for accidents, and compensation for
      damages to products other than Mitsubishi products.
  (4) Replacement by the user, maintenance of on-site equipment, start-up test run and other tasks.
5. Change of Product specifications
  Specifications listed in our catalogs, manuals or technical documents may be changed without notice.
6. Application and use of the Product
  (1) For the use of our AC Servo, its applications should be those that may not result in a serious damage even if any failure or
      malfunction occurs in AC Servo, and a backup or fail-safe function should operate on an external system to AC Servo when any
      failure or malfunction occurs.
  (2) Our AC Servo is designed and manufactured as a general purpose product for use at general industries.
      Therefore, applications substantially influential on the public interest for such as atomic power plants and other power plants of
      electric power companies, and also which require a special quality assurance system, including applications for railway companies
      and government or public offices are not recommended, and we assume no responsibility for any failure caused by these
      applications when used.
      In addition, applications which may be substantially influential to human lives or properties for such as airlines, medical treatments,
      railway service, incineration and fuel systems, man-operated material handling equipment, entertainment machines, safety
      machines, etc. are not recommended, and we assume no responsibility for any failure caused by these applications when used.
      We will review the acceptability of the abovementioned applications, if you agree not to require a specific quality for a specific
      application. Please contact us for consultation.
  (3) Mitsubishi Electric shall have no responsibility or liability for any problems involving programmable controller trouble and system
      trouble caused by DoS attacks, unauthorized access, computer viruses, and other cyberattacks.


                                                                                                                                             263

---

## หน้า 266

TRADEMARKS
  MELSERVO is a trademark or registered trademark of Mitsubishi Electric Corporation in Japan and/or other countries.
  All other product names and company names are trademarks or registered trademarks of their respective companies.


                                                                                                         SH(NA)-030312ENG-L
264

---

## หน้า 267

_(หน้านี้ไม่มีข้อความ — เป็นรูปภาพ/ไดอะแกรมล้วน)_

---

## หน้า 268

SH(NA)-030312ENG-L(2407)MEE
MODEL:
MODEL CODE:


HEAD OFFICE: TOKYO BLDG., 2-7-3, MARUNOUCHI, CHIYODA-KU, TOKYO 100-8310, JAPAN
NAGOYA WORKS: 1-14, YADA-MINAMI 5-CHOME, HIGASHI-KU, NAGOYA 461-8670, JAPAN


 When exported from Japan, this manual does not require application to the
 Ministry of Economy, Trade and Industry for service transaction permission.


Specifications subject to change without notice.
Compliance with the indicated global standards and regulations is current as of the release date of this manual.

---
