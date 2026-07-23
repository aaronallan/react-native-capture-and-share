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
  return React.createElement(View, { testID: 'mock-bottom-sheet' }, props.children);
});

const BottomSheetView = function BottomSheetView(props) {
  return React.createElement(View, props, props.children);
};

const BottomSheetScrollView = function BottomSheetScrollView(props) {
  return React.createElement(View, props, props.children);
};

module.exports = BottomSheet;
module.exports.default = BottomSheet;
module.exports.BottomSheetView = BottomSheetView;
module.exports.BottomSheetScrollView = BottomSheetScrollView;
