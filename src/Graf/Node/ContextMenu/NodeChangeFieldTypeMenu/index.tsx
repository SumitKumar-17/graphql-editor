import React, { useEffect, useState } from 'react';
import { ResolveCreateField } from '@/GraphQL/Resolve';
import { ParserField } from 'graphql-js-tree';
import { useTreesState } from '@/state/containers/trees';
import {
  Menu,
  MenuScrollingArea,
  MenuSearch,
  TypedMenuItem,
} from '@/Graf/Node/components';

interface NodeChangeFieldTypeMenuProps {
  node: ParserField;
  fieldIndex: number;
  hideMenu: () => void;
}

export const NodeChangeFieldTypeMenu: React.FC<NodeChangeFieldTypeMenuProps> =
  ({ node, fieldIndex, hideMenu }) => {
    const { tree, setTree, libraryTree } = useTreesState();
    const [menuSearchValue, setMenuSearchValue] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredNodes = ResolveCreateField(
      node,
      tree.nodes.concat(libraryTree.nodes),
    )
      ?.sort((a, b) => (a.name > b.name ? 1 : -1))
      .filter((a) =>
        a.name.toLowerCase().includes(menuSearchValue.toLowerCase()),
      );

    useEffect(() => {
      if (!menuSearchValue) {
        setSelectedIndex(0);
      }
    }, [menuSearchValue]);

    const fNLength = filteredNodes?.length || 1;
    const selectedNodeIndex =
      (selectedIndex < 0 ? fNLength - selectedIndex : selectedIndex) % fNLength;

    const onNodeClick = (f: ParserField) => {
      if (node.args) {
        node.args[fieldIndex].data.type = f.data.type;
        node.args[fieldIndex].type.name = f.name;
      }
      hideMenu();
      setTree({ ...tree });
    };
    return (
      <Menu
        menuName={'Change type'}
        onScroll={(e) => e.stopPropagation()}
        hideMenu={hideMenu}
      >
        <MenuSearch
          onSubmit={() => {
            if (filteredNodes && filteredNodes.length > 0) {
              onNodeClick(filteredNodes[selectedNodeIndex]);
            }
          }}
          value={menuSearchValue}
          onChange={setMenuSearchValue}
          onClear={() => setMenuSearchValue('')}
        />
        <MenuScrollingArea
          controls={{
            arrowDown: () => setSelectedIndex((s) => s + 1),
            arrowUp: () => setSelectedIndex((s) => s - 1),
          }}
        >
          {filteredNodes?.map((f, i) => (
            <TypedMenuItem
              key={f.name}
              dataType={f.type.name}
              type={f.name}
              selected={i === selectedNodeIndex}
              onClick={() => {
                onNodeClick(f);
              }}
            />
          ))}
        </MenuScrollingArea>
      </Menu>
    );
  };
