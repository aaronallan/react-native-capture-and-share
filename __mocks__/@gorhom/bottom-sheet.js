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

  if (!open) return null;

  const Backdrop = props.backdropComponent;
  return React.createElement(
    View,
    { testID: 'mock-bottom-sheet' },
    Backdrop
      ? React.createElement(Backdrop, {
          animatedIndex: { value: 0 },
          animatedPosition: { value: 0 },
        })
      : null,
    props.children
  );
});

const BottomSheetView = function BottomSheetView(props) {
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
