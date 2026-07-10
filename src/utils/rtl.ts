// src/utils/rtl.ts
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export function rtl(styles: StyleProp<ViewStyle | TextStyle>, isRTL: boolean): StyleProp<ViewStyle | TextStyle> {
  if (!isRTL) return styles;
  
  if (Array.isArray(styles)) {
    return styles.map(s => rtl(s, isRTL));
  }
  
  const newStyles: any = { ...styles };
  
  // Swap horizontal margins/paddings
  const horizontalProps = [
    'marginLeft', 'marginRight',
    'paddingLeft', 'paddingRight',
    'left', 'right',
    'borderLeftWidth', 'borderRightWidth',
    'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomLeftRadius', 'borderBottomRightRadius',
  ];
  
  horizontalProps.forEach(prop => {
    const rtlProp = prop.replace('Left', 'TEMP').replace('Right', 'Left').replace('TEMP', 'Right');
    if (newStyles[prop] !== undefined && newStyles[rtlProp] === undefined) {
      newStyles[rtlProp] = newStyles[prop];
    } else if (newStyles[rtlProp] !== undefined && newStyles[prop] === undefined) {
      newStyles[prop] = newStyles[rtlProp];
    }
  });
  
  // Handle textAlign
  if (newStyles.textAlign === 'left') newStyles.textAlign = 'right';
  else if (newStyles.textAlign === 'right') newStyles.textAlign = 'left';
  
  return newStyles;
}

export function getRTLStyles(isRTL: boolean) {
  return {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    textAlign: isRTL ? 'right' : 'left',
  };
}