const React = require('react');
const { View } = require('react-native');

const BottomSheet = React.forwardRef(function BottomSheet(props, ref) {
  const [open, setOpen] = React.useState((props.index ?? -1) >= 0);

  React.useImperativeHandle(ref, () => ({
    expand: () => setOpen(true),
    close: () => {
      setOpen(false);
      props.onClose?.();
    },
    snapToIndex: (index) => setOpen(index >= 0),
  }));

  // Real gorhom BottomSheet keeps its content mounted at all times (translated off-screen
  // when closed) rather than unmounting it - production code relies on that (e.g.
  // useShareTray's expand-after-layout wiring needs onLayout to fire before expand() is ever
  // called, which requires this content to already be mounted while closed).
  const Backdrop = props.backdropComponent;
  return React.createElement(
    View,
    { testID: 'mock-bottom-sheet' },
    Backdrop
      ? React.createElement(Backdrop, {
          animatedIndex: { value: open ? 0 : -1 },
          animatedPosition: { value: 0 },
        })
      : null,
    props.children
  );
});

const BottomSheetView = function BottomSheetView(props) {
  // Real native views always fire onLayout once mounted/updated; react-test-renderer never
  // does, so this simulates it - production code (e.g. useShareTray's expand-after-layout
  // wiring) relies on onLayout actually firing.
  React.useEffect(() => {
    props.onLayout?.({ nativeEvent: { layout: { height: 400 } } });
  });
  return React.createElement(View, props, props.children);
};

const BottomSheetScrollView = function BottomSheetScrollView(props) {
  return React.createElement(View, props, props.children);
};

const BottomSheetBackdrop = function BottomSheetBackdrop(props) {
  return React.createElement(View, { testID: 'bottom-sheet-backdrop', ...props });
};

module.exports = BottomSheet;
module.exports.default = BottomSheet;
module.exports.BottomSheetView = BottomSheetView;
module.exports.BottomSheetScrollView = BottomSheetScrollView;
module.exports.BottomSheetBackdrop = BottomSheetBackdrop;
