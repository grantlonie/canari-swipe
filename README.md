# canari-swipe

Component used to swipe pages and other content.

## Usage

## todo
tests

## Properties

| Property          | Type   | Default  | Details                                                                                                     |
| ----------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| swipeAmount       | Number | Required | The amount, in pixels, that the componet will swipe if                                                      |
| startIndex        | Number | 0        | First index on mounting                                                                                     |
| desiredIndex      | Number | 0        | Specify the index for controlling the Swiper externally                                                     |
| visibleCount      | Number | 1        | Amount of visible selections in the swiper                                                                  |
| horizontal        | Bool   | true     | true - swipe horizontal, false - swipe vertically                                                           |
| minimumSwipeSpeed | Number | 3000     | Minimum speed that swiping will go after releasing touch/mouse                                              |
| wrapAround        | Bool   | false    | true - wrap selection around to front, false - stop swiping at the beginning and end of selection list      |
| neighborsOnly     | Bool   | false    | true - load only current selection and immediate neighbors, false - load all selections                     |
| detent            | Number | false    | If !neighborsOnly, true - stop swiping exactly on edge of selection, false - swiping can stop mid-selection |
| deceleration      | Number | 1        | If !neightborsOnly, how quickly the carousel slows down                                                     |
| swipeRatio        | Number | 1        | An amount to scale the swiping down or up                                                                   |
| isControlled      | Bool   | false    | Remove transition between selection changes                                                                 |
