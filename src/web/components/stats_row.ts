import { StatsArgs } from '../../model';
import { WebComponent } from './web_component';

export class StatsRowComponent implements WebComponent {
  private readonly identifier: string;
  private readonly args: StatsArgs;
  private readonly blank: string = JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  public constructor(args: StatsArgs) {
    this.args = args;
    this.identifier = `${args.username.replaceAll('.', '_')}_barChart`;
  }

  public getContent(): string {
    return `            <div class="row">
              <div class="col-md-8 grid-margin stretch-card">
                <div class="card">
                  <div class="card-body">
                    <canvas id="${this.identifier}"></canvas>
                  </div>
                </div>
              </div>
            </div>
`;
  }
  public getScript(): string {
    return `        new Chart($('#${this.identifier}').get(0).getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
            datasets: [
              {
                label: 'VSCode',
                data: ${this.args.vscode ? JSON.stringify(this.args.vscode) : this.blank},
                backgroundColor: '#34A1EA',
              },
              {
                label: 'Gitlab',
                data: ${this.args.gitEvents ? JSON.stringify(this.args.gitEvents) : this.blank},
                backgroundColor: '#DB4128',
              },
              {
                label: 'DB Queries',
                data: ${this.args.dbQueries ? JSON.stringify(this.args.dbQueries) : this.blank},
                backgroundColor: '#31648C',
              },
              {
                label: 'AWS',
                data: ${this.args.aws ? JSON.stringify(this.args.aws) : this.blank},
                backgroundColor: '#F79400',
                hidden: true,
              },
              {
                label: 'Teams',
                data: ${this.args.teams ? JSON.stringify(this.args.teams) : this.blank},
                backgroundColor: '#7480E8',
                hidden: true,
              },
            ],
          },
          options: {
            label: 'test',
            plugins: {
              title: {
                display: true,
                text: '${this.args.name}',
              },
            },
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
            legend: {
              display: true,
            },
            elements: {
              point: {
                radius: 0,
              },
            },
          },
        });
`;
  }
}
