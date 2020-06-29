import * as React from "react"
import {
  ListRenderItem,
  RefreshControl,
  View,
} from "react-native"
import { FlatList } from 'react-navigation'
import { observer } from "mobx-react"
import { SwipeRow } from "react-native-swipe-list-view"

import { ContentListProps as Props } from "./content-list.props"
import {
  ContentListStyle as Style,
  RefreshControlColors,
} from "./content-list.style"

import {
  ContentListItem,
  ContentListItemSkeleton,
} from "../content-list-item"
import { Text } from "../../components/text"

import { Content } from "../../models/content"

@observer
export class ContentList extends React.Component<Props> {
  listItemRefs = {} as { [key: string]: React.RefObject<SwipeRow<{}>> }

  private keyExtractor = (content: Content) => `${this.props.lastFetched}${content.url}`

  private onEndReach = () => {
    if (
      this.props.onFetchMore &&
      this.props.hasFetched &&
      !this.props.hasFetchedAll
    ) {
      this.props.onFetchMore()
    }
  }

  private onItemSwipeOpen = (key: string, ref: React.RefObject<SwipeRow<{}>>) => {
    Object.keys(this.listItemRefs).forEach((refKey: string) => {
      if (refKey !== key) {
        this.listItemRefs[refKey].current.closeRow()
      }
    })
    this.listItemRefs[key] = ref
  }

  private onItemSwipeClose = (key: string) => {
    delete this.listItemRefs[key]
  }

  private onScrollBeginDrag = () => {
    Object.keys(this.listItemRefs).forEach((refKey: string) => {
      this.listItemRefs[refKey].current.closeRow()
    })
  }

  render() {
    return (
      <FlatList<Content>
        data={this.props.data}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderContent}
        refreshControl={
          <RefreshControl
            colors={RefreshControlColors}
            refreshing={this.props.hasFetched && this.props.isLoading}
            onRefresh={this.props.onRefresh}
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        ListEmptyComponent={this.renderEmpty}
        ListHeaderComponent={this.props.titleLabelTx ? (
          <Text
            tx={this.props.titleLabelTx}
            color="likeGreen"
            align="center"
            weight="600"
            style={Style.Header}
          />
        ) : null}
        ListFooterComponent={this.renderFooter}
        contentContainerStyle={this.props.data.length > 0 ? null : Style.Full}
        style={[Style.Full, this.props.style]}
        onEndReached={this.onEndReach}
        onScrollBeginDrag={this.onScrollBeginDrag}
      />
    )
  }

  private renderContent: ListRenderItem<Content> = ({ item: content }) => (
    <ContentListItem
      content={content}
      isShowBookmarkIcon={this.props.isShowBookmarkIcon}
      onToggleBookmark={this.props.onToggleBookmark}
      onToggleFollow={this.props.onToggleFollow}
      onPress={this.props.onPressItem}
      onPressUndoButton={this.props.onPressUndoButton}
      onSwipeOpen={this.onItemSwipeOpen}
      onSwipeClose={this.onItemSwipeClose}
    />
  )

  private renderEmpty = () => {
    if (this.props.hasFetched) {
      return (
        <View style={Style.Empty}>
          <Text
            tx="readerScreen.emptyLabel"
            color="grey9b"
            size="large"
            align="center"
            weight="600"
          />
        </View>
      )
    }

    return (
      <View>
        {[...Array(7)].map((_, i) => <ContentListItemSkeleton key={`${i}`} />)}
      </View>
    )
  }

  private renderFooter = () => {
    return this.props.isFetchingMore ? (
      <View style={Style.Footer}>
        <ContentListItemSkeleton />
      </View>
    ) : null
  }
}
