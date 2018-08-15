# canari-swipe

Component used to swipe pages and other content.

## Usage


## Properties

| Property               | Type     | Default  | Details                                                                                                                        |
| ---------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| swipeAmount            | Number   | Required | The amount, in pixels, that the componet will swipe                                                                            |
| firstSelection         | Number   | 0        | First selection on mounting                                                                                                    |
| desiredSelection       | Number   | 0        | Specify the selection for controlling the Swiper externally                                                                    |
| visibleCount           | Number   | 1        | Amount of visible selections in the swiper                                                                                     |
| horizontal             | Bool     | true     | true - swipe horizontal, false - swipe vertically                                                                              |
| minimumSwipeSpeed      | Number   | 3000     | Minimum speed that swiping will go after releasing touch/mouse                                                                 |
| carousel               | Bool     | false    | true - load all selections and swipe through multiple selections, false - load only current selection and immediate neighbors, |
| wrapAround             | Bool     | false    | If !carousel, true - wrap selection around to front, false - stop swiping at the beginning and end of selection list           |
| detent                 | Number   | false    | If carousel, true - stop swiping exactly on edge of selection, false - swiping can stop mid-selection                          |
| deceleration           | Number   | 1        | If carousel, how quickly the carousel slows down                                                                               |
| swipeRatio             | Number   | 1        | An amount to scale the swiping down or up                                                                                      |
| isControlled           | Bool     | false    | Remove transition between selection changes                                                                                    |
| resetSwiper            | Bool     | false    | If true, reset the swiper back to firstSelection                                                                               |
| startSwiping           | Callback | NA       | Callback function once swiping has started                                                                                     |
| updateCurrentSelection | Callback | NA       | Callback function after a selection has changed                                                                                |
