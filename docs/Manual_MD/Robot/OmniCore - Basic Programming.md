# OmniCore - Basic Programming

| | |
|---|---|
| **ไฟล์ต้นฉบับ** | `D:\SMG_X_PROJECT\Database\Database\Manual\Robot\OmniCore - Basic Programming.pdf` |
| **จำนวนหน้า** | 84 |
| **วิธีสกัดข้อความ** | text layer (embedded) |

---
## หน้า 1

8/1/2022


    —
    Basic Programming
    OmniCore/RobotWare 7 - Presentation


1


    —
    Table of contents

    ■   Health and Safety
    ■   Introduction to OmniCore and ABB Robots
    ■   Introduction to the FlexPendant
    ■   Jogging
    ■   Programming Basic Movements
    ■   RobotStudio - RAPID Editor
    ■   Program Structure
    ■   Handling Inputs and Outputs
    ■   I/O Instructions
    ■   Revolution Counters
    ■   Tools
    ■   Work Objects
    ■   Saving Data
    ■   Virtual Controller
    ■   Assessment Exercise - Programming: Draw Shapes
    ■   Basic Functions
    ■   Assessment Exercise - Programming: Pick & Place
    ■   Basic Instructions and Program Logic
    ■   Creating Custom Cards and Dashboards
    ■   Add a Digital Input/Output Signal


    August 1, 2022     Slide 2   OmniCore - Basic Programming
                                                                       1
2

---

## หน้า 2

8/1/2022


    —
    Health and Safety


3


    —
    Health and Safety
    Objectives


    After this chapter you should be able to:
    – Participate in all course activities safely
    – Safely evacuate the premises in case of fire or other emergency
    – Describe what happens to the robot when brake release is used


    August 1, 2022    Slide 4   OmniCore - Basic Programming
                                                                               2
4

---

## หน้า 3

8/1/2022


    —
    Health and Safety
    Course Safety


    For the duration of this course, please:
    – Pay attention to the trainer
    – Report any unsafe behavior to the trainer
    – Ask for help if you are unsure how to perform a task
    – Do not perform any task that you feel is unsafe; talk to your trainer for reassurance


                                                                 ALWAYS put safety first!


    August 1, 2022      Slide 5   OmniCore - Basic Programming


5


    —
    Health and Safety
    Local Safety


    In case of emergency
    – Fire exits/escape routes
    – Rallying point
    – First aid kit
    – Emergency stops
    – (Heart starter)


                                                                 ALWAYS put safety first!


    August 1, 2022      Slide 6   OmniCore - Basic Programming
                                                                                                     3
6

---

## หน้า 4

8/1/2022


    —
    Health and Safety
    Safety risks when working with robots


    – Always set the robot to manual before entering the robot cell
    – Always bring the FlexPendant along when entering the safeguarded space, preventing people outside the robot cell from operating the
      robot.
    – Make sure any rotating tools, such as milling cutters or saws, are stopped before approaching the robot.
    – Watch out for hot surfaces, both workpieces and the robot’s motors can become very hot.
    – Be careful when opening and closing grippers; make sure the workpiece is in a secure position before opening the grip tool.
    – Keep away from hydraulic, pneumatic and live electric parts. Even with power off, the residual energy can be very dangerous.


                                   Be careful! Robots may perform unexpected and irrational movements!


    August 1, 2022      Slide 7   OmniCore - Basic Programming


7


    —
    Health and Safety
    Safety Stops


    External Safeguards                                                                          Danger!
    – Emergency stops                                                                            When a stop is triggered the braking
    – Door interlocks                                                                            distance of a robot is heavily affected by
                                                                                                 the robot’s current speed and load
    – Light curtains
    – Safety mats


    August 1, 2022      Slide 8   OmniCore - Basic Programming
                                                                                                                                                     4
8

---

## หน้า 5

8/1/2022


     —
     Health and Safety
     Brake Release


     Important                                             IRB 1200 Brake Release     IRB 6700 Brake Release
     – All axes have mechanical brakes
     – Brake release disable brakes
     – Does not work in case of power failure
     – Robots with counter weights or
       balancing cylinders may move upward


     Pressing brake release will cause axes to
     give way to gravitational force!


                          Pressing brake release to loosen someone that is stuck may cause further damage!


     August 1, 2022   Slide 9    OmniCore - Basic Programming


9


     —
     Health and Safety
     Safety Questions


     – What operating mode should be active when entering the robot
       cell?


     – What should you do if someone is acting in an unsafe manner?


     – What happens if the brake release button for axis 3 is pushed?


     – Do you feel adequately informed about how to act in case of an
       emergency?


     August 1, 2022   Slide 10   OmniCore - Basic Programming
                                                                                                                      5
10

---

## หน้า 6

8/1/2022


     —
     Introduction to OmniCore and ABB Robots


11


     —
     Introduction to OmniCore and ABB Robots
     Objectives


     After this chapter you should be able to:
     – Explain what a controller and manipulator is
     – Explain what an axis is and point them out on a robot
     – Name the two most common operating modes for an ABB robot


     August 1, 2022   Slide 12   OmniCore - Basic Programming
                                                                          6
12

---

## หน้า 7

8/1/2022


     —
     Introduction to OmniCore and ABB Robots
     The Manipulator


     August 1, 2022   Slide 13   OmniCore - Basic Programming


13


     —
     Introduction to OmniCore and ABB Robots
     The Controller


     IRC5 Single Controller (5th gen)                           OmniCore C30 Controller (6th gen)


     August 1, 2022   Slide 14   OmniCore - Basic Programming
                                                                                                           7
14

---

## หน้า 8

8/1/2022


     —
     Introduction to OmniCore and ABB Robots
     Operating Modes


     Manual                                                  Automatic                               Manual Full Speed
     – Test programs                                         – Normal production                     – Use with CAUTION, dangerous operating
     – Max 250 mm/s speed limit                              – Operate at full speed                   mode!

     – No force limit                                        – No enabling device                    – Ignores Auto stop; can run programs at
                                                                                                       full speed with personnel inside cell
     – Requires operator to hold enabling                    – No personnel inside cell
       device                                                                                        – Requires operator to hold enabling
                                                                                                       device and start button
     – Jog robot
                                                                                                     – Cannot be used for jogging


     August 1, 2022     Slide 15   OmniCore - Basic Programming


15


     —
     Introduction to OmniCore and ABB Robots
     Connecting to the Controller


     Flexpendant                                                                       RobotStudio


     August 1, 2022     Slide 16   OmniCore - Basic Programming
                                                                                                                                                       8
16

---

## หน้า 9

8/1/2022


     —
     Introduction to the FlexPendant


17


     —
     Introduction to the FlexPendant
     Objectives


     After this chapter you should be able to:
     – Navigate in the FlexPendant's user interface (Quickset menu, applications)
     – Explain each function of the FlexPendant's physical controls/buttons


     August 1, 2022   Slide 18   OmniCore - Basic Programming
                                                                                           9
18

---

## หน้า 10

8/1/2022


     —
     Introduction to the FlexPendant
     FlexPendant


     Buttons/Controls
     – Emergency stop
     – Programmable keys
     – Jogging options
            • Switch mechanical unit
            • Linear/reoriented jogging
            • Axis-by-axis group 1/2
     – Program Control
            • Start/stop
            • Stepwise forward/backward
     – Joystick
            • 3-axis movement


     August 1, 2022    Slide 19   OmniCore - Basic Programming


19


     —
     Introduction to the FlexPendant
     Home Screen / Applications Menu


     August 1, 2022    Slide 20   OmniCore - Basic Programming
                                                                       10
20

---

## หน้า 11

8/1/2022


     —
     Introduction to the FlexPendant
     Status Bar


     A. Applications
     B. Messages
     C. Event log
     D. Back (virtual only)
     E. Program Status
     F. Operating Mode
     G. Motor Status
     H. Program Speed


     August 1, 2022    Slide 21   OmniCore - Basic Programming


21


     —
     Introduction to the FlexPendant
     Quickset Menu - Overview


     A. Quickset Menu
     B. Control Panel - Opreating Mode, Motors On, Speed etc
     C. Jog Settings - Work Object, Tool, Jog Speed etc
     D. Execution Settings - Run Mode, Step Mode etc
     E. Visualization - 3D robot view, position, orientation etc
     F. System Info - RobotWare, IP address etc
     G. Connection - Restart, log out, connected services status etc


     August 1, 2022    Slide 22   OmniCore - Basic Programming
                                                                             11
22

---

## หน้า 12

8/1/2022


     —
     Introduction to the FlexPendant
     Quickset - Control Panel


     – Mode
     – Motors
     – Speed
     – Edit Program Pointer
     – Play/Pause
     – Prev/Next


     August 1, 2022   Slide 23   OmniCore - Basic Programming


23


     —
     Introduction to the FlexPendant
     Quickset - Jog Settings


     – Mechanical Unit
     – Work Object
     – Tool
     – Load
     – Jog Speed
     – Jog Mode
     – Coordinate System


     August 1, 2022   Slide 24   OmniCore - Basic Programming
                                                                      12
24

---

## หน้า 13

8/1/2022


     —
     Introduction to the FlexPendant
     Quickset - Execution Settings


     – Run Mode
            • Single
            • Continuous
     – Step Mode
            • Step Over
            • Step Into
            • Step Out
            • Step Move
     – Non Motion Execution
     – Enable/Disable tasks


     August 1, 2022       Slide 25   OmniCore - Basic Programming


25


     —
     Introduction to the FlexPendant
     Quickset - Visualization


     – Motion Mode
     – Coordinate System
     – Mechanical Unit
     – Position
     – Coordinate Directions
     – Joystick Directions


     August 1, 2022       Slide 26   OmniCore - Basic Programming
                                                                          13
26

---

## หน้า 14

8/1/2022


     —
     Introduction to the FlexPendant
     Jog Application


     Axis-by-axis Jogging


     August 1, 2022   Slide 27   OmniCore - Basic Programming


27


     —
     Introduction to the FlexPendant
     Jog Application


     Linear Jogging


     August 1, 2022   Slide 28   OmniCore - Basic Programming
                                                                      14
28

---

## หน้า 15

8/1/2022


     —
     Introduction to the FlexPendant
     I/O Application - Overview


     Side Menu
     – I/O Networks
     – I/O Devices
     – Signals
     – Favorite Signals
     – Configuration


     August 1, 2022    Slide 29   OmniCore - Basic Programming


29


     —
     Introduction to the FlexPendant
     I/O Application - Signals


     – Use Search and Filter to find signals
     – Favorite Signals are user defined
     – Signals can be set/reset (output only)
     – Signals can be simulated


     August 1, 2022    Slide 30   OmniCore - Basic Programming
                                                                       15
30

---

## หน้า 16

8/1/2022


     —
     Introduction to the FlexPendant
     Code Application


     Modules
     – Create/save/load/rename programs
     – Create/save/load/rename/delete modules
     – Switch between tasks


     Code Editor
     – Modify and test code
     – Teach Positions
     – Check program for errors
     – Add instructions


     RAPID Data
     – View, change and create data


     August 1, 2022    Slide 31   OmniCore - Basic Programming


31


     —
     Introduction to the FlexPendant
     Operate Application


     Operate -> Advanced View
     – Load programs
     – Restart program from main
     – Teach positions
     – Show Program Pointer
     – Show Motion Pointer


     August 1, 2022    Slide 32   OmniCore - Basic Programming
                                                                       16
32

---

## หน้า 17

8/1/2022


     —
     Introduction to the FlexPendant
     Operate Application


     Dashboards
     – Create your own dashboard(s)
     – Display important information specifically for
       your production
     – Use pre made system cards or create your
       own


     August 1, 2022    Slide 33   OmniCore - Basic Programming


33


     —
     Introduction to the FlexPendant
     Operate Application


     Operate -> Service Routines
     – Pre made routines that perform service tasks
     – Tap a service routine to run it, then follow the
       instructions


     August 1, 2022    Slide 34   OmniCore - Basic Programming
                                                                       17
34

---

## หน้า 18

8/1/2022


     —
     Jogging


35


     —
     Jogging
     Objectives


     After this chapter you should be able to:
     – Explain and set up the different jogging parameters
     – Jog the robot to any desired position — with ease


     August 1, 2022   Slide 36   OmniCore - Basic Programming
                                                                      18
36

---

## หน้า 19

8/1/2022


     —
     Jogging
     Different Types of Jogging


     Axis-by-axis                                            Linear                                 Reoriented


                                                          Choosing the correct motion mode is key


     August 1, 2022     Slide 37   OmniCore - Basic Programming


37


     —
     Jogging
     The Jogging Window


     Properties
     A. Mechanical unit
     B. Motion Mode
     C. Coordinate system
     D. Tool
     E. Work object
     F. Joystick lock
     G. Increment


     August 1, 2022     Slide 38   OmniCore - Basic Programming
                                                                                                                       19
38

---

## หน้า 20

8/1/2022


     —
     Jogging
     Axis-by-axis


     What is it used for?
     – Moving between stations in robotcell
     – Get away from singularity
     – Jog to sync position


     August 1, 2022   Slide 39   OmniCore - Basic Programming


39


     —
     Jogging
     Linear in Base


     What is it used for?
     – Moving TCP to specific positions
     – Moving along linear paths


     August 1, 2022   Slide 40   OmniCore - Basic Programming
                                                                      20
40

---

## หน้า 21

8/1/2022


     —
     Jogging
     Exercise - Jogging Axis-by-axis and Linear in Base


     Task
     – Jog axis-by-axis until the pen is aligned normal
       to the surface, slightly above the paper
     – Carefully jog linear in base coordinate system
       until the pen touches the paper in the A-circle
     – Continue jogging linear in base coordinate
       system to draw a line between A-B-C-D-A
     – Try to draw a straight line between A and C,
       still jogging linear in base coordinate system


     August 1, 2022    Slide 41   OmniCore - Basic Programming


41


     —
     Jogging
     Jogging Linear in Tool Coordinate System


     What is it used for?
     – Moving the robot in the tool’s directions, e.g.,
       when the base coordinates does not line up
       with where you want to go.


     August 1, 2022    Slide 42   OmniCore - Basic Programming
                                                                       21
42

---

## หน้า 22

8/1/2022


     —
     Jogging
     Jogging Reoriented


     What is it used for?
     – Reorienting the tool, e.g., when aligning with a
       product.


     August 1, 2022    Slide 43   OmniCore - Basic Programming


43


     —
     Jogging
     Exercise - Jogging Axis-by-axis and Linear in Base


     Task                                                                     Reorienting
     – Jog the robot in motion mode of your choice until you reach the
       circle marked -1-
     – Change motion mode to reoriented, coordinate system to Tool
       and choose the correct tool
     – If needed, reorient the robot until one of the coordinate axes for
       the active tool points toward the next circle
     – Change motion mode to linear, make sure coordinate system is
       still tool, then jog towards the next circle in a straight line, you   Jogging in Tool Coordinate System
       are only allowed to jog in 1 direction at a time, x or y.
     – Repeat step 2-4 until you have completed the path


     August 1, 2022    Slide 44   OmniCore - Basic Programming
                                                                                                                        22
44

---

## หน้า 23

8/1/2022


     —
     Programming Basic Movements


45


     —
     Programming Basic Movements
     Objectives


     After this chapter you should be able to:
     – Explain the difference between MoveL, MoveJ and MoveC
     – Describe the zone and speed parameters of a move instruction
     – Program the robot to draw a shape with an already mounted pen tool


     August 1, 2022   Slide 46   OmniCore - Basic Programming
                                                                                  23
46

---

## หน้า 24

8/1/2022


     —
     Programming Basic Movements
     Movement Types


     MoveJ                                                                MoveL
     – Non-linear movement                                                – Linear motion to the target
     – All axes reach the destination position at the same time


                                      MoveL is normally only used when a linear motion is explicitly desired


     August 1, 2022     Slide 47   OmniCore - Basic Programming


47


     —
     Programming Basic Movements
     MoveJ/MoveL Instructions


     MoveJ/MoveL Elements                                                 D. Zone (z50 = 50mm)
     – A. Movement type
     – B. Destination
     – C. Speed (v1000 = 1000 mm/s)
     – E. Tool


     August 1, 2022     Slide 48   OmniCore - Basic Programming
                                                                                                                     24
48

---

## หน้า 25

8/1/2022


     —
     Programming Basic Movements
     Inline Positions vs Named Positions


                                        It is good programming practice to name all robtargets (positions)


     August 1, 2022      Slide 49   OmniCore - Basic Programming


49


     —
     Programming Basic Movements
     Exercise - Draw a Shape


     Steps
     – Open program editor
     – Create new program
     – Jog to position
     – Create move-instruction
     – Name position


     August 1, 2022      Slide 50   OmniCore - Basic Programming
                                                                                                                   25
50

---

## หน้า 26

8/1/2022


     —
     Programming Basic Movements
     MoveC Instruction


     General                                                     MoveC Elements
     – Circular movement towards target                          – A. Movement type
     – Two position arguments, circle point and                  – B. Circle point
       desination point                                          – C. Destination point
     – Circle point half way for best accuracy                   – D. Speed
                                                                 – E. Zone
                                                                 – F. Tool


                          If circle point is too close to start/destination point, a warning message will appear


     August 1, 2022    Slide 51   OmniCore - Basic Programming


51


     —
     Programming Basic Movements
     Exercise - Draw a Circle


     Steps
     – Create new program
     – Jog to circle point
     – Create MoveC-instruction
     – Jog to destination point
     – Modify position


     August 1, 2022    Slide 52   OmniCore - Basic Programming
                                                                                                                         26
52

---

## หน้า 27

8/1/2022


     —
     RobotStudio - RAPID Editor


53


     —
     RobotStudio - RAPID Editor
     Objectives


     After this chapter you should be able to:
     – Connect to a controller from RobotStudio
     – Find the most common buttons and windows in the user interface
     – Recall some of the most common features
     – Add instructions without knowing their syntax
     – Edit backup and individual modules


     August 1, 2022   Slide 54   OmniCore - Basic Programming
                                                                              27
54

---

## หน้า 28

8/1/2022


     —
     RobotStudio - RAPID Editor
     Connecting to Controller


     Controller tab -> Add Controller
     – A. Connect to a controller via service port
     – B. Connect to a controller on same network
     – C. Start a virtual controller and connect to it


     August 1, 2022    Slide 55   OmniCore - Basic Programming


55


     —
     RobotStudio - RAPID Editor
     RAPID-Tab Overview


     – A. Request/Release write access                     – F. Snippet, Insert premade or custom        – K. Apply changes, pushes changes to
     – B. Synchronize to Station/RAPID                       made code snippets                            controller

     – C. Comment/Uncomment,                               – G. Instruction lists, insert instructions   – L. Options for Tasks, Runmode and
       Indent/Unindent, Cut, Copy Paste                      from list                                     program

     – D. Format, options to automatically                 – H. Navigate in your code                    – M. Adjust robtargets
       indent and adjust case of RAPID code                – I. Find/Replace                             – N. Modify Position
     – E. Expand/Collapse all outlining                    – J. Compare, compare files or folders        – O. Options for testing and debugging


     August 1, 2022    Slide 56   OmniCore - Basic Programming
                                                                                                                                                        28
56

---

## หน้า 29

8/1/2022


     —
     RobotStudio - RAPID Editor
     Windows


     Code Window
     – A. Controller
     – B. Open files related to controller (Modules)
     – C. Text size settings
     – D. Editor


     August 1, 2022    Slide 57   OmniCore - Basic Programming


57


     —
     RobotStudio - RAPID Editor
     Windows


     Controller Window
     – Shows all connected controllers, both real and
       virtual
     – Open modules with double click


     August 1, 2022    Slide 58   OmniCore - Basic Programming
                                                                       29
58

---

## หน้า 30

8/1/2022


     —
     RobotStudio - RAPID Editor
     Windows


     Files Window
     – Shows all opened backups
     – Shows separately opened modules


     August 1, 2022    Slide 59   OmniCore - Basic Programming


59


     —
     RobotStudio - RAPID Editor
     Windows


     RAPID Watch
     – Shows current value
       for any variable
     – Right click a variable
       to add watch


     August 1, 2022    Slide 60   OmniCore - Basic Programming
                                                                       30
60

---

## หน้า 31

8/1/2022


     —
     RobotStudio - RAPID Editor
     Features


     Format document
     – Formats your code with correct indentation and character case
     – Works for references to custom data/routines as well as built in data/routines


     August 1, 2022    Slide 61   OmniCore - Basic Programming


61


     —
     RobotStudio - RAPID Editor
     Features


     Snippet
     – Insert prepared code snippets
            • Use built-in snippet from RobotStudio
            • Save your own snippets


     August 1, 2022    Slide 62   OmniCore - Basic Programming
                                                                                              31
62

---

## หน้า 32

8/1/2022


     —
     RobotStudio - RAPID Editor
     Features


     Instruction List
     – Add complete instructions from list
     – Reflects the lists found in FlexPendant
     – Custom lists (M.C 1-3) configurable in MMC


     August 1, 2022    Slide 63   OmniCore - Basic Programming


63


     —
     RobotStudio - RAPID Editor
     Features


     Navigation
     Quickly navigate your
     code with:
     – A. Navigate
       backward/forward
     – B. QuickFind
     – C. Go to line
     – D. Routine picklist
     – E. Go to definition


     August 1, 2022    Slide 64   OmniCore - Basic Programming
                                                                       32
64

---

## หน้า 33

8/1/2022


     —
     RobotStudio - RAPID Editor
     Features


     Compare*
     Easily compare:
     – Folders, e.g., compare two backups
     – Files, any textfiles can be compared
     – Controller Version and Editor
     – Controller Version and File
     – Editor and file


     With possibility to ignore:
     – Insignificant changes in backinfo
     – PERS variable values
     – Comments, character case and white spaces


     *This function needs premium license


     August 1, 2022      Slide 65   OmniCore - Basic Programming


65


     —
     RobotStudio - RAPID Editor
     Features


     Adjust Robtargets*
     Easily change wobj or tool used in path


     *This function needs premium license


     August 1, 2022      Slide 66   OmniCore - Basic Programming
                                                                         33
66

---

## หน้า 34

8/1/2022


     —
     RobotStudio - RAPID Editor
     Features


     RAPID Data Editor*
     – Direct access to RAPID data
     – Show one datatype at the time
     – Editable value
     – Editable names (References also renamed)
     – Show robtarget orientation as Euler ZYX


     *This function needs premium license


     August 1, 2022     Slide 67   OmniCore - Basic Programming


67


     —
     RobotStudio - RAPID Editor
     Features


     Auto Complete
     – List shows up with options when typing
     – Select option and press TAB to complete word
     – Press TAB twice to insert complete
       instruction/declaration
     – Use Ctrl+SPACE to make list appear
     – Auto Complete works for data, instructions,
       routine calls, declarations


     August 1, 2022     Slide 68   OmniCore - Basic Programming
                                                                        34
68

---

## หน้า 35

8/1/2022


     —
     RobotStudio - RAPID Editor
     Edit a Backup


     – Opening a module file in a backup opens the
       complete backup
     – Auto complete works between modules
     – Easy to navigate between modules with files-
       window


     August 1, 2022     Slide 69   OmniCore - Basic Programming


69


     —
     RobotStudio - RAPID Editor
     Programs and Modules


     Right-click a task in the RAPID-node in the
     Controller window for program and module
     options
     – Load Program...
     – Save Program As...
     – Rename Program...
     – Delete Program (Unload from controller)
     – New Module...
     – Load Module...


     August 1, 2022     Slide 70   OmniCore - Basic Programming
                                                                        35
70

---

## หน้า 36

8/1/2022


     —
     RobotStudio - RAPID Editor
     Exercise - RobotStudio Basics (create a module and add code)


     Create a new module and add code using auto
     complete and snippet, then apply changes.


     Answer the questions in your student manual.


     August 1, 2022   Slide 71   OmniCore - Basic Programming


71


     —
     Program Structure


                                                                          36
72

---

## หน้า 37

8/1/2022


     —
     Program Structure
     Objectives


     After this chapter you should be able to:
     – Differentiate between program and system modules
     – Use a suitable module to store different data and routines in order to implement a good program structure
     – Describe the difference between constant, persistent and variable data


     August 1, 2022   Slide 73   OmniCore - Basic Programming


73


     —
     Program Structure
     Overview


     – Modules: Textfiles for structuring Data and Routines
     – Program: All loaded Program modules
     – Data: Variables and constants
     – Routines: sets of instructions
     – Instructions: Command for the controller, e.g.,
       MoveJ/MoveL/MoveC


     August 1, 2022   Slide 74   OmniCore - Basic Programming
                                                                                                                         37
74

---

## หน้า 38

8/1/2022


     —
     Program Structure
     Modules


     Overview                                                               Structuring Example 1
     – Modules are text files that may contain data and/or routines
       (sets of instructions)
     – Modules are used to structure your program
     – Different companies use different structuring methods
     – No limit how many modules can be used


                                                                            Structuring Example 2


     August 1, 2022   Slide 75   OmniCore - Basic Programming


75


     —
     Program Structure
     Modules


     System Module                                                          Program Module
     – Persists in memory when changing programs                            – Unloads together with program
     – Used for routines and data that is not program specific, such as:    – Used for program specific routines and data, for example:
            • Tools                                                              • Process routines
            • Work Objects


                                                  Modules are text files used to structure your code


     August 1, 2022   Slide 76   OmniCore - Basic Programming
                                                                                                                                                38
76

---

## หน้า 39

8/1/2022


     —
     Program Structure
     Program


     – Program = Loaded program modules
     – Saving program saves all Program modules
     – Unloading a program unloads all program modules
     – Loading a program loads modules in .pgf-file


                                           Saving/Loading a program does not affect system modules!


     August 1, 2022    Slide 77   OmniCore - Basic Programming


77


     —
     Program Structure
     Data


     Overview
     – Data is information stored in memory,
       accessed by its name
     – The data declaration declares the name of the
       data and the initial value
     – Any reference to a data will refer to the data
       stored in memory
     – Data can be predefined or user defined
     – Data can be variable or constant


     August 1, 2022    Slide 78   OmniCore - Basic Programming
                                                                                                            39
78

---

## หน้า 40

8/1/2022


     —
     Program Structure
     Data


     Predefined Data                                                                User Defined Data
     Some data are predefined in RAPID, for example:                                The user can define data, some examples:
     – Speeddata (v100, v500, v2000, etc.)                                          – Robtargets (positions for the robot)
     – Tooldata (tool0)                                                             – Numeric data (keep track of number of produced parts, etc.)
     – Zonedata (fine, z1, z50)                                                     – Speeddata


                      If predefined data don’t cover your needs, you can always create your own data instead


     August 1, 2022   Slide 79    OmniCore - Basic Programming


79


     —
     Program Structure
     Data


     Constant                                               Persistent                                    Variable
     – Constantly declared data                             – Persistent variable                         – Can be changed by program
     – Cannot be changed by the program                     – Can be changed by program                   – Goes back to initial value on program
                                                            – Does not loose its value on program           restart
                                                              restart


     August 1, 2022   Slide 80    OmniCore - Basic Programming
                                                                                                                                                          40
80

---

## หน้า 41

8/1/2022


     —
     Program Structure
     Instructions


     Information
     Instructions are commands you can give the
     controller, such as:
     – MoveJ ...
     – Incr ...
     – Set ...
     – + hundreds more


     August 1, 2022   Slide 81   OmniCore - Basic Programming


81


     —
     Program Structure
     Routines


     Information
     – A set of instructions that can be called from
       the program
     – Can be either a Procedure or a Function
     – Can be called from anywhere* in the task by
       typing its name followed by a semicolon, e.g.,
       RoutineExample;


     August 1, 2022   Slide 82   OmniCore - Basic Programming
                                                                      41
82

---

## หน้า 42

8/1/2022


     —
     Program Structure
     Exercise - Create a Program Structure


     Create a Module                                       Create a Routine                            Create a User Data
     – Create a new program                                – Add a routine                             – Add a numeric data variable to one of
     – Add a new program module                            – Add an instruction in your routine          your program modules

     – Add a system module                                 – Add a procedure call to your routine in   – Increase the value of the data in your
                                                             main                                        routine (AddIncr instruction)

                                                           – Test run the program from main (PP to     – Check the new value
                                                             main)


     August 1, 2022   Slide 83   OmniCore - Basic Programming


83


     —
     Program Structure
     Exercise - Program Structure Questions


     Answer the questions in your student manual


     – In what type of module would you put a routine that moves a part from a fixture to a pallet?
     – Why?


     – In what type of module would you store the definition of a pallet work object?
     – Why?


     – If you have a program that is stacking boxes on a pallet and it can only stack 5 boxes on top of each other, would you use variable or
       persistent data to keep track of the current amount of stacked boxes?
     – Why?


     August 1, 2022   Slide 84   OmniCore - Basic Programming
                                                                                                                                                        42
84

---

## หน้า 43

8/1/2022


     —
     Handling Inputs and Outputs


85


     —
     Handling Inputs and Outputs
     Objectives


     After this chapter you should be able to:
     – Find I/O signals in the FlexPendant
     – Set and simulate I/O signals
     – Change the content of the Favorite Signals list
     – Change the behavior of the programmable keys


     August 1, 2022   Slide 86   OmniCore - Basic Programming
                                                                      43
86

---

## หน้า 44

8/1/2022


     —
     Handling Inputs and Outputs
     The I/O Application


     Applications -> I/O -> Signals
     A. Filter
     B. Search
     C. Value
     D. Simulate


     August 1, 2022    Slide 87   OmniCore - Basic Programming


87


     —
     Handling Inputs and Outputs
     Set and Simulate Signals


     Set Signals                                                       Simulate Signals
     – Set to 1 or 0                                                   – Press the more options button (...) on a signal to simulate
     – Tap a signals value to change it                                – Programs act according to simulated value
     – Only output signals can be set                                  – Signals are not physically changed when simulated
     – Changes the physical value of the signal to the corresponding   – Not all input/output signals can be simulated
       value
     – Not all outputs can be manipulated this way


     August 1, 2022    Slide 88   OmniCore - Basic Programming
                                                                                                                                             44
88

---

## หน้า 45

8/1/2022


     —
     Handling Inputs and Outputs
     Programmable Keys


     Input                                                  Output                                           System
     – Pulse - Signal is pulsed to its inverted             Pulse - Signal is pulsed to its inverted value   – Move PP to Main - Moves Program
       value                                                Set to 1 - Signal is set to 1                      Pointer to main
     – Input can only be pulsed                             Set to 0 - Signal is set to 0
                                                            Toggle - Signal's current value is inverted
                                                            Press/Release - Signal is 1 while pressed (0
                                                            for inverted signals)


                                                      Remember to check the Allow in Auto option


     August 1, 2022    Slide 89   OmniCore - Basic Programming


89


     —
     Handling Inputs and Outputs
     Exercise - Using a Signal to Control the Grip Tool


     Open/Close the Grip Tool
     – Try to figure out which signal that controls the
       grip tool
     – Add the grip tool's signal to Favorite Signals
     – Toggle the signal and observe its behavior
     – Configure a Programmable Key to open and
       close the grip tool


     August 1, 2022    Slide 90   OmniCore - Basic Programming
                                                                                                                                                       45
90

---

## หน้า 46

8/1/2022


     —
     I/O Instructions


91


     —
     I/O Instructions
     Objectives


     After this chapter you should be able to:
     – Implement the most common RAPID instructions for inputs and outputs
     – Check the current value of an I/O signal


     August 1, 2022   Slide 92   OmniCore - Basic Programming
                                                                                   46
92

---

## หน้า 47

8/1/2022


     —
     I/O Instructions
     General Information


     IO Principle
     Electrical signals to and from the robot controller


     – A. Sensor
     – B. 24V signal
     – C. IO-unit
     – D. Fieldbus cable
     – E. Main computer
     – F. Program example, accessing a signal


     DO=Digital output, signal from the controller to external
     equipment, can be either 0 (low) or 1 (high)
     DI=Digital input, signal from external equipment to the controller,
     can be either 0 (low) or 1 (high)


     August 1, 2022    Slide 93   OmniCore - Basic Programming


93


     —
     I/O Instructions
     Examples of IO instructions


     Manipulate digital outputs
     – Set <Signal> - Sets digital output to 1
     – Reset <Signal> - Resets digital output to 0
     – SetDO <Signal>, <Value> - Sets digital output to value (1 or 0)
     – InvertDO <Signal> - Inverts the value of a signal
     – PulseDO <Signal> - Pulses a signal


     August 1, 2022    Slide 94   OmniCore - Basic Programming
                                                                                 47
94

---

## หน้า 48

8/1/2022


     —
     I/O Instructions
     Examples of IO instructions


     Read or wait for signal
     Read value of signal
     – DI, compare with 1 or 0 (IF di1=1 THEN)
     – DO, DOutput (<Signal>) ( IF Doutput(do4)=1 THEN)
     Wait for signal
     – WaitDI <Signal>, <Value> - Waits for digital input
     – WaitDO <Signal>, <Value> - Waits for digital output


     August 1, 2022     Slide 95   OmniCore - Basic Programming


95


     —
     I/O Instructions
     Exercise - Implement I/O Instructions


     Add the following functionality to a program
     – Wait for input
     – Set digital output
     – Run program
     – Reset digital output
     – Pulse digital output


     August 1, 2022     Slide 96   OmniCore - Basic Programming
                                                                        48
96

---

## หน้า 49

8/1/2022


     —
     Revolution Counters


97


     —
     Revolution Counters
     Objectives


     After this chapter you should be able to:
     – Explain what a revolution counter is and its purpose
     – Perform a revolution counter update
     – Check if a revolution counter update is needed


     August 1, 2022   Slide 98   OmniCore - Basic Programming
                                                                      49
98

---

## หน้า 50

8/1/2022


     —
     Revolution Counters
     Motor Positioning


     – Each motor has a device that reads the
       position of current motor revolution in
       radians, normally a resolver
     – Reset to 0 after full revolution


     August 1, 2022    Slide 99    OmniCore - Basic Programming


99


     —
     Revolution Counters
     What are Revolution Counters?


     – Keeps track of how many completed motor
       revolutions
     – Essential for controller to know current
       position of axes


     Example:
     Full revolution = π * 2 (~ 6.28 radians)
     Revolution counter: 3
     Current revolution: 2.54


     Motor position = 3 * 6.28 + 2.54 = 21.38 radians
     21.38 * gear ratio = Axis position


     August 1, 2022    Slide 100   OmniCore - Basic Programming
                                                                        50
100

---

## หน้า 51

8/1/2022


  —
  Revolution Counters
  Revolution Counter Update


                                                                       Sync Position Indicators
  – No special equipment
  – Visual approximation
  – Can only be updated to 0
  – Jog to sync position
  – Appearance of sync position indicators varies


  August 1, 2022      Slide 101   OmniCore - Basic Programming


101


  —
  Revolution Counters
  Why does a revolution counter "lose count"?


  Examples
  – Power failure, robot kept moving without connection to the controller (braking distance)
  – Power failure, failed MC with system image not saved (system data from last shutdown is lost)
  – Controller is shut down and the robot's battery is expended
  – The robot's axes have moved while powered off


                   Updating revolution counters is NOT the same as Calibration, which requires special equipment


  August 1, 2022      Slide 102   OmniCore - Basic Programming
                                                                                                                         51
102

---

## หน้า 52

8/1/2022


  —
  Revolution Counters
  Exercise


  Update the Revolution Counters                               Sync Position Indicators
  – Jog all axes to sync position
  – Ask trainer about sync indicators if uncertain
  – Update revolution counters
  – Jog or use MoveAbsJ to move all axes to 0°
  – Check sync indicators


  August 1, 2022    Slide 103   OmniCore - Basic Programming


103


  —
  Tools


                                                                                                52
104

---

## หน้า 53

8/1/2022


  —
  Tools
  Objectives


  After this chapter you should be able to:
  – Provide examples of why defining a tool is beneficial
  – Explain what a TCP is
  – Create tooldata and enter the tool's values
  – Define a TCP


  August 1, 2022   Slide 105   OmniCore - Basic Programming


105


  —
  Tools
  What is a Tool?


  Examples
  – Torch
  – Gripper
  – Pen
  – Spot welding servogun
  – Anything mounted on the turning disc


  August 1, 2022   Slide 106   OmniCore - Basic Programming
                                                                    53
106

---

## หน้า 54

8/1/2022


  —
  Tools
  Why Define a Tool?


  Examples                                Defined Tool           Tool Changed                       Redefined Tool
  – Correct path
  – Jog reorient
  – Jog in tool coordinates
  – Easy replacement if tool is
    changed


  August 1, 2022   Slide 107   OmniCore - Basic Programming


107


  —
  Tools
  Tool Center Point and tool0


  tool0                                                          Tool Center Point (TCP)
  – Default tool                                                 – Active tool's TCP defines the robot's position
  – TCP at the center of the turning disc                        – Can move with manipulator or be stationary
  – Same orientation as Base                                     – All movable TCPs are relative to tool0's TCP
  – Cannot be modified
  – Do not use tool0 when a tool is mounted


                         Using tool0 while tool is mounted may reduce the robot's accuracy and life span


  August 1, 2022   Slide 108   OmniCore - Basic Programming
                                                                                                                           54
108

---

## หน้า 55

8/1/2022


  —
  Tools
  Defining a TCP With 4 Points and Z Elongation


  August 1, 2022    Slide 109   OmniCore - Basic Programming


109


  —
  Tools
  Tooldata in RAPID


  – A. Robhold, does the robot hold the tool or is it a stationary tool
  – B. Position of the TCP, in wrist coordinate system
  – C. Rotation of the TCP
  – D. Mass
  – E. Center of gravity, in wrist coordinate system
  – F. Moment of inertia


                            Not defining tool load correctly may reduce the robot's accuracy and life span


  August 1, 2022    Slide 110   OmniCore - Basic Programming
                                                                                                                   55
110

---

## หน้า 56

8/1/2022


  —
  Tools
  Exercise - Create and Define a Tool


  Steps
  – Create a new tool from the jogging-/program
    data window
  – Define the TCP with 4 points and z
  – Enter the mass and center of gravity values
  – Test TCP by jogging reoriented
  – Test orientation of TCP by jogging in tool
    coordinates


  August 1, 2022   Slide 111   OmniCore - Basic Programming


111


  —
  Work Objects


                                                                    56
112

---

## หน้า 57

8/1/2022


  —
  Work Objects
  Objectives


  After this chapter you should be able to:
  – Provide examples of when to use work objects
  – Create and define work objects


  August 1, 2022   Slide 113   OmniCore - Basic Programming


113


  —
  Work Objects
  What is a Work Object?


  – User defined
    coordinate system
  – Has user frame,
    defined in world
  – Has object frame,
    defined in user frame


  August 1, 2022   Slide 114   OmniCore - Basic Programming
                                                                    57
114

---

## หน้า 58

8/1/2022


  —
  Work Objects
  Relations


  – User frame is relative
    to world coordinate
    system
  – Object frame is
    relative to user frame
  – Positions are relative
    to object frame


  August 1, 2022    Slide 115   OmniCore - Basic Programming


115


  —
  Work Objects
  Benefits


  Jogging                                                 Offline Programming                          Easy to Redefine
  – Jog in work object directions                         – Program offline in RobotStudio, redefine   – Just redefine work object if a fixture
                                                            work objects in real robot cell              moves after positions are programmed


  August 1, 2022    Slide 116   OmniCore - Basic Programming
                                                                                                                                                        58
116

---

## หน้า 59

8/1/2022


  —
  Work Objects
  Define a Work Object with 3 Points


  August 1, 2022   Slide 117   OmniCore - Basic Programming


117


  —
  Work Objects
  Exercise - Create and Use a Work Object


  Steps
  – Create a work object
  – Define with three points
  – Check work object
  – Create a routine to draw a shape in work
    object
  – Test run
  – Move paper and redefine work object
  – Test run


  August 1, 2022   Slide 118   OmniCore - Basic Programming
                                                                    59
118

---

## หน้า 60

8/1/2022


  —
  Saving Data


119


  —
  Saving Data
  Objectives


  After this chapter you should be able to:
  – Save/load programs and individual modules
  – Save a backup and restore from backup
  – Save system diagnostics


  August 1, 2022   Slide 120   OmniCore - Basic Programming
                                                                    60
120

---

## หน้า 61

8/1/2022


  —
  Saving Data
  Saving or Loading a Program


  – Saving program only saves program modules
  – Loading program unload all current program
    modules
  – System modules unaffected


  August 1, 2022   Slide 121   OmniCore - Basic Programming


121


  —
  Saving Data
  Saving or Loading a Module


  – Modules can be saved or loaded separately
  – Does not affect other modules


  August 1, 2022   Slide 122   OmniCore - Basic Programming
                                                                    61
122

---

## หน้า 62

8/1/2022


  —
  Saving Data
  Save a System Backup


                                                                    Settings -> Backup & Recovery -> Backup
  – Saves as a folder by default
  – Save as .tar-archive possible
  Contains:
  – BACKINFO, Information about the backup, safety configuration,
    RobotWare license, etc
  – HOME, a copy of the systems HOME-folder
  – RAPID, All modules in all tasks, including hidden
  – SYSPAR, all the controllers system parameters
  – System.xml, information about the system


                           Backup can be performed from FlexPendant, RobotStudio and via System input


  August 1, 2022    Slide 123   OmniCore - Basic Programming


123


  —
  Saving Data
  Restore a System Backup


                                                                    Settings -> Backup & Recovery -> Restore
  – Restores System Parameters, RAPID and HOME-folder
  – Possible to restore Safety configuration
  – Not possible to restore an edited backup in RobotWare 7


  August 1, 2022    Slide 124   OmniCore - Basic Programming
                                                                                                                     62
124

---

## หน้า 63

8/1/2022


  —
  Virtual Controller


125


  —
  Virtual Controller
  Objectives


  After this chapter you should be able to:
  – Create a virtual copy of a real system and use it for offline programming


  August 1, 2022   Slide 126   OmniCore - Basic Programming
                                                                                      63
126

---

## หน้า 64

8/1/2022


  —
  Virtual Controller
  Background


  What is a virtual controller?
  – RobotStudio uses virtual controllers for running the robots in a RobotStudio station
  – A virtual controller can be started without a station
  – Perfect for offline programming
  – Same software as real controller for:
  – Execute RAPID
  – Calculate robot motion
  – Handle I/O signals


  August 1, 2022    Slide 127   OmniCore - Basic Programming


127


  —
  Virtual Controller
  Create System from Backup


  Background
  – Create virtual copy from system backup
  – System can be started in a virtual controller and used for offline
    programming
  – Can have a transfer relation with a real controller


  August 1, 2022    Slide 128   OmniCore - Basic Programming
                                                                                                 64
128

---

## หน้า 65

8/1/2022


  —
  Virtual Controller
  Start a Virtual Controller


  – Open RobotStudio Controller-tab
  – Click on Add Controller
  – Click on Start Virtual Controller...
  – Select system and click OK


  August 1, 2022    Slide 129   OmniCore - Basic Programming


129


  —
  Virtual Controller
  Exercise - Create a Virtual System from Backup


  Create a virtual system from a backup
  Use your knowledge from this chapter to create a virtual copy of your course robot's system.


  August 1, 2022    Slide 130   OmniCore - Basic Programming
                                                                                                       65
130

---

## หน้า 66

8/1/2022


  —
  Assessment Exercise - Programming: Draw Shapes


131


  —
  Assessment Exercise - Programming: Draw Shapes
  Objectives


  The objective of this chapter is to confirm that you have acquired sufficient knowledge in the following areas:
  – Jogging an ABB robot
  – Program structure (modules, routines, data)
  – Move instructions (MoveJ, MoveL, MoveC)
  – Tools
  – Work objects
  – Test running programs and routines


  August 1, 2022   Slide 132   OmniCore - Basic Programming
                                                                                                                          66
132

---

## หน้า 67

8/1/2022


  —
  Assessment Exercise - Programming: Draw Shapes
  What should the program do?


  Specification
  The following is a list of what the robot should do in successive order:
  – Move to Home-position
  – Draw a Square
  – Move to Home-position
  – Draw a Circle
  – Move to Home-position
  – Draw a Triangle
  – Move to Home-position


  August 1, 2022    Slide 133   OmniCore - Basic Programming


133


  —
  Assessment Exercise - Programming: Draw Shapes
  Steps


                                                                             Structure Example
  – Create an overview-structure for your program
         • Decide how to split your programs in routines
         • Decide where to put Routines and Data
  – Create a tool
  – Create a work object
  – Create Modules and routines according to your structure
  – Add instructions to your routines
  – Test run each routine separately
  – Create main (add routine calls)
  – Test run complete program


  August 1, 2022    Slide 134   OmniCore - Basic Programming
                                                                                                       67
134

---

## หน้า 68

8/1/2022


  —
  Basic Functions


135


  —
  Basic Functions
  Objectives


  After this chapter you should be able to:
  – Explain what a RAPID function is
  – Use the functions Offs, RelTool, ClkRead and ValToStr in a program


  August 1, 2022   Slide 136   OmniCore - Basic Programming
                                                                               68
136

---

## หน้า 69

8/1/2022


  —
  Basic Functions
  What is a function?


  A function is a routine that return a value of a specific type


  A function call must always "take care of" the data returned


  Example of built in functions:
  – Offs
  – RelTool
  – ClkRead
  – ValToStr
  – CRobT


  August 1, 2022    Slide 137   OmniCore - Basic Programming


137


  —
  Basic Functions
  Offs


  – Offset robtarget's position in object coordinate system        A. Robtarget to offset
                                                                   X. 10 mm offset in the x-direction
                                                                   Y. 15 mm offset in the y-direction
                                                                   Z. 35 mm offset in the Z-direction


  August 1, 2022    Slide 138   OmniCore - Basic Programming
                                                                                                              69
138

---

## หน้า 70

8/1/2022


  —
  Basic Functions
  Exercise - Draw a Square Using Offs


  Draw a square using only one robtarget and Offs               Example
  – Create robtarget at first corner ON the paper, not at the
    approach position. Why?
  – How is your work object oriented?
  – Do you need to offset using negative values?


  Low speed when testing to avoid collision


  August 1, 2022   Slide 139   OmniCore - Basic Programming


139


  —
  Basic Functions
  RelTool (Relative Tool)


  – Offset robtarget's position and/or rotation in the tool     A. Robtarget to offset
    coordinate system                                           B. 10° rotational offset around the tool's x-axis (optional)
                                                                C. 25° rotational offset around the tool's z-axis (optional)
                                                                X. 5 mm offset in the tool's x-direction
                                                                Y. 0 mm offset in the tool's y-direction
                                                                Z. -40 mm offset in the tool's z-direction


  August 1, 2022   Slide 140   OmniCore - Basic Programming
                                                                                                                                     70
140

---

## หน้า 71

8/1/2022


  —
  Basic Functions
  Exercise - Draw a Square Using RelTool


  Draw a shape using only one robtarget and RelTool           Example
  – Repeat the Offs exercise but with RelTool
  – Adapt values to the tool coordinate system


  Low speed when testing to avoid collision


  August 1, 2022   Slide 141   OmniCore - Basic Programming


141


  —
  Basic Functions
  ValToStr (Value To String)


  Function                                                    Example
  Convert value of any data type to a string


  August 1, 2022   Slide 142   OmniCore - Basic Programming
                                                                              71
142

---

## หน้า 72

8/1/2022


  —
  Basic Functions
  ClkRead


  Function                                                    Example
  – Use clock data type as stop-watch for timing
  – Use ClkRead to read current value of clock variables


  August 1, 2022   Slide 143   OmniCore - Basic Programming


143


  —
  Basic Functions
  Exercise - Program Duration


  Find out the cycle time of your program
  1. Create clock, num and string variables
  2. Reset and start clock (ClkReset, ClkStart)
  3. Stop clock at end (ClkStop)
  4. Read clock value (ClkRead)
  5. Convert to string (ValToStr)
  6. Display time (UIMsgBox)


  August 1, 2022   Slide 144   OmniCore - Basic Programming
                                                                              72
144

---

## หน้า 73

8/1/2022


  —
  Assessment Exercise - Programming: Pick & Place


145


  —
  Assessment Exercise - Programming: Pick & Place
  Objectives


  The objective of this chapter is to confirm that you have acquired sufficient knowledge in the following areas:
  – Program structure (modules, routines, data)
  – Tools and work objects
  – Inputs and outputs
  – Instructions and functions


  August 1, 2022   Slide 146   OmniCore - Basic Programming
                                                                                                                          73
146

---

## หน้า 74

8/1/2022


  —
  Assessment Exercise - Programming: Pick & Place
  What should the program do?


  Specification
  – Wait for start
  – Pick up item, if present (wait for di or operator input)
  – Move to home-position (if necesary), transport path?
  – Simulate item being processed, e.g., put down - wait 5 seconds - pick up
  – Place on out pallet
  – Stop when out pallet is full


  August 1, 2022      Slide 147   OmniCore - Basic Programming


147


  —
  Assessment Exercise - Programming: Pick & Place
  Planning and Execution


  To think about                                                        Example of using comments
  – Solutions, how will you solve each aspect of your program?
  – What statements and instructions can you use?
  – Structure, where will you store robtargets and other data?
  – What tools, work objects and signals will you use?


                   Comments can be useful to create an outline of your program and make it easier to understand


  August 1, 2022      Slide 148   OmniCore - Basic Programming
                                                                                                                        74
148

---

## หน้า 75

8/1/2022


  —
  Basic Instructions and Program Logic


149


  —
  Basic Instructions and Program Logic
  Objectives


  After this chapter you should be able to:
  – Manipulate variable values
  – Implement IF, ELSE, ELSEIF and TEST
  – Implement FOR and WHILE loop
  – Add operator communication messages
  – Add a suitable stop instruction


  August 1, 2022   Slide 150   OmniCore - Basic Programming
                                                                    75
150

---

## หน้า 76

8/1/2022


  —
  Basic Instructions and Program Logic
  Introduction


  Statements                                                  Instructions
  RAPID is formally built of statements                       Most commonly used instructions can be categorized in the
  In this chapter we refer to statements as instructions      following groups:
                                                              – Assign instructions
                                                              – Choice instructions
                                                              – Loop instructions
                                                              – Stop instructions
                                                              – Operator communication instructions


  August 1, 2022   Slide 151   OmniCore - Basic Programming


151


  —
  Basic Instructions and Program Logic
  Assign Instructions


  Instructions that assign a value to a variable
  – Assign a variable <ID>:=<EXP>;
  – Increase a num variable Incr <ID>;
  – Decrease a num variable Decr <ID>;
  – Set a num varable to 0 Clear <ID>;


  August 1, 2022   Slide 152   OmniCore - Basic Programming
                                                                                                                                76
152

---

## หน้า 77

8/1/2022


  —
  Basic Instructions and Program Logic
  Choice Instructions


  IF                                                                  Compact IF
  Do something depending on a condition                               Used when a single instruction is to be executed when a condition
  – IF                                                                is met

         • ELSEIF
         • ELSE


  A = Condition
  (Any expression evaluating                                          A = Condition

  to either TRUE or FALSE)                                            (Any expression evaluating to either TRUE or FALSE)

  B = Instructions                                                    B = Instruction
                                                                      (A single instruction to be executed if condition is met)


  August 1, 2022     Slide 153   OmniCore - Basic Programming


153


  —
  Basic Instructions and Program Logic
  Choice Instructions


  TEST
  Used when different instructions are to be executed depending on
  the value of an expression or data


  A. Value to test
  B. Test values
  C. If the value to test does not equal any of the test values the
     code after DEFAULT: will be executed.


  August 1, 2022     Slide 154   OmniCore - Basic Programming
                                                                                                                                                77
154

---

## หน้า 78

8/1/2022


  —
  Basic Instructions and Program Logic
  Loop Instructions


  FOR
  The FOR loop repeats code a number of times


  A. Name of the counter, e.g., "i", "counter", "iteration"
  B. Start value (inclusive)
  C. Number where to stop (inclusive)


  August 1, 2022    Slide 155   OmniCore - Basic Programming


155


  —
  Basic Instructions and Program Logic
  Loop Instructions


  WHILE
  Repeats a number of instructions as long as a condition is met


  A. Condition to continue looping


                                                               Watch out for infinite loops


  August 1, 2022    Slide 156   OmniCore - Basic Programming
                                                                                                    78
156

---

## หน้า 79

8/1/2022


  —
  Basic Instructions and Program Logic
  Stop Instructions


  3 Instructions
  – Stop, stops program execution after the robot has finished the
    current movement


  – Break, stops program execution immediately


  – EXIT, stops program execution immediately and removes PP


  August 1, 2022   Slide 157   OmniCore - Basic Programming


157


  —
  Basic Instructions and Program Logic
  Operator Communication Instructions


  One Way Communication
  None of the following instructions wait for a response from the
  operator
  – TPWrite, writes a text to the operator window, successive
    TPWrite is showed as a list
  – TPErase, clears all texts from the operator window


  – UIMsgWrite, Shows a message in the operator window,
    successive UIMsgWrite replaces previous UIMsgWrite
  – UIMsgWriteAbort, removes UIMsgWrite message from the
    operator window


  August 1, 2022   Slide 158   OmniCore - Basic Programming
                                                                           79
158

---

## หน้า 80

8/1/2022


  —
  Basic Instructions and Program Logic
  Operator Communication Instructions


  Two Way Communication
  Messages that needs confirmation from operator
  – UIMsgBox, Writes a message on the screen that needs the
    operator to press ok before it continues


  August 1, 2022   Slide 159   OmniCore - Basic Programming


159


  —
  Basic Instructions and Program Logic
  Exercises


  Exercise 01 (Messages)                                 Exercise 02 (Program Logic)   Exercise 03 (Spot the Problem)
  Write 4 different messages using a FOR
  loop. Implement IF, ELSE and ELSEIF.


  Display a message with required input
  from operator.


  Write 4 different messages using a WHILE
  loop. Implement TEST and INCR.


  August 1, 2022   Slide 160   OmniCore - Basic Programming
                                                                                                                              80
160

---

## หน้า 81

8/1/2022


  —
  Creating Custom Cards and Dashboards


161


  —
  Creating Custom Cards and Dashboards
  Objectives


  After this chapter you should be able to:
  – Create custom made cards that display RAPID data or I/O signals.
  – Create new dashboards that display both custom and pre-defined cards.
  – Add/remove/re-arrange cards in existing dashboards.


  August 1, 2022   Slide 162   OmniCore - Basic Programming
                                                                                  81
162

---

## หน้า 82

8/1/2022


  —
  Creating Custom Cards and Dashboards
  Overview


                                                              Dashboards
                                                              – Custom build dashboards with up to 6 different cards.
                                                              – Up to 30 customized dashboards at the same time.
                                                              – Switch easily between dashboards to find values of interest for
                                                                your job role.


                                                              Cards
                                                              – Display controller parameters, RAPID data, I/O signal values and
                                                                more on your custom cards.
                                                              – Possible to hundreds of custom cards at the same time.
                                                              – Use several pre-made system cards.


  August 1, 2022   Slide 163   OmniCore - Basic Programming


163


  —
  Creating Custom Cards and Dashboards
  Exercise - Create a New Dashboard


  Steps
  – Load or create program
  – Create custom cards
  – Create new dashboard
  – Assign cards to dashboard
  – Change display order


  August 1, 2022   Slide 164   OmniCore - Basic Programming
                                                                                                                                         82
164

---

## หน้า 83

8/1/2022


  —
  Add a Digital Input/Output Signal


165


  —
  Add a Digital Input/Output Signal
  Objectives


  After this chapter you should be able to:
  – Create a digital input/output signal using RobotStudio


  August 1, 2022   Slide 166   OmniCore - Basic Programming
                                                                    83
166

---

## หน้า 84

8/1/2022


  —
  Add a Digital Input/Output Signal
  Exercise - Create a Digital Output Signal


  Steps
  – Connect to controller
  – Create new signal
  – Enter name and type of signal


  Wait for information about which device
  and device mapping to use.


  August 1, 2022   Slide 167   OmniCore - Basic Programming


167


                                                                    84

---
