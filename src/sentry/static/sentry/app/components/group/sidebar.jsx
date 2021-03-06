import React from 'react';

import ApiMixin from '../../mixins/apiMixin';
import GroupParticipants from './participants';
import GroupReleaseStats from './releaseStats';
import GroupState from '../../mixins/groupState';
import IndicatorStore from '../../stores/indicatorStore';
import TagDistributionMeter from './tagDistributionMeter';
import {t} from '../../locale';

const GroupSidebar = React.createClass({
  propTypes: {
    group: React.PropTypes.object,
  },

  contextTypes: {
    location: React.PropTypes.object
  },

  mixins: [
    ApiMixin,
    GroupState
  ],

  toggleSubscription() {
    let group = this.props.group;
    let project = this.getProject();
    let org = this.getOrganization();
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate({
      orgId: org.slug,
      projectId: project.slug,
      itemIds: [group.id],
      data: {
        isSubscribed: !group.isSubscribed
      }
    }, {
      complete: () => {
        this.api.request(`/issues/${group.id}/participants/`, {
          success: (data) => {
            this.setState({participants: data});
            IndicatorStore.remove(loadingIndicator);
          }
        });
      }
    });
  },

  render() {
    let project = this.getProject();
    let projectId = project.slug;
    let orgId = this.getOrganization().slug;
    let defaultEnvironment = project.defaultEnvironment;
    let group = this.getGroup();
    let participants = (this.state || {}).participants || [];

    return (
      <div className="group-stats">
        <GroupReleaseStats
            group={group}
            location={this.context.location}
            defaultEnvironment={defaultEnvironment} />

        <h6><span>{t('Tags')}</span></h6>
        {group.tags.map((data) => {
          return (
            <TagDistributionMeter
              key={data.key}
              orgId={orgId}
              projectId={projectId}
              group={group}
              name={data.name}
              tag={data.key} />
          );
        })}
        {participants.length !== 0 &&
          <GroupParticipants participants={participants} />
        }

        <h6><span>{t('Notifications')}</span></h6>
        {group.isSubscribed ?
          <p className="help-block">{t('You\'re subscribed to this issue and will get notified when updates happen.')}</p>
        :
          <p className="help-block">{t('You\'re not subscribed in this issue.')}</p>
        }
        <a className={`btn btn-default btn-subscribe ${group.isSubscribed && 'subscribed'}`}
           onClick={this.toggleSubscription}>
          <span className="icon-signal" /> {group.isSubscribed ? t('Unsubscribe') : t('Subscribe')}
        </a>
      </div>
    );
  }
});

export default GroupSidebar;
